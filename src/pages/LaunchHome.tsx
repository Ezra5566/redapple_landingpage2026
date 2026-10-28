import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { allProducts, categories, SHOP_ALL, clip, type Product } from '../data/catalog';
import LaunchFilm from '../components/LaunchFilm';

const WHATSAPP_NUMBER = '254718398081';
const STORE_HOME = 'https://shop.redappleke.com/ke/en';

interface Launch {
  slug: string;
  category: string;
  name: string;
  label: string;
  preorderName?: string;
  film?: string;
  filmLabel?: string;
  image?: string;
  imageAlt?: string;
  description: string;
  details: string[];
}

const launches: Launch[] = [
  {
    slug: 'macbook-pro',
    category: 'mac',
    name: '14-inch MacBook Pro with M6',
    preorderName: '14-inch MacBook Pro with M6',
    label: 'The new MacBook Pro',
    film: 'macbook-m6-hero',
    filmLabel: 'MacBook Pro with M6 · PROLED XDR film',
    description: 'The newest 14-inch MacBook Pro with M6 — a major leap in performance and on-device AI.',
    details: ['M6 · 12-core CPU and 12-core GPU', 'Up to 24 hours of battery life', 'Liquid Retina XDR display'],
  },
  {
    slug: 'macbook-pro',
    category: 'mac',
    name: 'MacBook Pro with PROLED XDR',
    preorderName: 'MacBook Pro with PROLED XDR display',
    label: 'A new kind of display.',
    film: 'macbook-m6-touch-display',
    filmLabel: 'Touch display · MacBook Pro',
    description: 'An all-new MacBook Pro design with tandem OLED technology in the PROLED XDR display.',
    details: ['Tandem OLED display technology', 'Thinner, lighter design', 'Up to 24 hours of battery life'],
  },
  {
    slug: 'imac',
    category: 'mac',
    name: 'iMac with M6',
    film: 'imac-m6',
    filmLabel: 'iMac with M6 · product film',
    label: 'A brilliant new iMac',
    description: 'A colourful all-in-one, now with M6 performance and powerful AI capabilities.',
    details: ['M6 · up to 12-core CPU and GPU', '24-inch 4.5K Retina display', 'Seven colours · Wi-Fi 7'],
  },
  {
    slug: 'iphone-18-pro',
    category: 'iphone',
    name: 'iPhone 18 Pro',
    preorderName: 'iPhone 18 Pro',
    label: 'iPhone 18 Pro',
    film: 'iphone-18-pro',
    filmLabel: 'iPhone 18 Pro · hero film',
    description: 'A20 Pro power meets a new level of camera control and all-day confidence.',
    details: ['A20 Pro chip', '48MP Main camera with variable aperture', 'Next-generation vapor chamber'],
  },
  {
    slug: 'iphone-duo',
    category: 'iphone',
    name: 'iPhone Duo',
    preorderName: 'iPhone Duo',
    label: 'Meet iPhone Duo',
    film: 'duo',
    filmLabel: 'iPhone Duo · fold and unfold',
    description: 'A thin, foldable design that opens into the largest display ever on iPhone.',
    details: ['Foldable, expansive display', '48MP Dual Fusion camera system', 'A20 Pro · all-day battery life'],
  },
  {
    slug: 'ipad-mini',
    category: 'ipad',
    name: 'All-new iPad mini',
    preorderName: 'all-new iPad mini',
    label: 'Small in size. Big on change.',
    film: 'ipad-mini-2026',
    filmLabel: 'iPad mini · OLED display',
    description: 'The biggest update yet: an even thinner design with a stunning OLED display.',
    details: ['8.5-inch OLED display', 'A20 Pro performance', 'IP67 water- and dust-resistance'],
  },
  {
    slug: 'apple-watch-ultra-4',
    category: 'watch',
    name: 'Apple Watch Ultra 4',
    preorderName: 'Apple Watch Ultra 4',
    film: 'watch-ultra-4',
    filmLabel: 'Apple Watch Ultra 4 · adventure film',
    label: 'Made for the long way.',
    description: 'More capable tracking and endurance for training, exploring, and everything after.',
    details: ['Up to 45 hours of outdoor workout tracking', 'More accurate on-device GPS', 'Advanced health and fitness features'],
  },
  {
    slug: 'airpods-5',
    category: 'airpods',
    name: 'AirPods 5',
    preorderName: 'AirPods 5',
    film: 'airpods-5',
    filmLabel: 'AirPods 5 · product film',
    label: 'Hear more of your world.',
    description: 'A new acoustic architecture brings open-ear Active Noise Cancellation to AirPods.',
    details: ['Open-ear Active Noise Cancellation', 'New acoustic architecture', 'Live Translation and Siri AI'],
  },
  {
    slug: 'homeview',
    category: 'tv-home',
    name: 'Apple HomeView',
    preorderName: 'Apple HomeView',
    film: 'homeview-2026',
    filmLabel: 'Apple HomeView · connected living',
    image: '/assets/accessories/homepod.png',
    imageAlt: 'Apple HomeView smart-home display.',
    label: 'Home, in view.',
    description: 'A new place for entertainment, connection, and smart-home control, powered by Siri AI.',
    details: ['7-inch Liquid Retina display', 'Beautiful aluminum design with an adjustable hinge', 'Works with Apple Home accessories'],
  },
  {
    slug: 'homepod-mini-2',
    category: 'tv-home',
    name: 'HomePod mini 2',
    preorderName: 'HomePod mini 2',
    film: 'homepod-mini-2',
    filmLabel: 'HomePod mini 2 · color and sound',
    image: '/assets/tv-home/homepod-mini.png',
    imageAlt: 'HomePod mini smart speaker.',
    label: 'Small speaker. Big home energy.',
    description: 'A compact smart speaker with enhanced audio, Siri AI, and five beautiful colors.',
    details: ['Enhanced audio experience', 'Siri AI', 'Available in five colors'],
  },
  {
    slug: 'apple-tv-4k',
    category: 'tv-home',
    name: 'Apple TV 4K',
    preorderName: 'Apple TV 4K',
    film: 'apple-tv-4k-2026',
    filmLabel: 'Apple TV 4K · Siri AI',
    label: 'A smarter night in.',
    description: 'A faster, more capable Apple TV experience, now supercharged by Siri AI.',
    details: ['More capable, conversational Siri', 'Faster performance', 'Up to four HomePod mini 2 speakers for surround sound'],
  },
  {
    slug: 'home-collection',
    category: 'tv-home',
    name: 'Apple Home Collection',
    preorderName: 'Apple Home Collection',
    image: '/assets/accessories/homepod.png',
    imageAlt: 'Apple Home accessories product image.',
    label: 'A more connected home.',
    description: 'A new collection of smart-home products designed to work together through Apple Home.',
    details: ['Smart cameras', 'Thermostats and a door lock', 'Built in collaboration with LG and Schneider Electric'],
  },
];

function productFor(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

const latestIphone = launches.find((launch) => launch.slug === 'iphone-18-pro');
const duo = launches.find((launch) => launch.slug === 'iphone-duo');

function preorderUrl(name: string): string {
  const message = `Hi REDAPPLEKE, I'm interested in the ${name}. Please share pre-order details, availability and pricing in Kenya.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function PreorderLink({ name, className = '' }: { name: string; className?: string }) {
  return (
    <a
      className={className}
      href={preorderUrl(name)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Ask REDAPPLEKE about pre-ordering ${name} on WhatsApp`}
    >
      Pre-order on WhatsApp <span aria-hidden>↗</span>
    </a>
  );
}

function LaunchCard({ launch, index }: { launch: Launch; index: number }) {
  const reduceMotion = useReducedMotion();
  const product = productFor(launch.slug);
  const category = categories.find((item) => item.id === launch.category);
  const displayProduct = product;
  const preorderName = launch.preorderName ?? launch.name;
  const detailsPath = product ? `/c/${launch.category}/p/${product.slug}` : `/c/${launch.category}`;
  const image = launch.image ?? product?.image;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.45, delay: (index % 2) * 0.07, ease: 'easeOut' }}
      className="launch-card flex min-h-full flex-col overflow-hidden rounded-[1.75rem] bg-white"
    >
      <div className="launch-card-media relative overflow-hidden">
        {launch.film && clip(launch.film) ? (
          <div className="launch-card-film-stage">
            <LaunchFilm clipKey={launch.film} label={launch.filmLabel ?? launch.name} className="w-full" fit="contain" />
          </div>
        ) : image ? (
          <div className="launch-still relative flex min-h-64 items-center justify-center overflow-hidden px-6 py-8 sm:min-h-72">
            <img src={image} alt={launch.imageAlt ?? launch.name} loading="lazy" className="relative z-10 max-h-60 w-full object-contain sm:max-h-72" />
          </div>
        ) : (
          <div className="launch-still launch-still-wordmark relative flex min-h-64 items-center justify-center overflow-hidden px-6 py-8 sm:min-h-72" aria-label={`${launch.name} product artwork`}>
            <span aria-hidden className="launch-still-orb absolute h-40 w-40 rounded-full" />
            <span className="relative z-10 max-w-[80%] text-center text-3xl font-semibold tracking-tight text-white/90">{launch.name}</span>
          </div>
        )}
        <span className="absolute left-5 top-5 z-30 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
          Just announced
        </span>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">{category?.label}</p>
        <p className="mt-2 text-sm font-medium text-ink-soft">{launch.label}</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight">{launch.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-relaxed text-ink-soft">{launch.description}</p>
        <ul className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm text-ink-soft">
          {launch.details.map((detail) => (
            <li key={detail} className="flex gap-2">
              <span className="text-brand" aria-hidden>•</span>{detail}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6 text-sm">
          <PreorderLink name={preorderName} className="font-semibold text-brand hover:underline" />
          {displayProduct && (
            <a className="font-medium text-ink-soft hover:text-ink" href={displayProduct.appleUrl} target="_blank" rel="noreferrer">
              Apple product page <span aria-hidden>↗</span>
            </a>
          )}
          {category && (
            <Link className="font-medium text-ink-soft hover:text-ink" to={detailsPath}>
              {displayProduct ? 'Product details' : `Explore ${category.label}`} <span aria-hidden>›</span>
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function LaunchHome() {
  const reduceMotion = useReducedMotion();
  const macbook = launches[0];

  return (
    <main>
      <section className="launch-hero relative isolate overflow-hidden bg-[#08090c] text-white">
        <div aria-hidden className="launch-hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid min-h-[min(780px,calc(100svh-2.75rem))] max-w-[1200px] items-center gap-4 px-6 pb-14 pt-12 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative z-10 order-2 mx-auto max-w-xl text-center md:order-1 md:mx-0 md:text-left"
          >
            <p className="text-sm font-semibold tracking-wide text-[#ff756d]">New · Apple M6</p>
            <h1 className="mt-4 text-[clamp(2.8rem,7vw,5.7rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              Pro moves.<br />M6 power.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/65 md:max-w-md">
              Meet the 14-inch MacBook Pro with M6. Built for demanding work, next-level AI, and up to 24 hours on a charge.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <PreorderLink
                name={macbook.preorderName ?? macbook.name}
                className="btn-pill bg-brand text-white hover:bg-brand-dark"
              />
              <a className="btn-pill border border-white/25 text-white hover:bg-white/10" href="#new-releases">
                Explore new releases <span aria-hidden>↓</span>
              </a>
            </div>
            <p className="mt-4 text-xs text-white/40">Pre-order enquiries · We’ll confirm availability and pricing with you.</p>
          </motion.div>

          <div className="relative order-1 md:order-2">
            <LaunchFilm clipKey="macbook-m6-hero" label="14-inch MacBook Pro with M6" className="mx-auto w-full max-w-[720px]" fit="contain" />
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-white/[0.035]">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-white/10 px-6 py-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-10">
            {macbook.details.map((detail) => (
              <p key={detail} className="px-3 py-2 text-sm text-white/65">{detail}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="launch-focus launch-focus-iphone relative overflow-hidden bg-[#08090c] px-6 py-16 text-white sm:py-24" id="iphone-focus">
        <div className="launch-section-wash" aria-hidden />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative z-10 max-w-xl">
            <p className="eyebrow text-[#ff756d]">The latest iPhone</p>
            <h2 className="mt-3 text-[clamp(2.7rem,6vw,5.3rem)] font-semibold leading-[0.98] tracking-[-0.055em]">{latestIphone?.name}<br />Pro, in every way.</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">A20 Pro. A 48MP Fusion Main camera with variable aperture. And a big leap in battery life — all in the new iPhone 18 Pro.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PreorderLink name={latestIphone?.preorderName ?? 'iPhone 18 Pro'} className="btn-pill bg-brand text-white hover:bg-brand-dark" />
              <PreorderLink name={duo?.preorderName ?? 'iPhone Duo'} className="btn-pill border border-white/25 text-white hover:bg-white/10" />
            </div>
            <p className="mt-4 text-xs text-white/45">Message REDAPPLEKE to ask about Kenya availability and pricing.</p>
          </div>
          <div className="relative -mx-6 lg:mx-0">
            <LaunchFilm clipKey="iphone-18-pro" label="iPhone 18 Pro · the new camera system" className="mx-auto w-full max-w-[800px]" fit="contain" />
          </div>
        </div>
        <div className="relative mx-auto mt-10 max-w-[1200px]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-2xl font-semibold tracking-tight">Made to capture more.</h3>
            <p className="text-sm text-white/55">Explore the camera, color, and performance.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="launch-feature-tile launch-feature-tile-iphone group relative flex min-h-[390px] items-end overflow-hidden rounded-[2rem] bg-[#1d2027] p-7 text-white sm:p-9 lg:row-span-2 lg:min-h-[660px]">
              <LaunchFilm clipKey="iphone-18-pro-camera" label="Camera · optical zoom" className="absolute inset-0 h-full w-full" fit="cover" />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="relative z-30 max-w-md">
                <p className="text-sm font-semibold text-white/70">48MP Fusion camera</p>
                <h4 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Every detail, closer.</h4>
              </div>
            </article>
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="launch-feature-tile launch-feature-tile-iphone group relative flex min-h-[300px] items-end overflow-hidden rounded-[2rem] bg-[#e9e4e7] p-6 sm:p-7">
                <LaunchFilm clipKey="iphone-18-pro-battery" label="Battery that lasts" className="absolute inset-0 h-full w-full" fit="cover" />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/65 to-transparent" />
                <h4 className="relative z-30 text-2xl font-semibold tracking-tight text-white">More time. More life.</h4>
              </article>
              <article className="launch-feature-tile launch-feature-tile-iphone group relative flex min-h-[300px] items-end overflow-hidden rounded-[2rem] bg-[#e9e4e7] p-6 sm:p-7">
                <LaunchFilm clipKey="iphone-18-pro-colors" label="iPhone 18 Pro finishes" className="absolute inset-0 h-full w-full" fit="cover" />
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/65 to-transparent" />
                <h4 className="relative z-30 text-2xl font-semibold tracking-tight text-white">Pro in every shade.</h4>
              </article>
            </div>
            <article className="launch-feature-tile launch-feature-tile-iphone group relative flex min-h-[300px] items-end overflow-hidden rounded-[2rem] bg-[#e9e4e7] p-6 sm:p-8">
              <LaunchFilm clipKey="iphone-18-pro-chip" label="A20 Pro · built for AI" className="absolute inset-0 h-full w-full" fit="cover" />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="relative z-30">
                <p className="text-sm font-semibold text-white/70">A20 Pro</p>
                <h4 className="mt-2 text-3xl font-semibold tracking-tight text-white">Power, at its core.</h4>
              </div>
            </article>
          </div>
        </div>
        {duo && <p className="relative mx-auto mt-6 max-w-[1200px] text-sm text-white/55">Want the larger foldable experience? <a href={preorderUrl('iPhone Duo')} className="font-semibold text-white hover:underline">Ask us about iPhone Duo ↗</a></p>}
      </section>

      <section className="launch-focus launch-focus-mac relative overflow-hidden bg-[#08090c] px-6 py-16 text-white sm:py-24" id="mac-focus">
        <div className="launch-section-wash" aria-hidden />
        <div className="relative mx-auto max-w-[1200px]">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-wide text-[#ff756d]">MacBook Pro · M6</p>
            <h2 className="mt-3 text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Power through<br className="sm:hidden" /> what’s next.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65">A 12-core CPU. A 12-core GPU. Up to 24 hours of battery life. The 14-inch MacBook Pro with M6 is built for ambitious work and on-device AI.</p>
            <div className="mt-7 flex justify-center">
              <PreorderLink name={macbook.preorderName ?? macbook.name} className="btn-pill bg-brand text-white hover:bg-brand-dark" />
            </div>
          </div>
          <LaunchFilm clipKey="macbook-m6-hero" label="14-inch MacBook Pro with M6 · PROLED XDR" className="mx-auto w-full max-w-[1100px]" fit="cover" />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="launch-feature-tile launch-feature-tile-mac group relative flex min-h-[430px] items-end overflow-hidden rounded-[2rem] bg-[#17191e] p-7 sm:p-9">
              <LaunchFilm clipKey="macbook-m6-touch-display" label="PROLED XDR · touch display" className="absolute inset-0 h-full w-full" fit="cover" />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="relative z-30 max-w-md">
                <p className="text-sm font-semibold text-white/65">PROLED XDR</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">Brilliantly immersive. Naturally responsive.</h3>
              </div>
            </article>
            <article className="launch-feature-tile launch-feature-tile-mac group relative flex min-h-[430px] items-end overflow-hidden rounded-[2rem] bg-[#17191e] p-7 sm:p-9">
              <LaunchFilm clipKey="macbook-m6-chip" label="M6 · on-device AI performance" className="absolute inset-0 h-full w-full" fit="cover" />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="relative z-30 max-w-md">
                <p className="text-sm font-semibold text-white/65">M6 · 12-core CPU and GPU</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">A faster way to make your mark.</h3>
              </div>
            </article>
            <LaunchFilm clipKey="macbook-m6-ai" label="On-device AI · MacBook Pro with M6" className="w-full lg:col-span-2" fit="contain" />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row">
            <p>Configurations, availability, and pricing confirmed with our team.</p>
            <a href={preorderUrl('MacBook Pro with PROLED XDR display')} className="font-semibold text-white hover:text-[#ff756d]">Ask about MacBook Pro PROLED XDR ↗</a>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] px-6 py-16 sm:py-20" id="new-releases">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
            <div>
              <p className="eyebrow">More new releases</p>
              <h2 className="display-lg mt-2">Made for what’s next.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">Explore the latest Apple lineup. Every pre-order link opens a product-specific WhatsApp enquiry with our team.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {launches.filter((launch) => !['iphone-18-pro', 'iphone-duo', 'macbook-pro'].includes(launch.slug)).map((launch, index) => (
              <LaunchCard key={`${launch.slug}-${launch.name}`} launch={launch} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[2rem] bg-[#111216] text-white md:grid-cols-[1fr_auto]">
          <div className="p-8 sm:p-12">
            <p className="text-sm font-semibold tracking-wide text-[#ff756d]">REDAPPLEKE · Kenya</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Let’s find your next Apple.</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-white/60">
              Browse the full Apple catalogue or message our team for product availability and pre-order details.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 border-t border-white/10 p-8 md:border-l md:border-t-0 sm:p-10">
            <a className="btn-pill bg-brand text-white hover:bg-brand-dark" href={STORE_HOME} target="_blank" rel="noreferrer">
              Visit the REDAPPLEKE store <span aria-hidden>↗</span>
            </a>
            <a className="text-center text-sm font-medium text-white/65 hover:text-white" href={SHOP_ALL} target="_blank" rel="noreferrer">
              Browse current products
            </a>
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-[1200px] text-xs leading-relaxed text-ink-faint">
          Product details reflect Apple announcements. WhatsApp pre-order links are enquiries only and do not confirm stock, pricing, or an order. Product images are illustrative and may show a previous generation; contact us for current product imagery and exact configurations. Apple Home Collection includes upcoming smart-home cameras, thermostats, and a door lock; availability varies by product.
        </p>
      </section>

      <section className="border-t border-black/5 bg-[#f5f5f7] px-6 py-12">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3 text-sm">
          <span className="mr-1 text-ink-soft">Explore the full lineup</span>
          {categories.map((category) => (
            <Link key={category.id} to={`/c/${category.id}`} className="rounded-full border border-black/10 bg-white px-4 py-2 font-medium transition-colors hover:border-brand hover:text-brand">
              {category.label} <span aria-hidden>›</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
