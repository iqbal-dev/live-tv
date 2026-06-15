import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChannelModel } from '@/models/Channel';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const { ids } = await req.json();
    const result = await ChannelModel.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ deleted: result.deletedCount });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
