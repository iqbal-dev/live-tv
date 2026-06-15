import type { Channel, AdminCategory } from '@/types';

function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : ''; }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, opts);
  if (!res.ok) { const e = await res.json().catch(() => ({ error: 'Unknown' })); throw new Error(e.error); }
  return res.json();
}

export const adminLogin = (u: string, p: string) =>
  req<{ token: string; username: string }>('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });

export const fetchChannels = () => req<Channel[]>('/api/channels', { headers: authHeaders() });
export const createChannel = (d: Partial<Channel>) => req<Channel>('/api/channels', { method: 'POST', headers: authHeaders(), body: JSON.stringify(d) });
export const updateChannel = (id: string, d: Partial<Channel>) => req<Channel>(`/api/channels/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(d) });
export const deleteChannel = (id: string) => req(`/api/channels/${id}`, { method: 'DELETE', headers: authHeaders() });
export const bulkDeleteChannels = (ids: string[]) => req<{ deleted: number }>('/api/channels/bulk-delete', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ids }) });
export const reorderChannels = (orderedIds: string[]) => req('/api/channels/reorder', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ orderedIds }) });
export const toggleChannel = (id: string) => req<Channel>(`/api/channels/${id}`, { method: 'PATCH', headers: authHeaders() });
export const importM3U = (d: { url?: string; content?: string }) => req<{ imported: number; skipped: number; total: number }>('/api/channels/import-m3u', { method: 'POST', headers: authHeaders(), body: JSON.stringify(d) });

export const fetchCategories = () => req<AdminCategory[]>('/api/categories', { headers: authHeaders() });
export const createCategory = (d: Partial<AdminCategory>) => req<AdminCategory>('/api/categories', { method: 'POST', headers: authHeaders(), body: JSON.stringify(d) });
export const updateCategory = (id: string, d: Partial<AdminCategory>) => req<AdminCategory>(`/api/categories/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(d) });
export const deleteCategory = (id: string) => req(`/api/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
export const reorderCategories = (orderedIds: string[]) => req('/api/categories/reorder', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ orderedIds }) });
