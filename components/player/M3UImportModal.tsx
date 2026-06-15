'use client';
import { useState } from 'react';
import { X, Upload, Link, AlertCircle, CheckCircle } from 'lucide-react';
import type { Channel } from '@/types';

function parseM3UClient(content: string): Channel[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const channels: Channel[] = [];
  let meta: Partial<Channel> | null = null;
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      meta = {
        id: `imported-${Date.now()}-${Math.random()}`,
        name: line.match(/,(.+)$/)?.[1]?.trim() || 'Unknown',
        logo: line.match(/tvg-logo="([^"]*)"/)?.[1] || '',
        category: line.match(/group-title="([^"]*)"/)?.[1] || 'Uncategorized',
      };
    } else if ((line.startsWith('http') || line.startsWith('rtmp')) && meta) {
      channels.push({ ...meta, url: line } as Channel);
      meta = null;
    }
  }
  return channels;
}

interface Props { onImport: (channels: Channel[]) => void; onClose: () => void; }

export function M3UImportModal({ onImport, onClose }: Props) {
  const [tab, setTab] = useState<'url' | 'paste'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUrlImport = async () => {
    if (!url.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const content = await res.text();
      const channels = parseM3UClient(content);
      if (!channels.length) throw new Error('No channels found.');
      onImport(channels);
      setStatus('success'); setMessage(`Imported ${channels.length} channels!`);
      setTimeout(onClose, 1500);
    } catch (e: unknown) {
      setStatus('error'); setMessage(e instanceof Error ? e.message : 'Failed');
    }
  };

  const handleTextImport = () => {
    const channels = parseM3UClient(text);
    if (!channels.length) { setStatus('error'); setMessage('No valid channels found.'); return; }
    onImport(channels);
    setStatus('success'); setMessage(`Imported ${channels.length} channels!`);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><Upload size={18} />Import M3U Playlist</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-tabs">
          <button className={`modal-tab ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}><Link size={14} />From URL</button>
          <button className={`modal-tab ${tab === 'paste' ? 'active' : ''}`} onClick={() => setTab('paste')}><Upload size={14} />Paste Content</button>
        </div>
        <div className="modal-body">
          {tab === 'url'
            ? <div className="modal-field"><label>M3U Playlist URL</label><input type="url" className="modal-input" placeholder="https://example.com/playlist.m3u" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()} /></div>
            : <div className="modal-field"><label>Playlist Content</label><textarea className="modal-textarea" placeholder={'#EXTM3U\n#EXTINF:-1 group-title="News",Channel Name\nhttp://stream.url/live.m3u8'} value={text} onChange={(e) => setText(e.target.value)} rows={8} /></div>}
          {status === 'error' && <div className="modal-status error"><AlertCircle size={14} />{message}</div>}
          {status === 'success' && <div className="modal-status success"><CheckCircle size={14} />{message}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={tab === 'url' ? handleUrlImport : handleTextImport} disabled={status === 'loading'}>
            {status === 'loading' ? 'Importing…' : 'Import Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
