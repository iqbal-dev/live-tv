import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-cache',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
  } catch {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') || '';
  const isManifest = contentType.includes('mpegurl') || contentType.includes('m3u') || targetUrl.pathname.endsWith('.m3u8');

  if (isManifest) {
    const text = await upstream.text();
    const rewritten = text.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/, (_m, uri) => {
          const abs = new URL(uri, targetUrl).toString();
          return `URI="/api/stream-proxy?url=${encodeURIComponent(abs)}"`;
        });
      }
      const abs = new URL(trimmed, targetUrl).toString();
      return `/api/stream-proxy?url=${encodeURIComponent(abs)}`;
    }).join('\n');

    return new NextResponse(rewritten, {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/vnd.apple.mpegurl' },
    });
  }

  return new NextResponse(upstream.body, {
    headers: { ...CORS_HEADERS, 'Content-Type': contentType || 'application/octet-stream' },
  });
}
