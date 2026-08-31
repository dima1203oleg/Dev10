import { afterEach, describe, expect, it } from 'vitest';
import type { Request } from 'express';
import { issueLocalDevelopmentToken, requireAuth } from '../middleware/auth.ts';

const originalEnv = { ...process.env };
const originalNodeEnv = process.env.NODE_ENV;

function makeRequest(remoteAddress: string, token?: string) {
  return {
    socket: { remoteAddress },
    headers: token ? { authorization: `Bearer ${token}` } : {},
  } as unknown as Request;
}

describe('local development authentication', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('is unavailable unless explicitly enabled', () => {
    process.env.NODE_ENV = 'development';
    process.env.LOCAL_DEV_AUTH = 'false';
    process.env.LOCAL_DEV_FIREBASE_UID = 'uid-1';
    process.env.LOCAL_DEV_EMAIL = 'dev@example.invalid';

    expect(issueLocalDevelopmentToken(makeRequest('127.0.0.1'))).toBeNull();
  });

  it('is unavailable in production even when the local flag is set', () => {
    process.env.NODE_ENV = 'production';
    process.env.LOCAL_DEV_AUTH = 'true';
    process.env.LOCAL_DEV_FIREBASE_UID = 'uid-1';
    process.env.LOCAL_DEV_EMAIL = 'dev@example.invalid';

    expect(issueLocalDevelopmentToken(makeRequest('127.0.0.1'))).toBeNull();
  });

  it('only issues a signed session to loopback clients with a configured identity', () => {
    process.env.NODE_ENV = 'development';
    process.env.LOCAL_DEV_AUTH = 'true';
    process.env.LOCAL_DEV_FIREBASE_UID = 'uid-1';
    process.env.LOCAL_DEV_EMAIL = 'dev@example.invalid';

    expect(issueLocalDevelopmentToken(makeRequest('10.0.0.8'))).toBeNull();
    const session = issueLocalDevelopmentToken(makeRequest('::ffff:127.0.0.1'));

    expect(session?.token).toMatch(/^local\./);
    expect(session?.user).toEqual({ uid: 'uid-1', email: 'dev@example.invalid', displayName: 'Local developer' });
  });

  it('rejects malformed local bearer tokens', async () => {
    process.env.NODE_ENV = 'development';
    process.env.LOCAL_DEV_AUTH = 'true';
    process.env.LOCAL_DEV_FIREBASE_UID = 'uid-1';
    process.env.LOCAL_DEV_EMAIL = 'dev@example.invalid';

    const req = makeRequest('127.0.0.1', 'local.not-json.bad-signature');
    const res = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        return payload;
      },
    };
    const next = () => {
      throw new Error('malformed local token should not authenticate');
    };

    await requireAuth(req as never, res as never, next);

    expect(res.statusCode).toBe(401);
  });
});
