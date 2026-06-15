export interface ParsedChannel {
  name: string;
  logo: string;
  category: string;
  url: string;
  country: string;
  language: string;
}

export function parseM3U(content: string): ParsedChannel[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const channels: ParsedChannel[] = [];
  let meta: Partial<ParsedChannel> | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      meta = {
        name:     line.match(/,(.+)$/)?.[1]?.trim() || 'Unknown',
        logo:     line.match(/tvg-logo="([^"]*)"/)?.[1] || '',
        category: line.match(/group-title="([^"]*)"/)?.[1] || 'Uncategorized',
        country:  line.match(/tvg-country="([^"]*)"/)?.[1] || '',
        language: line.match(/tvg-language="([^"]*)"/)?.[1] || '',
      };
    } else if ((line.startsWith('http') || line.startsWith('rtmp')) && meta) {
      channels.push({ ...meta, url: line } as ParsedChannel);
      meta = null;
    }
  }
  return channels;
}
