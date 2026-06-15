'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Save, X } from 'lucide-react';
import type { AdminCategory } from '@/types';
import { createCategory, updateCategory, deleteCategory, reorderCategories } from './adminApi';

interface CategoryManagerProps {
  categories: AdminCategory[];
  onRefresh: () => void;
}

export function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📺');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createCategory({ name: newName.trim(), icon: newIcon });
      setNewName(''); setNewIcon('📺'); setAdding(false);
      onRefresh();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);
    try {
      await updateCategory(editing._id, { name: editing.name, icon: editing.icon });
      setEditing(null);
      onRefresh();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (cat: AdminCategory) => {
    if (!confirm(`Delete "${cat.name}"? Channels will move to Uncategorized.`)) return;
    try {
      await deleteCategory(cat._id);
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  const handleDrop = async (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setDragIdx(null); setOverIdx(null);
    try {
      await reorderCategories(reordered.map((c) => c._id));
      onRefresh();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="a-cat-manager">
      <div className="a-cat-header">
        <h3>Category Management</h3>
        <button className="a-btn-primary" onClick={() => setAdding(true)}>
          <Plus size={14} />Add Category
        </button>
      </div>

      {adding && (
        <div className="a-cat-add-row">
          <input value={newIcon} onChange={(e) => setNewIcon(e.target.value)}
            className="a-emoji-input" placeholder="📺" maxLength={4} />
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} autoFocus />
          <button className="a-btn-primary" onClick={handleAdd} disabled={saving}><Save size={13} /></button>
          <button className="a-btn-ghost" onClick={() => setAdding(false)}><X size={13} /></button>
        </div>
      )}

      <div className="a-cat-list">
        {categories.map((cat, idx) => (
          <div
            key={cat._id}
            className={`a-cat-item ${overIdx === idx ? 'drag-over' : ''}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
            onDragLeave={() => setOverIdx(null)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          >
            <GripVertical size={14} className="a-grip" />

            {editing?._id === cat._id ? (
              <>
                <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className="a-emoji-input" maxLength={4} />
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="a-cat-name-input" onKeyDown={(e) => e.key === 'Enter' && handleEdit()} autoFocus />
                <button className="a-icon-btn accent" onClick={handleEdit} disabled={saving}><Save size={14} /></button>
                <button className="a-icon-btn" onClick={() => setEditing(null)}><X size={14} /></button>
              </>
            ) : (
              <>
                <span className="a-cat-icon">{cat.icon}</span>
                <span className="a-cat-name">{cat.name}</span>
                <span className="a-cat-count">{cat.channelCount} ch</span>
                <button className="a-icon-btn" onClick={() => setEditing(cat)}><Pencil size={13} /></button>
                <button className="a-icon-btn danger" onClick={() => handleDelete(cat)}><Trash2 size={13} /></button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="a-empty">No categories yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}
