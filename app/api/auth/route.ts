import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = signToken({ username });
    return NextResponse.json({ token, username });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
