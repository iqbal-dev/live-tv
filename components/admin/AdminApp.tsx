'use client';
import { useState, useCallback, useEffect } from 'react';
import { LoginPage } from './LoginPage';
import { AdminDashboard } from './AdminDashboard';
import { adminLogin } from './adminApi';
import './admin.css';

export function AdminApp() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('admin_token') || '');
    setUsername(localStorage.getItem('admin_user') || '');
  }, []);

  const login = useCallback(async (user: string, pass: string) => {
    setLoading(true); setError('');
    try {
      const res = await adminLogin(user, pass);
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', res.username);
      setToken(res.token); setUsername(res.username);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user');
    setToken(''); setUsername('');
  }, []);

  if (!token) return <LoginPage onLogin={login} error={error} loading={loading} />;
  return <AdminDashboard username={username} onLogout={logout} />;
}
