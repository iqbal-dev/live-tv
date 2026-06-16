import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({
    ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    JWT_SECRET: !!process.env.JWT_SECRET,
    MONGODB_URI: !!process.env.MONGODB_URI,
  });
}

export async function POST(req: NextRequest) {
  const adminUser = process.env.ADMIN_USERNAME?.trim();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!adminUser || !adminPass) {
    return NextResponse.json(
      { error: 'Server misconfigured: ADMIN_USERNAME / ADMIN_PASSWORD env vars are not set' },
      { status: 500 }
    );
  }

  if (!jwtSecret) {
    return NextResponse.json(
      { error: 'Server misconfigured: JWT_SECRET env var is not set' },
      { status: 500 }
    );
  }

  const { username, password } = await req.json();

  if (username.trim() === adminUser && password.trim() === adminPass) {
    const token = signToken({ username: adminUser });
    return NextResponse.json({ token, username: adminUser });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
