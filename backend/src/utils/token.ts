import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from './config';

export interface TokenPayload {
  sub: string;
  role: string;
  sid?: string;
}

export function signAuthToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    issuer: 'sheshield',
  });
}

export function verifyAuthToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { issuer: 'sheshield' }) as jwt.JwtPayload;
  return {
    sub: String(decoded.sub),
    role: String(decoded.role),
    sid: decoded.sid ? String(decoded.sid) : undefined,
  };
}

// Hash a random token with SHA-256 so plaintext tokens are never stored in DB.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
