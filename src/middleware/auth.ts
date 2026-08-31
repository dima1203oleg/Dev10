import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { beginTenantRequest } from './tenant.ts';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const localSessionSecret = randomBytes(32);

const isLoopback = (req: Request) => {
  const address = req.socket.remoteAddress || '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
};

const localAuthEnabled = () => process.env.NODE_ENV !== 'production' && process.env.LOCAL_DEV_AUTH === 'true';

export function issueLocalDevelopmentToken(req: Request) {
  if (!localAuthEnabled() || !isLoopback(req)) return null;
  const uid = process.env.LOCAL_DEV_FIREBASE_UID;
  const email = process.env.LOCAL_DEV_EMAIL;
  if (!uid || !email) return null;
  const payload = Buffer.from(JSON.stringify({ uid, email, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', localSessionSecret).update(payload).digest('base64url');
  return { token: `local.${payload}.${signature}`, user: { uid, email, displayName: 'Local developer' } };
}

function verifyLocalDevelopmentToken(req: Request, token: string): DecodedIdToken | null {
  if (!localAuthEnabled() || !isLoopback(req) || !token.startsWith('local.')) return null;
  const [, payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', localSessionSecret).update(payload).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const identity = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { uid?: string; email?: string; exp?: number };
    if (!identity.uid || !identity.email || !identity.exp || identity.exp < Date.now()) return null;
    return identity as DecodedIdToken;
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  requestId?: string;
  dbUserId?: number;
  orgId?: number;
  afterCommit?: Array<() => void>;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No Bearer Token Provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = verifyLocalDevelopmentToken(req, token) || await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    return beginTenantRequest(req, res, next);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token' });
  }
};
