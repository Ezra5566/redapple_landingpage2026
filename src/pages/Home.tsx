import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import LazyHeroScene from '../three/LazyHeroScene';
import ProductCard from '../components/ProductCard';
import { categories, allProducts, SHOP_ALL } from '../data/catalog';
import { trackScroll } from '../lib/scrollState';

const CATEGORY_BLURB: Record<string, string> = {
  iphone: 'The latest iPhone lineup, in every colour.',
  mac: 'MacBook Air, MacBook Pro, iMac and more.',
  ipad: 'iPad Pro, Air, mini — with Pencil and keyboards.',
  watch: 'Series 12, Ultra 4 and SE 3 on your wrist.',
  airpods: 'Pro, 4 and Max. Pure spatial audio.',
  'tv-home': 'Apple TV 4K, HomePod and HomePod mini.',
  accessories: 'Cases, chargers, straps, Pencil, AirTag…',
};

/** Home of REDAPPLEKE — Apple-style landing page with an interactive 3D hero. */
export default function Home() {
  const reduceMotion = useReducedMotion();

  // ---- scroll-reactive hero (Apple product-page pattern) ----------------
  // The hero pins for ~1.4 screens of scroll. As you scroll:
  //   - the 3D scene recedes/rises/tips (driven by the render loop, see
  //     lib/scrollState + three/HeroScene)
  //   - the headline fades, lifts and shrinks slightly
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0.04, 0.3], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0.04, 0.3], [0, -110]);
  const contentScale = useTransform(scrollYProgress, [0.04, 0.35], [1, 0.94]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.02, 0.12], [1, 1, 0]);

  // once the content is invisible, stop its buttons from catching clicks
  // (reduced-motion users keep a static, always-visible hero)
  const [heroLive, setHeroLive] = useState(true);
  useMotionValueEvent(scrollYProgress, 'change', (v) =>
    setHeroLive(reduceMotion ? true : v < 0.32),
  );

  // feed raw progress + velocity to the Three.js render loop
  useEffect(() => {
    if (reduceMotion || !heroRef.current) return;
    return trackScroll(heroRef.current);
  }, [reduceMotion]);

  const heroContentStyle = reduceMotion
    ? undefined
    : { opacity: contentOpacity, y: contentY, scale: contentScale };

  // curated strip: flagship of each category
  const flags = ['iphone-18-pro', 'iphone-duo', 'macbook-pro', 'ipad-pro', 'apple-watch-ultra-4', 'airpods-pro', 'apple-tv-4k'];
  const flagship = flags
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main>
      {/* ---------------------------------------------------------- */}
      {/* HERO — pinned, scroll-reactive 3D scene + headline          */}
      {/* ---------------------------------------------------------- */}
      <section ref={heroRef} className="relative -mt-11 h-[240vh] bg-night text-white">
        {/* sticky viewport — the scene stays put while scroll progress drives it */}
        <div className="sticky top-11 h-[calc(100vh-2.75rem)] overflow-hidden">
          <LazyHeroScene />

          {/* readability veil — content stays crisp over the 3D scene */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_62%,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0)_100%)]" />

          <motion.div
            style={heroContentStyle}
            className={`pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 text-center ${
              heroLive ? '' : 'invisible'
            }`}
          >
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="eyebrow"
          >
            REDAPPLEKE — Apple Reseller, Kenya
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: 'easeOut' }}
            className="display-xl mt-3"
          >
            Every Apple.
            <br />
            <span className="text-brand">One store.</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: 'easeOut' }}
            className="mx-auto mt-5 max-w-xl text-lg text-white/70"
          >
            Explore the full Apple lineup and its features — then get it from a store you trust.
            Drag the scene. It&apos;s alive.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: 'easeOut' }}
            className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a className="btn-pill btn-primary" href={SHOP_ALL} target="_blank" rel="noreferrer">
              Shop All
            </a>
            <a className="btn-pill btn-ghost-light" href="#flagships">
              Explore the lineup
            </a>
          </motion.div>
        </motion.div>

        {/* scroll hint — pinned to the sticky viewport, fades fast */}
        <motion.div
          style={reduceMotion ? undefined : { opacity: hintOpacity }}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={reduceMotion ? undefined : { delay: 1, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/40"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CATEGORY GRID — mirrors apple.com's top categories          */}
      {/* ---------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1024px] bg-surface px-6 py-20">
        <h2 className="display-md text-center">Shop by category</h2>
        <p className="body-copy mt-3 text-center">Seven aisles. One Apple universe.</p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const heroImg = cat.products[0]?.image;
            return (
              <motion.div
                key={cat.id}
                initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: 'easeOut' }}
              >
                <Link
                  to={`/c/${cat.id}`}
                  className="product-card group flex h-full flex-col overflow-hidden rounded-3xl bg-surface-alt"
                >
                  <div className="relative overflow-hidden">
                    {heroImg ? (
                      <img
                        src={heroImg}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full object-contain p-8 transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="aspect-[16/10] bg-surface" />
                    )}
                    <span className="absolute left-5 top-5 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-1.5 px-6 pb-7 text-center">
                    <h3 className="text-lg font-semibold tracking-tight">{cat.label}</h3>
                    <p className="text-sm text-ink-soft">{CATEGORY_BLURB[cat.id]}</p>
                    <span className="link-chevron mt-2 inline-flex items-center gap-1 text-sm">
                      View <span aria-hidden>›</span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FLAGSHIP STRIP                                              */}
      {/* ---------------------------------------------------------- */}
      <section id="flagships" className="relative scroll-mt-24 bg-night py-20 text-white">
        <div className="mx-auto max-w-[1024px] px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">This season</p>
              <h2 className="display-md mt-2">The flagships.</h2>
            </div>
            <a className="btn-pill btn-primary" href={SHOP_ALL} target="_blank" rel="noreferrer">
              Shop All
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flagship.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: 'easeOut' }}
                className="rounded-2xl bg-night-soft"
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* WHY REDAPPLEKE                                              */}
      {/* ---------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1024px] bg-surface px-6 py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              t: 'Genuine Apple products',
              d: 'Sealed, warrantied stock sourced through official channels — every time.',
            },
            {
              t: 'Kenyan prices, Apple care',
              d: 'Local pricing in KSh with trade-in options and after-sales support in-store.',
            },
            {
              t: 'See it, then buy it',
              d: 'Every product page links straight to shop.redappleke.com — no hunting around.',
            },
          ].map((item) => (
            <div key={item.t} className="text-center md:text-left">
              <h3 className="text-lg font-semibold tracking-tight">{item.t}</h3>
              <p className="body-copy mt-2 text-[0.95rem]">{item.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
