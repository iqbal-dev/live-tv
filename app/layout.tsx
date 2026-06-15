import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreamVault — IPTV Player',
  description: 'Dark cinema IPTV player built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning style={{ margin: 0, background: '#0a0a0f', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
