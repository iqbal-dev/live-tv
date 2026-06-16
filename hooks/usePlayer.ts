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
    let resolved = false;

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        destroy();
        onLoading?.(false);
        onError?.('Stream timed out', true);
      }
    }, 10000);

    const resolve = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
      }
    };

    (async () => {
      const Hls = (await import('hls.js')).default;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hlsRef.current = hls;
        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          resolve();
          onLoading?.(false);
          if (!data.levels?.length) {
            onError?.('Stream is empty or offline', true);
            return;
          }
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            resolve();
            onLoading?.(false);
            onError?.(`Stream error: ${data.type}`, data.type === Hls.ErrorTypes.NETWORK_ERROR);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedUrl;
        video.addEventListener('loadedmetadata', () => { resolve(); onLoading?.(false); }, { once: true });
        video.addEventListener('error', () => { resolve(); onLoading?.(false); onError?.('Stream error: networkError', true); }, { once: true });
        video.play().catch(() => {});
      } else {
        resolve();
        onLoading?.(false);
        onError?.('HLS not supported in this browser', false);
      }
    })();

    return () => { clearTimeout(timeoutId); destroy(); };
  }, [url, destroy, onError, onLoading]);

  return videoRef;
}
