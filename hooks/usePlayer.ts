'use client';
import { useEffect, useRef, useCallback } from 'react';

export function usePlayer(
  url: string | null,
  onError?: (msg: string, fatal?: boolean) => void,
  onLoading?: (loading: boolean) => void,
) {
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
    onLoading?.(true);

    const proxiedUrl = `/api/stream-proxy?url=${encodeURIComponent(url)}`;

    (async () => {
      const Hls = (await import('hls.js')).default;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hlsRef.current = hls;
        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          onLoading?.(false);
          if (!data.levels?.length) {
            onError?.('Stream is empty or offline', true);
            return;
          }
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            onLoading?.(false);
            onError?.(`Stream error: ${data.type}`, data.type === Hls.ErrorTypes.NETWORK_ERROR);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedUrl;
        video.addEventListener('loadedmetadata', () => onLoading?.(false), { once: true });
        video.addEventListener('error', () => { onLoading?.(false); onError?.('Stream error: networkError', true); }, { once: true });
        video.play().catch(() => {});
      } else {
        onLoading?.(false);
        onError?.('HLS not supported in this browser', false);
      }
    })();

    return destroy;
  }, [url, destroy, onError, onLoading]);

  return videoRef;
}
