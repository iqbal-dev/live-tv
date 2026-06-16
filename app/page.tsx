'use client';
import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/player/Sidebar';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { EPGPanel } from '@/components/player/EPGPanel';
import { M3UImportModal } from '@/components/player/M3UImportModal';
import { useFavorites } from '@/hooks/useFavorites';
import type { Channel, ViewMode } from '@/types';

export default function PlayerPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/channels/public')
      .then((res) => res.json())
      .then((data: Channel[]) => {
        setChannels(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showImport, setShowImport] = useState(false);
  const { favorites, toggle } = useFavorites();

  const allCategories = useMemo(
    () => ['All', ...Array.from(new Set(channels.map((c) => c.category))).sort()],
    [channels]
  );

  const filtered = useMemo(() => channels.filter((ch) => {
    const id = ch.id || ch._id || '';
    return ch.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || ch.category === category) &&
      (!showFavOnly || favorites.has(id));
  }), [channels, search, category, showFavOnly, favorites]);

  const handleImport = (imported: Channel[]) => {
    setChannels((prev) => {
      const ids = new Set(prev.map((c) => c.id || c._id));
      return [...prev, ...imported.filter((c) => !ids.has(c.id || c._id))];
    });
  };

  const handleNext = () => {
    if (!filtered.length) return;
    const idx = filtered.findIndex((ch) => (ch.id || ch._id) === (activeChannel?.id || activeChannel?._id));
    const next = filtered[(idx + 1) % filtered.length];
    setActiveChannel(next);
  };

  return (
    <div className="app">
      <Sidebar
        channels={filtered} activeChannel={activeChannel} onSelect={setActiveChannel}
        favorites={favorites} onToggleFav={toggle}
        search={search} onSearch={setSearch}
        category={category} onCategory={setCategory}
        showFavOnly={showFavOnly} onToggleFavFilter={() => setShowFavOnly((v) => !v)}
        viewMode={viewMode} onViewMode={setViewMode}
        onImportClick={() => setShowImport(true)}
        allCategories={allCategories}
        loading={loading}
      />
      <main className="main">
        <VideoPlayer channel={activeChannel} onNext={handleNext} />
        <EPGPanel channel={activeChannel} />
      </main>
      {showImport && <M3UImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}
    </div>
  );
}
