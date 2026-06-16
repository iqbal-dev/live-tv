'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Tv, Sun, Moon } from 'lucide-react';
import { ChannelCard } from '@/components/player/ChannelCard';
import { PlayerModal } from '@/components/player/PlayerModal';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/hooks/useTheme';
import type { Channel } from '@/types';

export default function PlayerPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const { favorites, toggle } = useFavorites();
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    fetch('/api/channels/public')
      .then((r) => r.json())
      .then((data: Channel[]) => setChannels(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allCategories = useMemo(
    () => ['All', ...Array.from(new Set(channels.map((c) => c.category))).sort()],
    [channels]
  );

  const filtered = useMemo(() => channels.filter((ch) => {
    const id = ch.id || ch._id || '';
    return (
      ch.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || ch.category === category) &&
      (!showFavOnly || favorites.has(id))
    );
  }), [channels, search, category, showFavOnly, favorites]);

  const handleNext = useCallback(() => {
    if (!filtered.length) return;
    const idx = filtered.findIndex(
      (ch) => (ch.id || ch._id) === (activeChannel?.id || activeChannel?._id)
    );
    setActiveChannel(filtered[(idx + 1) % filtered.length]);
  }, [filtered, activeChannel]);

  const favCount = useMemo(
    () => channels.filter((ch) => favorites.has(ch.id || ch._id || '')).length,
    [channels, favorites]
  );

  return (
    <div className="sv-app">
      <header className="sv-header">
        <div className="sv-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="14" rx="2" stroke="#e50914" strokeWidth="2" />
            <path d="M8 10l5 3-5 3V10z" fill="#e50914" />
            <line x1="7" y1="20" x2="17" y2="20" stroke="#e50914" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>StreamVault</span>
        </div>

        <div className="sv-search-wrap">
          <Search size={14} className="sv-search-icon" />
          <input
            className="sv-search-input"
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="sv-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <div className="sv-filters">
        <div className="sv-section-title">
          <span className="sv-live-pulse" />
          LIVE &amp; STREAMING CHANNELS
        </div>

        <div className="sv-filter-row">
          <div className="sv-status-tabs">
            <button
              className={`sv-tab ${!showFavOnly ? 'active' : ''}`}
              onClick={() => setShowFavOnly(false)}
            >
              All ({channels.length})
            </button>
            <button
              className={`sv-tab ${showFavOnly ? 'active' : ''}`}
              onClick={() => setShowFavOnly(true)}
            >
              ♥ Favorites ({favCount})
            </button>
          </div>

          <div className="sv-cat-tabs">
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`sv-cat-tab ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="sv-main">
        {loading ? (
          <div className="sv-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="sv-card-skeleton">
                <div className="sv-skel-line sv-skel-header" />
                <div className="sv-skel-logo" />
                <div className="sv-skel-line sv-skel-name" />
                <div className="sv-skel-line sv-skel-btn" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sv-empty">
            <Tv size={48} />
            <p>No channels found</p>
          </div>
        ) : (
          <div className="sv-grid">
            {filtered.map((ch) => {
              const id = ch.id || ch._id || '';
              return (
                <ChannelCard
                  key={id}
                  channel={ch}
                  isActive={(activeChannel?.id || activeChannel?._id) === id}
                  isFavorite={favorites.has(id)}
                  onSelect={() => setActiveChannel(ch)}
                  onToggleFav={(e) => { e.stopPropagation(); toggle(id); }}
                />
              );
            })}
          </div>
        )}
      </main>

      {activeChannel && (
        <PlayerModal
          channel={activeChannel}
          isFavorite={favorites.has(activeChannel.id || activeChannel._id || '')}
          onToggleFav={() => toggle(activeChannel.id || activeChannel._id || '')}
          onClose={() => setActiveChannel(null)}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
