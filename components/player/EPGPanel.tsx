'use client';
import { Clock } from 'lucide-react';
import { DEMO_EPG } from '@/lib/demoData';
import type { Channel } from '@/types';

function formatTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function isLive(s: Date, e: Date) { const n = Date.now(); return n >= s.getTime() && n <= e.getTime(); }
function progress(s: Date, e: Date) { return Math.min(100, Math.max(0, (Date.now() - s.getTime()) / (e.getTime() - s.getTime()) * 100)); }

export function EPGPanel({ channel }: { channel: Channel | null }) {
  if (!channel) return null;
  const channelId = channel.id || channel._id || '';
  const programs = DEMO_EPG.filter((p) => p.channelId === channelId).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="epg-panel">
      <div className="epg-header"><Clock size={14} />Program Guide — {channel.name}</div>
      <div className="epg-list">
        {programs.length === 0
          ? <div className="epg-empty">No program data available</div>
          : programs.map((p) => {
              const live = isLive(p.startTime, p.endTime);
              return (
                <div key={p.id} className={`epg-item ${live ? 'live' : ''}`}>
                  <div className="epg-time">
                    <span>{formatTime(p.startTime)}</span>
                    {live && <span className="epg-live-badge">NOW</span>}
                  </div>
                  <div className="epg-info">
                    <div className="epg-title">{p.title}</div>
                    <div className="epg-desc">{p.description}</div>
                    {live && <div className="epg-progress"><div className="epg-progress-fill" style={{ width: `${progress(p.startTime, p.endTime)}%` }} /></div>}
                  </div>
                  <div className="epg-genre">{p.genre}</div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
