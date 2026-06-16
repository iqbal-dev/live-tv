import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreamVault — IPTV Player',
  description: 'Live TV streaming player built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('sv-theme');document.documentElement.setAttribute('data-theme',t||'dark');})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
