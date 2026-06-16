'use client';
import { useState, useRef } from 'react';
import { X, Upload, Link, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { importM3U } from './adminApi';

interface M3UImportModalProps {
  onDone: () => void;
  onClose: () => void;
}

export function M3UImportModal({ onDone, onClose }: M3UImportModalProps) {
  const [tab, setTab] = useState<'url' | 'file' | 'paste'>('url');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFileContent(ev.target?.result as string ?? '');
    reader.readAsText(file);
  };

  const doImport = async () => {
    setStatus('loading');
    setErrMsg('');
    try {
      let payload: { url?: string; content?: string };
      if (tab === 'url') payload = { url };
      else if (tab === 'file') payload = { content: fileContent };
      else payload = { content };

      const res = await importM3U(payload);
      setResult(res);
      setStatus('success');
      onDone();
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Import failed');
      setStatus('error');
    }
  };

  const canSubmit = status !== 'loading' && (
    (tab === 'url' && url.trim() !== '') ||
    (tab === 'file' && fileContent !== '') ||
    (tab === 'paste' && content.trim() !== '')
  );

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
            <button className={tab === 'file' ? 'active' : ''} onClick={() => setTab('file')}><Upload size={13} />Upload File</button>
            <button className={tab === 'paste' ? 'active' : ''} onClick={() => setTab('paste')}><FileText size={13} />Paste M3U</button>
          </div>

          {tab === 'url' && (
            <div className="a-field" style={{ marginTop: 14 }}>
              <label>Playlist URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/playlist.m3u" />
            </div>
          )}

          {tab === 'file' && (
            <div className="a-field" style={{ marginTop: 14 }}>
              <label>M3U / M3U8 File</label>
              <div className="a-file-drop" onClick={() => fileRef.current?.click()}>
                <Upload size={24} style={{ color: 'var(--a-text-2)', marginBottom: 8 }} />
                {fileName
                  ? <span style={{ color: 'var(--a-accent)', fontWeight: 600 }}>{fileName}</span>
                  : <><span style={{ fontWeight: 600 }}>Click to select a file</span><span style={{ fontSize: 11, color: 'var(--a-text-2)', marginTop: 4 }}>.m3u or .m3u8</span></>}
              </div>
              <input ref={fileRef} type="file" accept=".m3u,.m3u8,text/plain"
                style={{ display: 'none' }} onChange={handleFile} />
            </div>
          )}

          {tab === 'paste' && (
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
            <button className="a-btn-primary" onClick={doImport} disabled={!canSubmit}>
              <Upload size={14} />{status === 'loading' ? 'Importing…' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
