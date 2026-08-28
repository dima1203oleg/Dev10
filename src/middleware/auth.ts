import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  // Dev bypass is allowed in all non-production environments during development to prevent API key prompt interference
  const isDevBypassAllowed = process.env.NODE_ENV !== 'production';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDevBypassAllowed) {
      req.user = {
        uid: 'dev-user-001',
        email: 'dev@tenderai.ua',
        name: 'Користувач TenderAI'
      } as any;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: No Bearer Token Provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    if (isDevBypassAllowed) {
      req.user = {
        uid: 'dev-user-001',
        email: 'dev@tenderai.ua',
        name: 'Користувач (Dev Session)'
      } as any;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid or Expired Token' });
  }
};

