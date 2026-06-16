import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

function secret() {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) throw new Error('JWT_SECRET env var is not set');
  return s;
}

export function signToken(payload: object) {
  return jwt.sign(payload, secret(), { expiresIn: '24h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret()) as { username: string };
}

export function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

export function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error('Unauthorized');
  return verifyToken(token);
}
