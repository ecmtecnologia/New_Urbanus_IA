import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from './env';

export type UserRole = 'MASTER' | 'ADMIN' | 'JURIDICO' | 'SOCIAL' | 'TECNICO';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
}

export function signAccessToken(user: AuthUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '8h',
    issuer: 'urbanus-api',
  });
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'urbanus-api',
  }) as TokenPayload;

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token.' });
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    if (user.role === 'MASTER' || user.role === 'ADMIN') {
      return next();
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    return next();
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
