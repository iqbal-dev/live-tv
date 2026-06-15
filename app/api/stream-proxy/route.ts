import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { Agent, fetch as undiciFetch } from 'undici';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-cache',
};

// Some upstream hostnames aren't resolvable via the platform's default resolver
// (e.g. geo-restricted CDN DNS). Fall back to public resolvers for lookups.
const publicResolver = new dns.promises.Resolver();
publicResolver.setServers(['8.8.8.8', '1.1.1.1']);

function lookup(hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (!err) return callback(null, address, family);
    publicResolver.resolve4(hostname).then((addresses) => {
      callback(null, addresses[0], 4);
    }).catch(() => callback(err, address, family));
  });
}

const agent = new Agent({ connect: { lookup } });

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
    upstream = (await undiciFetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      dispatcher: agent,
    })) as unknown as Response;
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
