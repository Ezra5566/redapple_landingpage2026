/**
 * REDAPPLEKE — site data layer
 * ----------------------------
 * Product catalogue comes from `scripts/fetch-assets.mjs`, which scrapes
 * apple.com (og: metadata + hero images) and the Apple store CDN.
 *
 * SHOP LINKS
 * ----------
 * Every "Buy" CTA routes to the REDAPPLEKE shop. Per-product links are
 * resolved in this order:
 *   1. manual overrides below (SHOP_LINKS) — you fill these in,
 *   2. otherwise the category shop collection (CATEGORY_LINKS),
 *   3. otherwise SHOP_ALL.
 */

import raw from './products.json';

/**
 * Shop-all target. The storefront is locale-prefixed; /ke/en is the shop's
 * home market (REDAPPLEKE = Kenya), and /products is the full catalogue.
 */
export const SHOP_ALL = 'https://shop.redappleke.com/ke/en/products';

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  source: string;
  appleUrl: string;
}

export interface NavIcon {
  name: string;
  image: string;
}

export interface Category {
  id: string;
  label: string;
  appleUrl: string;
  gallery: NavIcon[];
  products: Product[];
}

interface RawData {
  fetchedAt: string;
  source: string;
  categories: Category[];
  clips?: Record<string, Clip>;
}

/* ------------------------------------------------------------------ */
/* VIDEO CLIPS — downloaded by scripts/fetch-assets.mjs from Apple's  */
/* inline "anim" mp4s. Sources carry CSS media queries so the browser */
/* picks the right rendition.                                         */
/* ------------------------------------------------------------------ */
export interface ClipSource {
  /** CSS media query — empty string means "default/fallback". */
  media: string;
  /** Local file path under /assets/. */
  file: string;
}

export interface Clip {
  alt: string;
  poster: string;
  width: number;
  height: number;
  sources: ClipSource[];
}

const data = raw as RawData;

const clipMap: Record<string, Clip> = data.clips ?? {};

export function clip(key: string): Clip | undefined {
  return clipMap[key];
}

/* ------------------------------------------------------------------ */
/* MANUAL SHOP LINKS — per-product URLs on shop.redappleke.com.        */
/* Only products the shop actually lists get entries; everything else  */
/* falls through to the category collection below. Slugs verified      */
/* against the live storefront (2026-09).                              */
/* ------------------------------------------------------------------ */
export const SHOP_LINKS: Record<string, string> = {
  // iPhone — shop carries the 17 lineup
  'iphone/iphone-air': 'https://shop.redappleke.com/ke/en/products/iphone-air',
  'iphone/iphone-17': 'https://shop.redappleke.com/ke/en/products/iphone-17',
  'iphone/iphone-17e': 'https://shop.redappleke.com/ke/en/products/iphone-17e',
  // Mac — shop slugs include the chip generation
  'mac/macbook-pro': 'https://shop.redappleke.com/ke/en/products/macbook-pro-m5-max',
  'mac/macbook-neo': 'https://shop.redappleke.com/ke/en/products/macbook-neo',
  'mac/mac-mini': 'https://shop.redappleke.com/ke/en/products/mac-mini-m4',
  'mac/imac': 'https://shop.redappleke.com/ke/en/products/imac-m4',
  // Watch — shop sells the previous-gen lineup under generic slugs
  'watch/apple-watch-series-12': 'https://shop.redappleke.com/ke/en/products/apple-watch-series',
  'watch/apple-watch-ultra-4': 'https://shop.redappleke.com/ke/en/products/apple-watch-ultra-3-milanese',
};

/* ------------------------------------------------------------------ */
/* Per-category shop collections (fallback when no manual link).      */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Per-category shop collections (fallback when no manual link).      */
/* Verified against the live storefront; airpods / tv-home have no     */
/* collection yet, so they land on the full products listing.          */
/* ------------------------------------------------------------------ */
export const CATEGORY_LINKS: Record<string, string> = {
  iphone: 'https://shop.redappleke.com/ke/en/c/iphone',
  mac: 'https://shop.redappleke.com/ke/en/c/mac-slash-imac',
  ipad: 'https://shop.redappleke.com/ke/en/c/ipad',
  watch: 'https://shop.redappleke.com/ke/en/c/apple-watch',
  airpods: 'https://shop.redappleke.com/ke/en/products',
  'tv-home': 'https://shop.redappleke.com/ke/en/products',
  accessories: 'https://shop.redappleke.com/ke/en/c/accessories',
};

/* ------------------------------------------------------------------ */
/* SPOTLIGHTS — curated hero line/copy per flagship product.          */
/* Category pages render a full-bleed hero for the first product      */
/* (plus any extras listed here, in order). Copy is authored here so  */
/* re-running the fetcher never overwrites hand-tuned hero copy.      */
/* ------------------------------------------------------------------ */
export interface Spotlight {
  slug: string;
  eyebrow?: string;
  line?: string;
  copy?: string;
  theme?: 'dark' | 'light';
}

export const SPOTLIGHTS: Record<string, Spotlight[]> = {
  iphone: [
    {
      slug: 'iphone-18-pro',
      eyebrow: 'New',
      line: 'Total AI powerhouse.',
      copy: 'iPhone 18 Pro. 48MP Main camera with variable aperture, a big leap in battery life, and the A20 Pro chip.',
      theme: 'dark',
    },
    {
      slug: 'iphone-duo',
      eyebrow: 'New',
      line: 'The largest iPhone display ever.',
      copy: 'iPhone Duo. A thin, foldable design with the 48MP Dual Fusion camera system and all-day battery life.',
      theme: 'light',
    },
  ],
  watch: [
    {
      slug: 'apple-watch-ultra-4',
      eyebrow: 'New',
      line: 'The ultimate running watch.',
      theme: 'dark',
    },
  ],
  mac: [{ slug: 'macbook-pro', line: 'Mind-blowing. Head-turning.', theme: 'dark' }],
  ipad: [
    {
      slug: 'ipad-pro',
      eyebrow: 'iPad Pro',
      line: 'The ultimate iPad experience.',
      theme: 'dark',
    },
  ],
  airpods: [
    {
      slug: 'airpods-pro',
      eyebrow: 'AirPods Pro',
      line: 'The world’s best in-ear Active Noise Cancellation.',
      theme: 'dark',
    },
  ],
  'tv-home': [
    {
      slug: 'apple-tv-4k',
      eyebrow: 'Apple TV 4K',
      line: 'Cinematic in every sense.',
      theme: 'dark',
    },
  ],
  accessories: [
    {
      slug: 'airtag',
      eyebrow: 'AirTag',
      line: 'Lose your knack for losing things.',
      theme: 'dark',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* CLIP SECTIONS — Apple-style autoplaying product films on category  */
/* pages. Copy is authored here; clips come from products.json.       */
/* ------------------------------------------------------------------ */
export interface ClipSection {
  clipKey: string;
  eyebrow?: string;
  headline: string;
  copy: string;
  /** Small caption under the film (e.g. credit line). */
  footnote?: string;
}

export const CLIP_SECTIONS: Record<string, ClipSection> = {
  iphone: {
    clipKey: 'iphone-18-pro',
    eyebrow: 'iPhone 18 Pro',
    headline: 'Total AI powerhouse.',
    copy: 'A20 Pro, an advanced 48MP camera system, and the latest Pro design — made for the moments that matter.',
    footnote: 'Film shown on apple.com · iPhone 18 Pro',
  },
  mac: {
    clipKey: 'macbook-m6-hero',
    eyebrow: 'MacBook Pro with M6',
    headline: 'Pro moves. M6 power.',
    copy: 'A new generation of MacBook Pro, designed for demanding workflows, cinematic visuals, and on-device AI.',
    footnote: 'Film shown on apple.com · MacBook Pro with M6',
  },
  watch: {
    clipKey: 'watch-ultra-4',
    eyebrow: 'Apple Watch Ultra 4',
    headline: 'Next-level adventure.',
    copy: 'The ultimate running watch — longer battery life, advanced health and fitness tracking, and Siri AI.',
    footnote: 'Film shown on apple.com · Apple Watch Ultra 4',
  },
  ipad: {
    clipKey: 'ipad-pro',
    eyebrow: 'iPad Pro',
    headline: 'Thinpossible.',
    copy: 'Unbelievably thin. Incredibly powerful — the M5 chip and Apple Intelligence in the ultimate iPad.',
    footnote: 'Film shown on apple.com · iPad Pro',
  },
  airpods: {
    clipKey: 'airpods-pro',
    eyebrow: 'AirPods Pro',
    headline: 'Adaptive Audio. Now playing.',
    copy: 'The world’s best in-ear Active Noise Cancellation, with heart rate sensing during workouts.',
    footnote: 'Film shown on apple.com · AirPods Pro 3',
  },
  'tv-home': {
    clipKey: 'apple-tv-4k',
    eyebrow: 'Apple TV 4K',
    headline: 'Cinema, streaming, gaming.',
    copy: 'The Apple experience you love on the big screen — 4K Dolby Vision, Dolby Atmos and the A15 chip.',
    footnote: 'Film shown on apple.com · Apple TV 4K',
  },
};

/** Build a shop URL from a path-ish string, tolerating missing protocol. */
const shopUrl = (pathOrUrl: string): string =>
  pathOrUrl.startsWith('http') ? pathOrUrl : `${SHOP_ALL.replace(/\/$/, '')}/${pathOrUrl.replace(/^\//, '')}`;

/** Resolve the buy-link for a product within a category. */
export function shopLinkFor(catId: string, product: Product): string {
  const manual = SHOP_LINKS[`${catId}/${product.slug}`] ?? SHOP_LINKS[product.slug];
  if (manual) return shopUrl(manual);
  const cat = CATEGORY_LINKS[catId];
  if (cat) return shopUrl(cat);
  return SHOP_ALL;
}

/* ------------------------------------------------------------------ */
/* Catalogue helpers                                                  */
/* ------------------------------------------------------------------ */
export const categories: Category[] = data.categories;

export function category(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function categoryLabel(id: string): string {
  return category(id)?.label ?? id;
}

/** All products flattened, each annotated with its category id. */
export interface CatalogEntry extends Product {
  catId: string;
}

export const allProducts: CatalogEntry[] = categories.flatMap((c) =>
  c.products.map((p) => ({ ...p, catId: c.id })),
);

export function findProduct(slug: string): CatalogEntry | undefined {
  return allProducts.find((p) => p.slug === slug);
}

/** Pick a friendly image for a category tile on the home page. */
export function categoryHeroImage(catId: string): string | undefined {
  const cat = category(catId);
  return cat?.products[0]?.image;
}

/** Name tidy-up: apple.com titles can be long — trim at " and " for cards. */
export function shortName(name: string): string {
  return name.replace(/\sand\s.*$/, '').trim();
}

export { data as rawData };
