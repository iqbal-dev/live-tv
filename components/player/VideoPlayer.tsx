'use client';
import { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Maximize, Play, Pause, AlertCircle, Loader2 } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import type { Channel } from '@/types';

interface Props {
  channel: Channel | null;
  onNext?: () => void;
}

export function VideoPlayer({ channel, onNext }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleError = useCallback((msg: string, autoSwitch?: boolean) => {
    if (autoSwitch && onNext) {
      onNext();
    } else {
      setError(msg);
    }
  }, [onNext]);

  const handleLoading = useCallback((l: boolean) => {
    setLoading(l);
    if (l) { setError(null); setBuffering(false); }
  }, []);

  const videoRef = usePlayer(channel?.url ?? null, handleError, handleLoading);

  const showCtrl = () => {
    setShowControls(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    const val = parseFloat(e.target.value);
    if (!v) return;
    v.volume = val; setVolume(val); setMuted(val === 0);
  };

  if (!channel) return (
    <div className="player-empty">
      <div className="player-empty-inner">
        <div className="player-icon-wrap">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <p className="player-empty-title">Select a channel to start watching</p>
        <p className="player-empty-sub">Browse channels on the left panel</p>
      </div>
    </div>
  );

  return (
    <div
      className="video-player"
      onMouseMove={showCtrl}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={showCtrl}
    >
      <video
        ref={videoRef}
        className="video-el"
        playsInline
        onWaiting={() => { if (!loading) setBuffering(true); }}
        onPlaying={() => {
          if (buffering) {
            const v = videoRef.current;
            if (v && v.seekable.length > 0) {
              const liveEdge = v.seekable.end(v.seekable.length - 1);
              if (liveEdge - v.currentTime > 2) v.currentTime = liveEdge;
            }
          }
          setBuffering(false);
        }}
        onCanPlay={() => setBuffering(false)}
      />

      {loading && (
        <div className="player-loader">
          <Loader2 size={40} className="player-spinner" />
          <p className="player-loader-name">{channel.name}</p>
        </div>
      )}

      {buffering && !loading && !error && (
        <div className="player-buffering">
          <Loader2 size={36} className="player-spinner" />
        </div>
      )}

      {error && (
        <div className="player-error">
          <AlertCircle size={36} />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className={`player-overlay ${showControls ? 'visible' : ''}`}>
          <div className="player-top">
            <div className="player-channel-info">
              {channel.logo && (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="player-channel-logo"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              <div>
                <div className="player-channel-name">{channel.name}</div>
                <div className="player-live-badge"><span className="live-dot" />LIVE</div>
              </div>
            </div>
          </div>
          <div className="player-center" onClick={togglePlay}>
            {paused && <div className="play-btn-center"><Play size={40} fill="white" /></div>}
          </div>
          <div className="player-controls">
            <button className="ctrl-btn" onClick={togglePlay}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
            <button className="ctrl-btn" onClick={toggleMute}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={handleVolume} className="volume-slider" />
            <div className="ctrl-spacer" />
            <button className="ctrl-btn" onClick={() => videoRef.current?.requestFullscreen()}><Maximize size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
