'use client';
import { useState } from 'react';
import { LogIn, Tv } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: string, pass: string) => void;
  error: string;
  loading: boolean;
}

export function LoginPage({ onLogin, error, loading }: LoginPageProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(user, pass);
  };

  return (
    <div className="a-login-wrap">
      <div className="a-login-box">
        <div className="a-login-logo">
          <Tv size={32} color="#e50914" />
          <span>StreamVault</span>
        </div>
        <p className="a-login-sub">Admin Panel</p>

        <form onSubmit={submit} className="a-login-form">
          <div className="a-field">
            <label>Username</label>
            <input
              type="text" value={user} autoComplete="username"
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin" required
            />
          </div>
          <div className="a-field">
            <label>Password</label>
            <input
              type="password" value={pass} autoComplete="current-password"
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••" required
            />
          </div>
          {error && <div className="a-error">{error}</div>}
          <button type="submit" className="a-btn-primary" disabled={loading}>
            <LogIn size={15} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="a-login-hint">Default: admin / admin123</p>
      </div>
    </div>
  );
}
