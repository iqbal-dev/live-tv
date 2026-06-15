'use client';
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Channel, AdminCategory } from '@/types';

interface ChannelFormProps {
  channel?: Channel | null;
  categories: AdminCategory[];
  onSave: (data: Partial<Channel>) => Promise<void>;
  onClose: () => void;
}

const EMPTY: Partial<Channel> = {
  name: '', logo: '', category: 'Uncategorized',
  url: '', country: '', language: '', isActive: true,
};

export function ChannelForm({ channel, categories, onSave, onClose }: ChannelFormProps) {
  const [form, setForm] = useState<Partial<Channel>>(channel || EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setForm(channel || EMPTY); }, [channel]);

  const set = (k: keyof Channel, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.url?.trim()) {
      setError('Name and Stream URL are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="a-modal-backdrop" onClick={onClose}>
      <div className="a-modal" onClick={(e) => e.stopPropagation()}>
        <div className="a-modal-header">
          <span>{channel ? 'Edit Channel' : 'Add Channel'}</span>
          <button onClick={onClose} className="a-icon-btn"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="a-modal-body">
          <div className="a-form-grid">
            <div className="a-field">
              <label>Channel Name *</label>
              <input value={form.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. CNN" required />
            </div>
            <div className="a-field">
              <label>Category</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={form.category || ''} onChange={(e) => set('category', e.target.value)} style={{ flex: 1 }}>
                  {categories.map((c) => <option key={c._id} value={c.name}>{c.icon} {c.name}</option>)}
                  <option value="Uncategorized">Uncategorized</option>
                </select>
              </div>
            </div>
            <div className="a-field a-span2">
              <label>Stream URL (HLS/M3U8) *</label>
              <input value={form.url || ''} onChange={(e) => set('url', e.target.value)} placeholder="https://example.com/stream.m3u8" required />
            </div>
            <div className="a-field a-span2">
              <label>Logo URL</label>
              <input value={form.logo || ''} onChange={(e) => set('logo', e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
            <div className="a-field">
              <label>Country</label>
              <input value={form.country || ''} onChange={(e) => set('country', e.target.value)} placeholder="e.g. US" />
            </div>
            <div className="a-field">
              <label>Language</label>
              <input value={form.language || ''} onChange={(e) => set('language', e.target.value)} placeholder="e.g. English" />
            </div>
            <div className="a-field a-span2">
              <label className="a-toggle-label">
                <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} />
                <span>Active (visible in player)</span>
              </label>
            </div>
          </div>

          {form.logo && (
            <div className="a-logo-preview">
              <img src={form.logo} alt="Logo preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <span>Logo preview</span>
            </div>
          )}

          {error && <div className="a-error">{error}</div>}

          <div className="a-modal-footer">
            <button type="button" className="a-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="a-btn-primary" disabled={saving}>
              <Save size={14} />{saving ? 'Saving…' : 'Save Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
