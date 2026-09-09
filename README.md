# REDAPPLEKE — Apple Reseller Landing Site

An Apple.com-style multi-page landing site for **REDAPPLEKE**, a Kenyan Apple
reseller. It showcases the full Apple catalogue (fetched from apple.com) and
routes every purchase to the REDAPPLEKE shop: **https://shop.redappleke.com**.

## Pages

| Route             | Page                                             |
| ----------------- | ------------------------------------------------ |
| `/`               | Home — interactive **Three.js** hero + categories |
| `/c/iphone`       | iPhone                                           |
| `/c/mac`          | Mac                                              |
| `/c/ipad`         | iPad                                             |
| `/c/watch`        | Watch                                            |
| `/c/airpods`      | AirPods                                          |
| `/c/tv-home`      | TV & Home                                        |
| `/c/accessories`  | Accessories                                      |
| anything else     | 404                                              |

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **three.js + @react-three/fiber + drei** — 3D hero (lazy-loaded, chunk-split)
- **motion** — Apple-style entrance/scroll animations
- **react-router-dom** — multi-page routing

## Product data & assets

`scripts/fetch-assets.mjs` scrapes apple.com:

- product sub-pages (`/iphone-18-pro/`, `/macbook-air/`, …) → `og:title`,
  `og:description`, `og:image` (hero renders, downloaded locally)
- the Apple store page → SKU product shots for accessories (store CDN,
  signed URLs)
- category chapternav icons

Output: `public/assets/**` (images) + `public/assets/products.json`
(mirrored into `src/data/products.json`).

Re-run any time to refresh the catalogue:

```bash
pnpm fetch:assets            # everything
node scripts/fetch-assets.mjs --accessories-only   # just accessories
```

After re-fetching, sync the data into the bundle:

```bash
cp public/assets/products.json src/data/products.json
```

## Shop links (the part you fill in manually)

All “Buy at REDAPPLEKE” CTAs resolve in this order — see
`src/data/catalog.ts`:

1. **`SHOP_LINKS`** — manual per-product overrides (add entries like
   `'iphone/iphone-18-pro': 'https://shop.redappleke.com/products/…'`)
2. **`CATEGORY_LINKS`** — per-category collections
   (`/collections/iphone`, …). Point these at whatever your shop actually
   uses.
3. **`SHOP_ALL`** — `https://shop.redappleke.com` as the last resort.

## Scroll-reactive 3D hero

The home hero pins for ~1.4 screens (`h-[240vh]` + sticky viewport). While it's
pinned:

- the 3D core **recedes, rises and tips over** as scroll progress goes 0 → 1
- ring emissive glow **breathes with scroll**, and fast flicks inject a
  velocity-driven glow/spin boost that decays back to rest
- the headline **fades, lifts and shrinks** (motion `useScroll`), and its
  buttons stop catching clicks once invisible
- `prefers-reduced-motion` disables all of it (static, always-visible hero)

Verify with real headless scrolls:

```bash
(npx vite preview --port 4173 &) && node scripts/verify-scroll.mjs
```

## Brand

Logos and hero art live in `public/brand/` (copied from
`REDAPPLE_V2/apps/storefront/public/REDAPPLEKE/`). Brand accent is
`#dc2626` (see `src/index.css` design tokens).

## Develop / build

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build
pnpm preview    # serve the production build
```

## Legal note

Product imagery and copy are fetched from apple.com for illustration. The
footer states REDAPPLEKE is an independent reseller; Apple trademarks belong
to Apple Inc.
# redapple_landingpage2026
