import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChannelModel } from '@/models/Channel';
import { CategoryModel } from '@/models/Category';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const channels = await ChannelModel.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json(channels);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const body = await req.json();
    const count = await ChannelModel.countDocuments();
    const channel = await ChannelModel.create({ ...body, order: count });

    if (body.category) {
      const catCount = await CategoryModel.countDocuments();
      await CategoryModel.findOneAndUpdate(
        { name: body.category },
        { $setOnInsert: { name: body.category, order: catCount } },
        { upsert: true }
      );
    }

    return NextResponse.json(channel, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    const status = msg === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
