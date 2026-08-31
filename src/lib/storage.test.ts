import { afterEach, describe, expect, it } from 'vitest';
import { createStorageProvider, LocalStorageProvider } from './storage.ts';

const originalNodeEnv = process.env.NODE_ENV;
const originalDriver = process.env.STORAGE_DRIVER;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.STORAGE_DRIVER = originalDriver;
});

describe('storage provider policy', () => {
  it('rejects local storage in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.STORAGE_DRIVER = 'local';
    expect(() => createStorageProvider()).toThrow('Local storage is forbidden in production');
  });

  it('rejects traversal-shaped storage keys', async () => {
    const provider = new LocalStorageProvider('uploads-test');
    await expect(provider.download('../outside.pdf')).rejects.toThrow('Invalid storage key');
  });
});
