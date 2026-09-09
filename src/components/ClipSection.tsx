import { useEffect, useRef } from 'react';
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
  const reduceMotion = useReducedMotion();
  const data = clip(config.clipKey);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    // Play only while meaningfully on screen; pause the moment it isn't.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay block or interrupted load — poster stays up */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion]);

  if (!data) return null; // clip missing from catalogue — skip silently

  const bgClass = bg === 'white' ? 'bg-white' : 'bg-surface-alt';

  return (
    <section className={`${bgClass} py-20`}>
      <div className="mx-auto max-w-[1024px] px-6 text-center">
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
            className="relative overflow-hidden rounded-3xl bg-surface-alt shadow-[0_30px_60px_rgb(0_0_0/0.12)]"
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
              className="absolute inset-0 h-full w-full object-cover"
              poster={data.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-label={data.alt}
              role="img"
            >
              {data.sources.map((s) => (
                <source key={s.file} src={s.file} media={s.media || undefined} type="video/mp4" />
              ))}
            </video>
          </div>
          <p className="mt-4 text-xs text-ink-faint">{config.footnote}</p>
        </motion.div>
      </div>
    </section>
  );
}
