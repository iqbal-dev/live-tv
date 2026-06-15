import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChannelModel } from '@/models/Channel';

export async function GET() {
  await connectDB();
  const channels = await ChannelModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(channels);
}
