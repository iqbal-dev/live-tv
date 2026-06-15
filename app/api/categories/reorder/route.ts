import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CategoryModel } from '@/models/Category';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const { orderedIds } = await req.json();
    await Promise.all(
      orderedIds.map((id: string, i: number) => CategoryModel.findByIdAndUpdate(id, { order: i }))
    );
    return NextResponse.json({ message: 'Reordered' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
