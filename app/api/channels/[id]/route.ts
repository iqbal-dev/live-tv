import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChannelModel } from '@/models/Channel';
import { CategoryModel } from '@/models/Category';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    requireAuth(req);
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const channel = await ChannelModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (body.category) {
      const catCount = await CategoryModel.countDocuments();
      await CategoryModel.findOneAndUpdate(
        { name: body.category },
        { $setOnInsert: { name: body.category, order: catCount } },
        { upsert: true }
      );
    }
    return NextResponse.json(channel);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    requireAuth(req);
    await connectDB();
    const { id } = await params;
    const channel = await ChannelModel.findByIdAndDelete(id);
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    requireAuth(req);
    await connectDB();
    const { id } = await params;
    const channel = await ChannelModel.findById(id);
    if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    channel.isActive = !channel.isActive;
    await channel.save();
    return NextResponse.json(channel);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
