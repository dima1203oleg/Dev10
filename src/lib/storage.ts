import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export interface UploadResult {
  storageKey: string;     // Key in the storage bucket/system
  publicUrl?: string;     // Optional public URL
  contentHash: string;    // SHA-256 for integrity checks
  size: number;           // File size in bytes
  mimeType: string;       // Detected MIME type
}

/**
 * Interface for document storage providers (S3, MinIO, Local, etc.)
 * This follows the "BUILD ONLY WHAT DOES NOT ALREADY EXIST" principle by
 * providing a standard way to wrap existing storage SDKs.
 */
export interface StorageProvider {
  /**
   * Uploads a file from a buffer or stream.
   */
  upload(
    file: Buffer | Readable,
    fileName: string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult>;

  /**
   * Downloads a file as a readable stream.
   */
  download(storageKey: string): Promise<Readable>;

  /**
   * Deletes a file from storage.
   */
  delete(storageKey: string): Promise<void>;

  /**
   * Checks if a file exists.
   */
  exists(storageKey: string): Promise<boolean>;
}

/**
 * Local implementation for development environments.
 * In production, this should be replaced with an S3-compatible provider.
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor(uploadDir: string = 'uploads') {
    this.uploadDir = path.resolve(process.cwd(), uploadDir);
  }

  private async ensureDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private resolveStorageKey(storageKey: string): string {
    if (!/^[a-f0-9]{64}-[\p{L}\p{N}._ -]{1,180}$/u.test(storageKey)) {
      throw new Error('Invalid storage key');
    }
    const resolved = path.resolve(this.uploadDir, storageKey);
    if (!resolved.startsWith(`${this.uploadDir}${path.sep}`)) {
      throw new Error('Storage path escaped its configured root');
    }
    return resolved;
  }

  async upload(file: Buffer | Readable, fileName: string, mimeType: string): Promise<UploadResult> {
    await this.ensureDir();
    
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      // Convert stream to buffer for hashing and saving
      const chunks = [];
      for await (const chunk of file) {
        chunks.push(chunk);
      }
      buffer = Buffer.concat(chunks);
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const safeName = path.basename(fileName).normalize('NFKC').replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 180);
    const storageKey = `${hash}-${safeName}`;
    const filePath = this.resolveStorageKey(storageKey);

    await fs.writeFile(filePath, buffer);

    return {
      storageKey,
      contentHash: hash,
      size: buffer.length,
      mimeType
    };
  }

  async download(storageKey: string): Promise<Readable> {
    const filePath = this.resolveStorageKey(storageKey);
    const buffer = await fs.readFile(filePath);
    return Readable.from(buffer);
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = this.resolveStorageKey(storageKey);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(`Failed to delete file ${storageKey}:`, err);
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    const filePath = this.resolveStorageKey(storageKey);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    endpoint: string,
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
  ) {
    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private validateKey(storageKey: string) {
    if (!/^[a-f0-9]{64}-[\p{L}\p{N}._ -]{1,180}$/u.test(storageKey)) {
      throw new Error('Invalid storage key');
    }
    return storageKey;
  }

  async upload(file: Buffer | Readable, fileName: string, mimeType: string, metadata?: Record<string, string>): Promise<UploadResult> {
    const chunks: Buffer[] = [];
    if (Buffer.isBuffer(file)) chunks.push(file);
    else for await (const chunk of file) chunks.push(Buffer.from(chunk));
    const buffer = Buffer.concat(chunks);
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const safeName = path.basename(fileName).normalize('NFKC').replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 180);
    const storageKey = this.validateKey(`${contentHash}-${safeName}`);
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
      Metadata: { ...metadata, sha256: contentHash },
    }));
    return { storageKey, contentHash, size: buffer.length, mimeType };
  }

  async download(storageKey: string): Promise<Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.validateKey(storageKey) }));
    if (!response.Body) throw new Error('Stored object has no body');
    return response.Body as Readable;
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.validateKey(storageKey) }));
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: this.validateKey(storageKey) }));
      return true;
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') return false;
      throw error;
    }
  }
}

export function createStorageProvider(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER?.trim() || (process.env.NODE_ENV === 'production' ? 's3' : 'local');
  if (driver === 'local') {
    if (process.env.NODE_ENV === 'production') throw new Error('Local storage is forbidden in production');
    return new LocalStorageProvider(process.env.LOCAL_UPLOAD_DIR || 'uploads');
  }
  if (driver !== 's3') throw new Error(`Unsupported storage driver: ${driver}`);
  const required = ['S3_BUCKET', 'S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const;
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) throw new Error(`Missing S3 configuration: ${missing.join(', ')}`);
  return new S3StorageProvider(
    process.env.S3_BUCKET!, process.env.S3_ENDPOINT!, process.env.S3_REGION!,
    process.env.S3_ACCESS_KEY_ID!, process.env.S3_SECRET_ACCESS_KEY!,
  );
}
