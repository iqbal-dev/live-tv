'use client';
import { Heart, Play } from 'lucide-react';
import type { Channel } from '@/types';

const PALETTE = [
  '#22c55e', '#f97316', '#3b82f6', '#a855f7',
  '#ec4899', '#eab308', '#06b6d4', '#14b8a6',
  '#f59e0b', '#6366f1', '#ef4444', '#64748b',
];

function categoryColor(cat: string) {
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

interface Props {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
}

export function ChannelCard({ channel, isActive, isFavorite, onSelect, onToggleFav }: Props) {
  const color = categoryColor(channel.category);

  return (
    <div className={`sv-card ${isActive ? 'sv-card-active' : ''}`} onClick={onSelect}>
      <div className="sv-card-top">
        <span
          className="sv-card-cat-badge"
          style={{ color, background: color + '22', border: `1px solid ${color}44` }}
        >
          {channel.category}
        </span>
        <div className="sv-card-live-badge">
          <span className="live-dot" /> LIVE
        </div>
      </div>

      <div className="sv-card-body">
        <div className="sv-card-logo-wrap">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span className="sv-card-initial">{channel.name[0]}</span>
          )}
        </div>
        <div className="sv-card-name">{channel.name}</div>
        {(channel.country || channel.language) && (
          <div className="sv-card-meta">
            {[channel.country, channel.language].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>

      <div className="sv-card-footer">
        <button className="sv-watch-btn" onClick={onSelect}>
          <Play size={12} fill="currentColor" /> Watch Now
        </button>
        <button
          className={`sv-fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={onToggleFav}
          title={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
