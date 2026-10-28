import { motion, useReducedMotion } from 'motion/react';
import { clip, shopLinkFor, shortName, type Product } from '../data/catalog';
import LaunchFilm from './LaunchFilm';

interface SpotlightHeroProps {
  /** Spotlighted product. */
  product: Product;
  /** Category id, used for shop-link resolution. */
  catId: string;
  /** Hero eyebrow above the product name (defaults to "New"). */
  eyebrow?: string;
  /** Short hero line — Apple-style fragment, e.g. "Total AI powerhouse." */
  line?: string;
  /** Supporting sentence under the line (falls back to the product tagline). */
  copy?: string;
  /** Dark hero variant (default) or light. */
  theme?: 'dark' | 'light';
  filmClip?: string;
}

/**
 * Full-bleed product hero, Apple "family page" style: huge product shot on a
 * dark stage, headline fragment, and shop CTA. Fades/rises in on mount.
 */
export default function SpotlightHero({
  product,
  catId,
  eyebrow = 'New',
  line,
  copy,
  theme = 'dark',
  filmClip,
}: SpotlightHeroProps) {
  const reduceMotion = useReducedMotion();
  const buy = shopLinkFor(catId, product);
  const name = shortName(product.name);
  const dark = theme === 'dark';

  return (
    <section className={`spotlight-stage relative overflow-hidden ${dark ? 'bg-night text-white' : 'bg-surface-alt'}`}>
      {/* soft brand-red halo behind the product */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(220,38,38,0.5) 0%, rgba(220,38,38,0) 70%)',
        }}
      />

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-16 pt-16 text-center lg:pt-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex w-full flex-col items-center"
        >
          <p className={`eyebrow ${dark ? 'text-brand' : 'text-brand'}`}>{eyebrow}</p>
          <h1 className={`display-lg mt-2 ${dark ? 'text-white' : ''}`}>{line ?? name}</h1>
          <p className={`mx-auto mt-4 max-w-xl text-lg ${dark ? 'text-white/70' : 'text-ink-soft'}`}>
            {copy ?? product.tagline}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <a className="btn-pill btn-primary" href={buy} target="_blank" rel="noreferrer">
              Buy at REDAPPLEKE
            </a>
            <a
              className={`btn-pill ${dark ? 'btn-ghost-light' : 'btn-ghost'}`}
              href={product.appleUrl}
              target="_blank"
              rel="noreferrer"
            >
              Full specs
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="spotlight-product-stage relative mt-10 grid min-h-[260px] w-full place-items-center sm:min-h-[360px]"
        >
          <div aria-hidden className="spotlight-product-glow absolute inset-0" />
          {filmClip && clip(filmClip) ? (
            <LaunchFilm clipKey={filmClip} label={`${name} product film`} className="spotlight-film relative z-10 w-full max-w-[960px]" fit="contain" />
          ) : (
            <img
              src={product.image}
              alt={name}
              loading="lazy"
              className="relative z-10 max-h-[420px] w-auto max-w-full object-contain drop-shadow-2xl"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
