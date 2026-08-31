import crypto from 'node:crypto';
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import type { AuthRequest } from './auth.ts';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id')?.trim() || crypto.randomUUID();
  (req as AuthRequest).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

export const apiErrorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestId = (req as AuthRequest).requestId;
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
      requestId,
    });
  }
  console.error('Unhandled API error', { requestId, error });
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' },
    requestId,
  });
};
