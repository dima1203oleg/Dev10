import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { beginTenantRequest } from './tenant.ts';

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
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    return beginTenantRequest(req, res, next);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token' });
  }
};
