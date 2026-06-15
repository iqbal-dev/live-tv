'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Tv, LayoutGrid, Tag, Upload, LogOut, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, Search, GripVertical, RefreshCw,
  CheckSquare, Square, AlertCircle, Wifi, WifiOff, ChevronUp, ChevronDown
} from 'lucide-react';
import type { Channel, AdminCategory } from '@/types';
import {
  fetchChannels, fetchCategories, createChannel, updateChannel,
  deleteChannel, bulkDeleteChannels, toggleChannel, reorderChannels,
} from './adminApi';
import { ChannelForm } from './ChannelForm';
import { M3UImportModal } from './M3UImportModal';
import { CategoryManager } from './CategoryManager';

type Tab = 'channels' | 'categories';
type SortKey = 'name' | 'category' | 'order' | 'isActive';

interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
}

export function AdminDashboard({ username, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('channels');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editChannel, setEditChannel] = useState<Channel | null | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [sortAsc, setSortAsc] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [chs, cats] = await Promise.all([fetchChannels(), fetchCategories()]);
      setChannels(chs);
      setCategories(cats);
    } catch (e: any) {
      showToast('⚠️ ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered + sorted channels
  const displayed = channels
    .filter((ch) => {
      const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase()) ||
        ch.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'All' || ch.category === catFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === 'order') diff = (a.order ?? 0) - (b.order ?? 0);
      else if (sortKey === 'name') diff = a.name.localeCompare(b.name);
      else if (sortKey === 'category') diff = a.category.localeCompare(b.category);
      else if (sortKey === 'isActive') diff = Number(b.isActive) - Number(a.isActive);
      return sortAsc ? diff : -diff;
    });

  const allSelected = displayed.length > 0 && displayed.every((c) => selected.has(c._id || ''));

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(displayed.map((c) => c._id || '')));
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const handleSave = async (data: Partial<Channel>) => {
    if (editChannel?._id) {
      await updateChannel(editChannel._id || '', data);
      showToast('✅ Channel updated');
    } else {
      await createChannel(data);
      showToast('✅ Channel created');
    }
    await loadData();
  };

  const handleDelete = async (ch: Channel) => {
    if (!confirm(`Delete "${ch.name}"?`)) return;
    await deleteChannel(ch._id || '');
    showToast('🗑️ Channel deleted');
    await loadData();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} channel(s)?`)) return;
    await bulkDeleteChannels([...selected]);
    setSelected(new Set());
    showToast(`🗑️ ${selected.size} channels deleted`);
    await loadData();
  };

  const handleToggle = async (ch: Channel) => {
    await toggleChannel(ch._id || '');
    await loadData();
  };

  const handleDrop = async (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = [...displayed];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setDragIdx(null); setOverIdx(null);
    await reorderChannels(reordered.map((c) => c._id || ''));
    await loadData();
    showToast('↕️ Order saved');
  };

  const allCats = ['All', ...categories.map((c) => c.name)];
  const activeCount = channels.filter((c) => c.isActive).length;

  return (
    <div className="a-app">
      {/* Sidebar */}
      <aside className="a-sidebar">
        <div className="a-sidebar-logo">
          <Tv size={22} color="#e50914" />
          <span>StreamVault</span>
        </div>
        <nav className="a-nav">
          <button className={tab === 'channels' ? 'active' : ''} onClick={() => setTab('channels')}>
            <LayoutGrid size={16} />Channels
            <span className="a-nav-badge">{channels.length}</span>
          </button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>
            <Tag size={16} />Categories
            <span className="a-nav-badge">{categories.length}</span>
          </button>
        </nav>
        <div className="a-sidebar-stats">
          <div className="a-stat"><Wifi size={13} color="#4ade80" /><span>{activeCount} active</span></div>
          <div className="a-stat"><WifiOff size={13} color="#f87171" /><span>{channels.length - activeCount} inactive</span></div>
        </div>
        <div className="a-sidebar-footer">
          <span className="a-username">👤 {username}</span>
          <button className="a-logout" onClick={onLogout}><LogOut size={14} />Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="a-main">
        {tab === 'channels' ? (
          <>
            {/* Toolbar */}
            <div className="a-toolbar">
              <div className="a-toolbar-left">
                <h2>Channel Management</h2>
                <span className="a-count">{displayed.length} / {channels.length} channels</span>
              </div>
              <div className="a-toolbar-right">
                <button className="a-icon-btn" onClick={loadData} title="Refresh"><RefreshCw size={15} /></button>
                <button className="a-btn-ghost" onClick={() => setShowImport(true)}>
                  <Upload size={14} />Bulk Import
                </button>
                <button className="a-btn-primary" onClick={() => setEditChannel(null)}>
                  <Plus size={14} />Add Channel
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="a-filters">
              <div className="a-search-wrap">
                <Search size={13} />
                <input placeholder="Search channels…" value={search}
                  onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="a-cat-pills">
                {allCats.map((cat) => (
                  <button key={cat} className={catFilter === cat ? 'active' : ''}
                    onClick={() => setCatFilter(cat)}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <div className="a-bulk-bar">
                <span>{selected.size} selected</span>
                <button className="a-btn-danger" onClick={handleBulkDelete}>
                  <Trash2 size={13} />Delete Selected
                </button>
                <button className="a-btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
              </div>
            )}

            {/* Table */}
            <div className="a-table-wrap">
              {loading ? (
                <div className="a-loading"><RefreshCw size={22} className="spin" />Loading channels…</div>
              ) : displayed.length === 0 ? (
                <div className="a-empty"><AlertCircle size={28} />No channels found</div>
              ) : (
                <table className="a-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}><button onClick={toggleAll} className="a-check">
                        {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button></th>
                      <th style={{ width: 30 }}></th>
                      <th style={{ width: 42 }}>Logo</th>
                      <th className="sortable" onClick={() => handleSort('name')}>Name <SortIcon k="name" /></th>
                      <th className="sortable" onClick={() => handleSort('category')}>Category <SortIcon k="category" /></th>
                      <th>Stream URL</th>
                      <th className="sortable" onClick={() => handleSort('isActive')}>Status <SortIcon k="isActive" /></th>
                      <th style={{ width: 100 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((ch, idx) => (
                      <tr
                        key={ch._id || ch.id}
                        className={`${selected.has(ch._id || '') ? 'row-selected' : ''} ${overIdx === idx ? 'drag-over' : ''} ${!ch.isActive ? 'row-inactive' : ''}`}
                        draggable
                        onDragStart={() => setDragIdx(idx)}
                        onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
                        onDragLeave={() => setOverIdx(null)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                      >
                        <td><button onClick={() => toggleSelect(ch._id || '')} className="a-check">
                          {selected.has(ch._id || '') ? <CheckSquare size={14} /> : <Square size={14} />}
                        </button></td>
                        <td><GripVertical size={14} className="a-grip" /></td>
                        <td>
                          <div className="a-ch-logo">
                            {ch.logo ? <img src={ch.logo} alt={ch.name} onError={(e) => (e.currentTarget.style.display = 'none')} /> : null}
                            <span>{ch.name[0]}</span>
                          </div>
                        </td>
                        <td><span className="a-ch-name">{ch.name}</span></td>
                        <td><span className="a-cat-badge">{ch.category}</span></td>
                        <td><span className="a-url-cell" title={ch.url}>{ch.url}</span></td>
                        <td>
                          <button className={`a-toggle-btn ${ch.isActive ? 'on' : 'off'}`} onClick={() => handleToggle(ch)}>
                            {ch.isActive ? <><ToggleRight size={16} />Active</> : <><ToggleLeft size={16} />Inactive</>}
                          </button>
                        </td>
                        <td>
                          <div className="a-row-actions">
                            <button className="a-icon-btn" onClick={() => setEditChannel(ch)} title="Edit"><Pencil size={14} /></button>
                            <button className="a-icon-btn danger" onClick={() => handleDelete(ch)} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="a-cat-page">
            <div className="a-toolbar">
              <div className="a-toolbar-left">
                <h2>Category Management</h2>
              </div>
              <div className="a-toolbar-right">
                <button className="a-icon-btn" onClick={loadData}><RefreshCw size={15} /></button>
              </div>
            </div>
            <CategoryManager categories={categories} onRefresh={loadData} />
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && <div className="a-toast">{toast}</div>}

      {/* Modals */}
      {editChannel !== undefined && (
        <ChannelForm
          channel={editChannel}
          categories={categories}
          onSave={handleSave}
          onClose={() => setEditChannel(undefined)}
        />
      )}
      {showImport && (
        <M3UImportModal onDone={loadData} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
