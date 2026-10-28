import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clip } from '../data/catalog';

interface LaunchFilmProps {
  clipKey: string;
  className?: string;
  fit?: 'cover' | 'contain';
  label: string;
}

/** Deferred, muted product film that only plays while near the viewport. */
export default function LaunchFilm({ clipKey, className = '', fit = 'cover', label }: LaunchFilmProps) {
  const data = clip(clipKey);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const manualPause = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !data) return;

    if (reduceMotion) {
      video.pause();
      return;
    }

    let disposed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          setPlaying(false);
          return;
        }
        if (!manualPause.current) {
          void video.play().then(() => {
            if (!disposed) setPlaying(true);
          }).catch(() => {
            if (!disposed) setPlaying(false);
          });
        }
      },
      { rootMargin: '0px', threshold: 0.25 },
    );
    observer.observe(video);
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
    };
  }, [data, reduceMotion]);

  if (!data) return null;

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      manualPause.current = false;
      if (reduceMotion) return;
      void video.play().then(() => {
        setFailed(false);
        setPlaying(true);
      }).catch(() => setPlaying(false));
    } else {
      manualPause.current = true;
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(14px)' }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`launch-film relative isolate overflow-hidden ${failed ? 'launch-film-failed' : ''} ${className}`}
      style={{ aspectRatio: `${data.width} / ${data.height}` }}
    >
      <div className="launch-film-bleed absolute inset-0" aria-hidden />
      <video
        ref={(element) => {
          videoRef.current = element;
          if (element) {
            element.muted = true;
            element.setAttribute('muted', '');
          }
        }}
        className={`relative z-10 h-full w-full object-${fit} ${fit === 'contain' ? 'launch-film-contain' : ''}`}
        poster={data.poster}
        muted
        disablePictureInPicture
        onError={() => setFailed(true)}
        onLoadedData={() => setFailed(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) {
            manualPause.current = false;
            if (reduceMotion) return;
            void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
          } else {
            manualPause.current = true;
            video.pause();
            setPlaying(false);
          }
        }}
        loop
        playsInline
        preload="metadata"
        aria-label={data.alt}
        role="img"
      >
        {data.sources.map((source) => (
          <source key={source.file} src={source.file} media={source.media || undefined} type="video/mp4" />
        ))}
        Your browser does not support embedded video.
      </video>
      {failed && <div className="launch-film-error absolute inset-0 z-20 grid place-items-center p-6 text-center text-sm text-white/80">This product film is unavailable right now.</div>}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-4 sm:p-5">
        <span className="text-xs font-medium text-white/75">{label}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            togglePlayback();
          }}
          className="launch-film-control rounded-full border border-white/25 bg-black/35 px-3 py-2 text-xs font-medium text-white backdrop-blur-md"
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          aria-pressed={playing}
          disabled={reduceMotion && !playing}
          title={reduceMotion ? 'Playback is disabled by your reduced-motion preference' : undefined}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </motion.div>
  );
}
