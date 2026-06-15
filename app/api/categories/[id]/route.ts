import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CategoryModel } from '@/models/Category';
import { ChannelModel } from '@/models/Channel';
import { requireAuth } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    requireAuth(req);
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const old = await CategoryModel.findById(id);
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (body.name && body.name !== old.name) {
      await ChannelModel.updateMany({ category: old.name }, { category: body.name });
    }
    const cat = await CategoryModel.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(cat);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    requireAuth(req);
    await connectDB();
    const { id } = await params;
    const cat = await CategoryModel.findByIdAndDelete(id);
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await ChannelModel.updateMany({ category: cat.name }, { category: 'Uncategorized' });
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
