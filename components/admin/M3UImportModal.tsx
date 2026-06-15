'use client';
import { useState } from 'react';
import { X, Upload, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { importM3U } from './adminApi';

interface M3UImportModalProps {
  onDone: () => void;
  onClose: () => void;
}

export function M3UImportModal({ onDone, onClose }: M3UImportModalProps) {
  const [tab, setTab] = useState<'url' | 'paste'>('url');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const [errMsg, setErrMsg] = useState('');

  const doImport = async () => {
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await importM3U(tab === 'url' ? { url } : { content });
      setResult(res);
      setStatus('success');
      onDone();
    } catch (e: any) {
      setErrMsg(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="a-modal-backdrop" onClick={onClose}>
      <div className="a-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="a-modal-header">
          <span><Upload size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Bulk M3U Import</span>
          <button onClick={onClose} className="a-icon-btn"><X size={16} /></button>
        </div>
        <div className="a-modal-body">
          <div className="a-tabs">
            <button className={tab === 'url' ? 'active' : ''} onClick={() => setTab('url')}><Link size={13} />From URL</button>
            <button className={tab === 'paste' ? 'active' : ''} onClick={() => setTab('paste')}><Upload size={13} />Paste M3U</button>
          </div>

          {tab === 'url' ? (
            <div className="a-field" style={{ marginTop: 14 }}>
              <label>Playlist URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/playlist.m3u" />
            </div>
          ) : (
            <div className="a-field" style={{ marginTop: 14 }}>
              <label>M3U Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                rows={8} placeholder={'#EXTM3U\n#EXTINF:-1 group-title="News",CNN\nhttp://stream.url/cnn.m3u8'} />
            </div>
          )}

          {status === 'success' && result && (
            <div className="a-success-box">
              <CheckCircle size={16} />
              <div>
                <strong>{result.imported} channels imported</strong>
                <span>{result.skipped} skipped (duplicates) · {result.total} total in file</span>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="a-error"><AlertCircle size={14} />{errMsg}</div>
          )}

          <div className="a-modal-footer">
            <button className="a-btn-ghost" onClick={onClose}>Close</button>
            <button className="a-btn-primary" onClick={doImport} disabled={status === 'loading'}>
              <Upload size={14} />{status === 'loading' ? 'Importing…' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
