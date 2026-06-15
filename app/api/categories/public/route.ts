import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CategoryModel } from '@/models/Category';
import { ChannelModel } from '@/models/Channel';

export async function GET() {
  await connectDB();
  const categories = await CategoryModel.find().sort({ order: 1 }).lean();
  const counts = await ChannelModel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return NextResponse.json(
    categories.map((cat) => ({ ...cat, channelCount: countMap[cat.name] || 0 }))
  );
}
