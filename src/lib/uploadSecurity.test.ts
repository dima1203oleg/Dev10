import { describe, expect, it } from 'vitest';
import { verifyUpload } from './uploadSecurity';

describe('upload security', () => {
  it('rejects empty uploads', async () => {
    await expect(verifyUpload(Buffer.alloc(0), 'document.pdf')).rejects.toMatchObject({ code: 'EMPTY_FILE', status: 400 });
  });

  it('rejects content that does not match an allowed document signature', async () => {
    await expect(verifyUpload(Buffer.from('not a pdf'), 'document.pdf')).rejects.toMatchObject({ code: 'UNSUPPORTED_FILE_TYPE', status: 415 });
  });
});
