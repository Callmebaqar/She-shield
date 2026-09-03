import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { verifyAuthToken } from '../utils/token';
import { AppError, asyncHandler } from '../utils/errors';

export interface AuthRequest extends Request {
  userId: string;
  role: string;
  sessionId?: string;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const areq = req as AuthRequest;
  const token = extractToken(req);
  if (!token) throw new AppError('Authentication required', 401);

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new AppError('Account not found or disabled', 401);

  // If a session id is present in the token, validate the session is still live.
  if (payload.sid) {
    const session = await prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.expiresAt < new Date() || session.userId !== user.id) {
      throw new AppError('Session expired. Please log in again.', 401);
    }
  }

  areq.userId = user.id;
  areq.role = user.role;
  areq.sessionId = payload.sid;
  next();
});

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  const areq = req as AuthRequest;
  if (areq.role !== 'ADMIN') {
    next(new AppError('Admin access required', 403));
    return;
  }
  next();
}
