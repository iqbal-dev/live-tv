'use client';
import { Heart } from 'lucide-react';
import type { Channel, ViewMode } from '@/types';

interface Props {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
  viewMode: ViewMode;
}

export function ChannelCard({ channel, isActive, isFavorite, onSelect, onToggleFav, viewMode }: Props) {
  const id = channel.id || channel._id || '';
  if (viewMode === 'list') return (
    <div className={`channel-list-item ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <div className="channel-list-logo">
        {channel.logo
          ? <img src={channel.logo} alt={channel.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          : <span className="channel-placeholder">{channel.name[0]}</span>}
      </div>
      <div className="channel-list-info">
        <div className="channel-list-name">{channel.name}</div>
        <div className="channel-list-cat">{channel.category}</div>
      </div>
      <button className={`fav-btn ${isFavorite ? 'active' : ''}`} onClick={onToggleFav}>
        <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );

  return (
    <div className={`channel-card ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <div className="channel-card-logo">
        {channel.logo
          ? <img src={channel.logo} alt={channel.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          : <span className="channel-placeholder">{channel.name[0]}</span>}
        <div className="channel-card-live"><span className="live-dot" />LIVE</div>
      </div>
      <div className="channel-card-body">
        <div className="channel-card-name">{channel.name}</div>
        <div className="channel-card-cat">{channel.category}</div>
      </div>
      <button className={`fav-btn card-fav ${isFavorite ? 'active' : ''}`} onClick={onToggleFav}>
        <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
