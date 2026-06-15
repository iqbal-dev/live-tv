import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CategoryModel } from '@/models/Category';
import { ChannelModel } from '@/models/Channel';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const categories = await CategoryModel.find().sort({ order: 1 }).lean();
    const counts = await ChannelModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    return NextResponse.json(
      categories.map((cat) => ({ ...cat, channelCount: countMap[cat.name] || 0 }))
    );
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();
    const body = await req.json();
    const count = await CategoryModel.countDocuments();
    const cat = await CategoryModel.create({ ...body, order: count });
    return NextResponse.json(cat, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
