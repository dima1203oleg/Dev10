import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

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
    const storageKey = `${hash}-${fileName}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.writeFile(filePath, buffer);

    return {
      storageKey,
      contentHash: hash,
      size: buffer.length,
      mimeType
    };
  }

  async download(storageKey: string): Promise<Readable> {
    const filePath = path.join(this.uploadDir, storageKey);
    const buffer = await fs.readFile(filePath);
    return Readable.from(buffer);
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(`Failed to delete file ${storageKey}:`, err);
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, storageKey);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
