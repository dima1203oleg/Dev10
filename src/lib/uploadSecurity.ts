import net from 'node:net';
import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from '../middleware/api.ts';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]);

const extensionByMime: Record<string, Set<string>> = {
  'application/pdf': new Set(['.pdf']),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': new Set(['.docx']),
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': new Set(['.xlsx']),
  'image/jpeg': new Set(['.jpg', '.jpeg']),
  'image/png': new Set(['.png']),
};

export interface VerifiedUpload {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export async function verifyUpload(buffer: Buffer, originalName: string): Promise<VerifiedUpload> {
  if (!buffer.length) throw new ApiError(400, 'EMPTY_FILE', 'The uploaded file is empty.');
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !allowedMimeTypes.has(detected.mime)) {
    throw new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'The file content is not an allowed document type.');
  }

  const extension = path.extname(originalName).toLowerCase();
  if (!extensionByMime[detected.mime]?.has(extension)) {
    throw new ApiError(415, 'FILE_EXTENSION_MISMATCH', 'The file extension does not match its content.');
  }

  const baseName = path.basename(originalName).normalize('NFKC').replace(/[^\p{L}\p{N}._ -]/gu, '_');
  if (!baseName || baseName === '.' || baseName === '..') {
    throw new ApiError(400, 'INVALID_FILE_NAME', 'The file name is invalid.');
  }

  await scanWithClamAv(buffer);
  return { buffer, fileName: baseName.slice(0, 180), mimeType: detected.mime };
}

async function scanWithClamAv(buffer: Buffer): Promise<void> {
  const host = process.env.CLAMAV_HOST?.trim();
  const port = Number.parseInt(process.env.CLAMAV_PORT || '3310', 10);
  if (!host) {
    throw new ApiError(503, 'MALWARE_SCANNER_UNAVAILABLE', 'Document scanning is unavailable.');
  }

  const response = await new Promise<string>((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => socket.destroy(new Error('ClamAV scan timed out')), 30_000);
    socket.on('connect', () => {
      socket.write('zINSTREAM\0');
      const length = Buffer.alloc(4);
      length.writeUInt32BE(buffer.length, 0);
      socket.write(length);
      socket.write(buffer);
      socket.write(Buffer.alloc(4));
    });
    socket.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    socket.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    socket.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  }).catch((error) => {
    throw new ApiError(503, 'MALWARE_SCANNER_UNAVAILABLE', 'Document scanning failed.', String(error));
  });

  if (!response.includes('OK')) {
    throw new ApiError(422, 'MALWARE_DETECTED', 'The document failed malware verification.');
  }
}
