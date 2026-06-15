import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChannelModel } from '@/models/Channel';
import { CategoryModel } from '@/models/Category';
import { requireAuth } from '@/lib/auth';
import { parseM3U } from '@/lib/m3uParser';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    await connectDB();

    const { content, url } = await req.json();
    let m3uContent = content;

    if (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      m3uContent = await res.text();
    }

    if (!m3uContent) return NextResponse.json({ error: 'No M3U content' }, { status: 400 });

    const parsed = parseM3U(m3uContent);
    if (!parsed.length) return NextResponse.json({ error: 'No channels found' }, { status: 400 });

    const existing = await ChannelModel.find({}, 'url').lean();
    const existingUrls = new Set(existing.map((c) => c.url));
    const newChannels = parsed.filter((c) => !existingUrls.has(c.url));
    const startOrder = await ChannelModel.countDocuments();

    const inserted = await ChannelModel.insertMany(
      newChannels.map((ch, i) => ({ ...ch, order: startOrder + i, isActive: true }))
    );

    const newCats = [...new Set(newChannels.map((c) => c.category))];
    for (const catName of newCats) {
      const catCount = await CategoryModel.countDocuments();
      await CategoryModel.findOneAndUpdate(
        { name: catName },
        { $setOnInsert: { name: catName, order: catCount } },
        { upsert: true }
      );
    }

    return NextResponse.json({
      imported: inserted.length,
      skipped: parsed.length - inserted.length,
      total: parsed.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
