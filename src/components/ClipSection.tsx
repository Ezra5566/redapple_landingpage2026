import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { clip, type ClipSection as ClipSectionData } from '../data/catalog';

interface ClipSectionProps {
  config: ClipSectionData;
  /** Section background: 'white' or 'alt' (light gray). */
  bg?: 'white' | 'alt';
}

/**
 * Apple-style product film: a fixed aspect-ratio stage holding a muted,
 * looping clip that plays only while visible. Layout is completely stable —
 * the stage reserves the clip's exact aspect ratio before the video loads,
 * and the poster paints the first frame so there is no pop-in.
 */
export default function ClipSection({ config, bg = 'white' }: ClipSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const data = clip(config.clipKey);
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
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          setPlaying(false);
        } else if (!manualPause.current) {
          void video.play().then(() => {
            if (!disposed) setPlaying(true);
          }).catch(() => {
            if (!disposed) setPlaying(false);
          });
        }
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => {
      disposed = true;
      io.disconnect();
      video.pause();
    };
  }, [data, reduceMotion]);

  if (!data) return null; // clip missing from catalogue — skip silently

  const bgClass = bg === 'white' ? 'bg-white' : 'bg-surface-alt';
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      manualPause.current = false;
      if (reduceMotion) return;
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      manualPause.current = true;
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <section className={`${bgClass} py-20`}>
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {config.eyebrow && <p className="eyebrow">{config.eyebrow}</p>}
          <h2 className="display-md mt-2">{config.headline}</h2>
          <p className="body-copy mx-auto mt-3 max-w-xl">{config.copy}</p>
        </motion.div>

        {/* Fixed aspect-ratio stage — reserves space before the video loads */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
          className="mx-auto mt-10"
          style={{ maxWidth: `${data.width}px` }}
        >
          <div
            className="category-film-stage relative overflow-hidden rounded-[2rem] bg-night shadow-[0_30px_60px_rgb(0_0_0/0.12)]"
            style={{ aspectRatio: `${data.width} / ${data.height}` }}
          >
            <video
              ref={(el) => {
                videoRef.current = el;
                // React applies `muted` as a DOM property, not an attribute —
                // Safari's autoplay policy wants the attribute too.
                if (el) {
                  el.muted = true;
                  el.setAttribute('muted', '');
                }
              }}
              className="absolute inset-0 h-full w-full object-contain"
              poster={data.poster}
              muted
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setFailed(true)}
              onLoadedData={() => setFailed(false)}
              onClick={() => {
                if (videoRef.current?.paused) {
                  manualPause.current = false;
                  if (reduceMotion) return;
                  videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
                } else if (videoRef.current) {
                  manualPause.current = true;
                  videoRef.current.pause();
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
            </video>
            {failed && <p className="absolute inset-0 z-10 grid place-items-center text-white/80">Film unavailable.</p>}
            <button type="button" onClick={(event) => { event.stopPropagation(); togglePlayback(); }} className="category-film-control absolute bottom-4 right-4 z-20 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-sm text-white backdrop-blur-md" aria-label={playing ? `Pause ${config.eyebrow ?? config.headline}` : `Play ${config.eyebrow ?? config.headline}`} aria-pressed={playing} disabled={reduceMotion && !playing} title={reduceMotion ? 'Playback is disabled by your reduced-motion preference' : undefined}>{playing ? 'Pause film' : 'Play film'}</button>
          </div>
          <p className="mt-4 text-xs text-ink-faint">{config.footnote}</p>
        </motion.div>
      </div>
    </section>
  );
}
