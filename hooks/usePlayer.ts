'use client';
import { useEffect, useRef, useCallback } from 'react';

export function usePlayer(url: string | null, onError?: (msg: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);

  const destroy = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    destroy();

    const proxiedUrl = `/api/stream-proxy?url=${encodeURIComponent(url)}`;

    (async () => {
      const Hls = (await import('hls.js')).default;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hlsRef.current = hls;
        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          if (!data.levels?.length) {
            onError?.('Stream is empty or offline');
            return;
          }
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) onError?.(`Stream error: ${data.type}`);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedUrl;
        video.play().catch(() => {});
      } else {
        onError?.('HLS not supported in this browser');
      }
    })();

    return destroy;
  }, [url, destroy, onError]);

  return videoRef;
}
