import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChannelModel } from '@/models/Channel';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const { orderedIds } = await req.json();
    await Promise.all(
      orderedIds.map((id: string, index: number) =>
        ChannelModel.findByIdAndUpdate(id, { order: index })
      )
    );
    return NextResponse.json({ message: 'Reordered' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
