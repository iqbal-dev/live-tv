'use client';
import { X, Heart, SkipForward } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { EPGPanel } from './EPGPanel';
import type { Channel } from '@/types';

interface Props {
  channel: Channel;
  isFavorite: boolean;
  onToggleFav: () => void;
  onClose: () => void;
  onNext: () => void;
}

export function PlayerModal({ channel, isFavorite, onToggleFav, onClose, onNext }: Props) {
  return (
    <div className="sv-player-backdrop" onClick={onClose}>
      <div className="sv-player-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sv-player-modal-header">
          <div className="sv-player-modal-info">
            {channel.logo && (
              <img
                src={channel.logo}
                alt={channel.name}
                className="sv-player-modal-logo"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <div>
              <div className="sv-player-modal-name">{channel.name}</div>
              <div className="sv-player-modal-cat">{channel.category}</div>
            </div>
          </div>
          <div className="sv-player-modal-actions">
            <button
              className={`sv-modal-btn ${isFavorite ? 'active' : ''}`}
              onClick={onToggleFav}
              title="Favorite"
            >
              <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button className="sv-modal-btn" onClick={onNext} title="Next channel">
              <SkipForward size={15} />
            </button>
            <button className="sv-modal-close" onClick={onClose} title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="sv-player-modal-video">
          <VideoPlayer channel={channel} onNext={onNext} />
        </div>

        <EPGPanel channel={channel} />
      </div>
    </div>
  );
}
