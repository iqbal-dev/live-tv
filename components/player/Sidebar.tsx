'use client';
import { Search, LayoutGrid, List, Heart, Upload } from 'lucide-react';
import { ChannelCard } from './ChannelCard';
import type { Channel, ViewMode } from '@/types';

interface Props {
  channels: Channel[];
  activeChannel: Channel | null;
  onSelect: (ch: Channel) => void;
  favorites: Set<string>;
  onToggleFav: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  showFavOnly: boolean;
  onToggleFavFilter: () => void;
  viewMode: ViewMode;
  onViewMode: (v: ViewMode) => void;
  onImportClick: () => void;
  allCategories: string[];
}

export function Sidebar({ channels, activeChannel, onSelect, favorites, onToggleFav, search, onSearch, category, onCategory, showFavOnly, onToggleFavFilter, viewMode, onViewMode, onImportClick, allCategories }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="14" rx="2" stroke="#e50914" strokeWidth="2"/>
            <path d="M8 10l5 3-5 3V10z" fill="#e50914"/>
            <line x1="7" y1="20" x2="17" y2="20" stroke="#e50914" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="sidebar-logo-text">StreamVault</span>
        </div>
        <button className="import-btn" onClick={onImportClick} title="Import M3U"><Upload size={15} /></button>
      </div>
      <div className="search-wrap">
        <Search size={14} className="search-icon" />
        <input className="search-input" type="text" placeholder="Search channels…" value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>
      <div className="filters-row">
        <button className={`fav-filter-btn ${showFavOnly ? 'active' : ''}`} onClick={onToggleFavFilter}>
          <Heart size={13} fill={showFavOnly ? 'currentColor' : 'none'} />Favorites
        </button>
        <div className="view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => onViewMode('grid')}><LayoutGrid size={14} /></button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => onViewMode('list')}><List size={14} /></button>
        </div>
      </div>
      <div className="category-pills">
        {allCategories.map((cat) => (
          <button key={cat} className={`cat-pill ${category === cat ? 'active' : ''}`} onClick={() => onCategory(cat)}>{cat}</button>
        ))}
      </div>
      <div className="channel-count">{channels.length} channel{channels.length !== 1 ? 's' : ''}</div>
      <div className={`channel-list ${viewMode === 'grid' ? 'grid' : 'list-view'}`}>
        {channels.length === 0
          ? <div className="channels-empty">No channels found</div>
          : channels.map((ch) => {
              const id = ch.id || ch._id || '';
              return (
                <ChannelCard
                  key={id}
                  channel={ch}
                  isActive={(activeChannel?.id || activeChannel?._id) === id}
                  isFavorite={favorites.has(id)}
                  onSelect={() => onSelect(ch)}
                  onToggleFav={(e) => { e.stopPropagation(); onToggleFav(id); }}
                  viewMode={viewMode}
                />
              );
            })}
      </div>
    </aside>
  );
}
