#!/usr/bin/env node
/**
 * REDAPPLEKE asset fetcher
 * ------------------------
 * Downloads product metadata + hero images for the REDAPPLEKE Apple-clone site.
 *
 * Sources:
 *  1. apple.com category pages  -> discover product sub-page slugs (/iphone-18-pro/ etc.)
 *  2. each product sub-page     -> og:title / og:description / og:image (hero image)
 *  3. apple.com shop page       -> SKU-based images from the Apple store CDN (accessories)
 *  4. chapternav icons          -> small product "gallery" thumbnails per category
 *
 * Output:
 *   public/assets/products.json   <- product data consumed by the site
 *   public/assets/<category>/<slug>.(jpg|png|webp)  <- downloaded images
 *
 * Usage:  node scripts/fetch-assets.mjs
 */

import { mkdir, writeFile, readFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';

const execFileP = promisify(execFile);
import path from 'node:path';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ROOT = path.resolve(process.cwd(), 'public/assets');
const SHOP_URL = 'https://www.apple.com/shop/accessories/all';
const CONCURRENCY = 6;

/* ------------------------------------------------------------------ */
/* Category map — mirrors apple.com top navigation                     */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  {
    id: 'iphone',
    label: 'iPhone',
    url: 'https://www.apple.com/iphone/',
    products: ['iphone-18-pro', 'iphone-duo', 'iphone-air', 'iphone-17', 'iphone-17e'],
    slugFilter: /^iphone-/,
  },
  {
    id: 'mac',
    label: 'Mac',
    url: 'https://www.apple.com/mac/',
    products: ['macbook-pro', 'macbook-air', 'macbook-neo', 'imac', 'mac-mini', 'mac-studio'],
    slugFilter: /^(macbook|imac|mac-|studio-display)/,
  },
  {
    id: 'ipad',
    label: 'iPad',
    url: 'https://www.apple.com/ipad/',
    products: ['ipad-pro', 'ipad-air', 'ipad-11', 'ipad-mini'],
    slugFilter: /^(ipad|apple-pencil)/,
  },
  {
    id: 'watch',
    label: 'Watch',
    url: 'https://www.apple.com/watch/',
    products: ['apple-watch-series-12', 'apple-watch-ultra-4', 'apple-watch-se-3', 'apple-watch-nike'],
    slugFilter: /^apple-watch-(series|ultra|se|nike)/,
  },
  {
    id: 'airpods',
    label: 'AirPods',
    url: 'https://www.apple.com/airpods/',
    products: ['airpods-pro', 'airpods-4', 'airpods-max'],
    slugFilter: /^airpods/,
  },
  {
    id: 'tv-home',
    label: 'TV & Home',
    url: 'https://www.apple.com/tv-home/',
    products: ['apple-tv-4k', 'homepod', 'homepod-mini'],
    slugFilter: /^(apple-tv|homepod)/,
  },
  {
    id: 'accessories',
    label: 'Accessories',
    url: 'https://www.apple.com/us/shop/goto/buy_accessories',
    products: [], // filled from the shop page SKUs below
    slugFilter: /$a^/,
  },
  // accessories live on their own marketing pages too — grab these alongside
];

const EXTRA_ACCESSORY_PAGES = ['airtag', 'apple-pencil', 'studio-display', 'studio-display-xdr', 'homepod', 'apple-tv-4k'];

/* ------------------------------------------------------------------ */
/* Small fetch helpers                                                 */
/* ------------------------------------------------------------------ */
async function fetchText(url, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchBuffer(url, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

/** Run async tasks with limited concurrency. */
async function pool(items, worker, concurrency = CONCURRENCY) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        await worker(item);
      } catch (err) {
        console.warn(`  ! skipped: ${err.message}`);
      }
    }
  });
  await Promise.all(runners);
}

/* ------------------------------------------------------------------ */
/* Extraction helpers                                                  */
/* ------------------------------------------------------------------ */
function meta(html, prop) {
  const m =
    html.match(new RegExp(`<meta property="og:${prop}" content="([^"]+)"`)) ||
    html.match(new RegExp(`<meta name="og:${prop}" content="([^"]+)"`));
  return m ? decodeEntities(m[1]) : '';
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'");
}

const extOf = (url) => {
  const m = url.split('?')[0].match(/\.(png|jpe?g|webp|gif)$/i);
  return m ? (m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase()) : 'jpg';
};

/** Download an image URL into the category folder, return local /assets path. */
async function saveImage(url, relDir, baseName) {
  const ext = extOf(url);
  const file = `${baseName}.${ext}`;
  const abs = path.join(ROOT, relDir, file);
  if (existsSync(abs)) return `/assets/${relDir}/${file}`.replace(/\/+/g, '/');
  const buf = await fetchBuffer(url);
  if (buf.length < 1024) throw new Error(`suspiciously small image (${buf.length}B) ${url}`);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buf);
  console.log(`  ✓ ${relDir}/${file}  (${Math.round(buf.length / 1024)} KB)`);
  return `/assets/${relDir}/${file}`;
}

/* ------------------------------------------------------------------ */
/* 1. Category pages: discover product slugs + chapternav icons        */
/* ------------------------------------------------------------------ */
async function discoverCategories() {
  const out = [];
  await pool(
    CATEGORIES.filter((c) => c.id !== 'accessories'),
    async (cat) => {
      const html = await fetchText(cat.url);
      // chapternav product icons (e.g. /v/iphone/home/cj/images/overview/chapternav/nav_iphone_17pro__hash_large.png)
      const navIcons = [...html.matchAll(/\/v\/[a-z-]+\/[a-z0-9]+\/[a-z0-9/-]*chapternav\/nav_([a-z0-9_]+)__[a-z0-9]+_large\.png/g)]
        .map((m) => m[0])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);

      // product sub-page links found on the page, merged with the curated list
      const found = [...html.matchAll(/href="\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
      const slugWhitelist = /^(iphone|macbook|imac|mac-|ipad|apple-watch|airpods|apple-tv|homepod|airtag|apple-pencil|studio-display|vision)/;
      const linked = [...new Set(found.filter((s) => slugWhitelist.test(s) && (cat.slugFilter ? cat.slugFilter.test(s) : true)))];

      out.push({ ...cat, linkedSlugs: linked, navIcons, html });
    },
  );
  return out;
}

/* ------------------------------------------------------------------ */
/* 2. Product pages: og data                                           */
/* ------------------------------------------------------------------ */
async function harvestProduct(slug, catId) {
  const url = `https://www.apple.com/${slug}/`;
  const html = await fetchText(url);
  const title = meta(html, 'title');
  const description = meta(html, 'description');
  const image = meta(html, 'image');
  if (!title || !image) throw new Error(`no og data for ${slug}`);
  const localImg = await saveImage(image, catId, slug);
  const name = title.replace(/\s*[|·]\s*Apple.*$/i, '').trim();
  // Apple's og:description often opens with a sentence that just repeats the
  // product name ("iPhone 18 Pro. Total AI powerhouse. …") — skip it so the
  // tagline is the actual marketing line.
  const sentences = description.split(/(?<=\.)\s/);
  const first = (sentences[0] ?? '').replace(/\.$/, '').trim().toLowerCase();
  const nameEcho =
    sentences.length > 1 &&
    (first === name.toLowerCase() || name.toLowerCase().startsWith(first));
  const tagline = nameEcho ? sentences.slice(1).join(' ') : description;
  return {
    slug,
    name,
    tagline,
    description,
    image: localImg,
    source: url,
    appleUrl: url,
  };
}

/* ------------------------------------------------------------------ */
/* 3. Video clips — Apple's inline "anim" mp4s (h264, small)           */
/*    Apple's player builds src as: <basepath><breakpoint>[_2x].mp4    */
/* ------------------------------------------------------------------ */
const CLIPS = [
  {
    key: 'duo',
    page: 'https://www.apple.com/iphone-duo/',
    videoId: 'media-hero-video',
    posterUrl:
      'https://www.apple.com/v/iphone-duo/a/images/overview/media-hero/hero_startframe__fcol1x2us8i2_large.jpg',
    alt: 'Held in hands, iPhone Duo in Star White rotates from the closed folded position to an open landscape position.',
  },
  {
    key: 'macbook-pro',
    page: 'https://www.apple.com/macbook-pro/',
    videoId: 'welcome-hero',
    poster: 'first-frame', // Apple ships no startframe image — extract via ffmpeg
    alt: 'Animation of a MacBook Pro positioning into the shape of a V, referencing the M5 chip family.',
  },
  {
    key: 'watch-ultra-4',
    page: 'https://www.apple.com/apple-watch-ultra-4/',
    videoId: 'media-hero-video',
    posterUrl:
      'https://www.apple.com/v/apple-watch-ultra-4/a/images/overview/media-hero/hero_startframe__byn66fgbfjea_large.jpg',
    alt: 'Apple Watch Ultra 4 hero animation.',
  },
  {
    key: 'ipad-pro',
    page: 'https://www.apple.com/ipad-pro/',
    videoId: 'welcome-video',
    poster: 'first-frame',
    alt: 'iPad Pro welcome hero animation.',
  },
  {
    key: 'airpods-pro',
    page: 'https://www.apple.com/airpods-pro/',
    videoId: 'welcome-hero-airpods',
    poster: 'first-frame',
    alt: 'AirPods Pro 3 welcome hero animation.',
  },
  {
    key: 'apple-tv-4k',
    page: 'https://www.apple.com/apple-tv-4k/',
    videoId: 'hero-video',
    poster: 'first-frame',
    alt: 'Apple TV 4K hero animation.',
  },
];

/** Extract the first frame of an mp4 buffer to a jpg via ffmpeg. */
async function firstFrameJpeg(mp4Buf, outPath) {
  const tmpIn = path.join(os.tmpdir(), `rake-clip-${Date.now()}.mp4`);
  const tmpOut = `${tmpIn}.jpg`;
  await writeFile(tmpIn, mp4Buf);
  try {
    await execFileP('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmpIn, '-frames:v', '1', '-q:v', '2', tmpOut]);
    const jpg = await readFile(tmpOut);
    if (jpg.length < 5_000) throw new Error('ffmpeg produced a suspiciously small frame');
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, jpg);
    return Math.round(jpg.length / 1024);
  } finally {
    await Promise.allSettled([unlink(tmpIn), unlink(tmpOut)]);
  }
}

/** Read the display track dimensions out of an mp4 buffer (tkhd box). */
function mp4Dims(buf) {
  let w = 0;
  let h = 0;
  const walk = (start, end) => {
    let off = start;
    while (off < end - 8 && (!w || !h)) {
      const size = buf.readUInt32BE(off);
      const type = buf.toString('latin1', off + 4, off + 8);
      if (size < 8) break;
      if (type === 'moov' || type === 'trak') walk(off + 8, off + size);
      else if (type === 'tkhd') {
        w = buf.readUInt32BE(off + size - 8) / 65536;
        h = buf.readUInt32BE(off + size - 4) / 65536;
      }
      off += size;
    }
  };
  walk(0, buf.length);
  return { w: Math.round(w), h: Math.round(h) };
}

async function fetchClips() {
  const clips = {};
  for (const spec of CLIPS) {
    try {
      const html = await fetchText(spec.page);
      const vidIdx = html.indexOf(`id="${spec.videoId}"`);
      if (vidIdx === -1) throw new Error('video tag not found');
      const base = (html.slice(vidIdx, vidIdx + 800).match(/data-inline-media-basepath="([^"]+)"/) ?? [])[1];
      if (!base) throw new Error('basepath not found');

      const dir = path.join(ROOT, 'clips', spec.key);
      const MAX_CLIP_BYTES = 4_000_000; // re-encode anything heavier than ~4 MB
      const grab = async (file, outName) => {
        let buf = await fetchBuffer(`https://www.apple.com${base}${file}`);
        if (buf.length < 10_000) throw new Error(`clip too small: ${file}`);
        await mkdir(dir, { recursive: true });
        const outAbs = path.join(dir, outName);
        await writeFile(outAbs, buf);
        if (buf.length > MAX_CLIP_BYTES) {
          // Apple TV 4K-class films ship huge — shrink to 1280-wide h264.
          const tmpOut = path.join(os.tmpdir(), `rake-tc-${Date.now()}.mp4`);
          try {
            await execFileP('ffmpeg', [
              '-y', '-loglevel', 'error', '-i', outAbs,
              '-vf', "scale='min(1280,iw)':-2",
              '-c:v', 'libx264', '-crf', '27', '-preset', 'medium',
              '-movflags', '+faststart', '-an', tmpOut,
            ]);
            const small = await readFile(tmpOut);
            if (small.length > 100_000 && small.length < buf.length) {
              await writeFile(outAbs, small);
              buf = small;
              console.log(
                `  ↳ re-encoded ${outName} to 1280w (${Math.round(buf.length / 1024)} KB)`,
              );
            }
          } catch (e) {
            console.warn(`  ! re-encode failed for ${outName}: ${e.message.split('\n')[0]}`);
          } finally {
            await unlink(tmpOut).catch(() => {});
          }
        }
        console.log(`  ✓ clips/${spec.key}/${outName}  (${Math.round(buf.length / 1024)} KB)`);
        return buf;
      };
      await grab('medium.mp4', 'hero-medium.mp4'); // small screens
      const large = await grab('large.mp4', 'hero-large.mp4');

      // poster: Apple's startframe image when shipped, else ffmpeg frame 1
      let poster;
      if (spec.posterUrl) {
        poster = await saveImage(spec.posterUrl, `clips/${spec.key}`, 'hero-poster');
      } else {
        const kb = await firstFrameJpeg(large, path.join(ROOT, 'clips', spec.key, 'hero-poster.jpg'));
        console.log(`  ✓ clips/${spec.key}/hero-poster.jpg  (${kb} KB, ffmpeg)`);
        poster = `/assets/clips/${spec.key}/hero-poster.jpg`;
      }

      const { w, h } = mp4Dims(large);
      if (!w || !h) throw new Error('could not read video dimensions');
      clips[spec.key] = {
        alt: spec.alt,
        poster,
        width: w,
        height: h,
        sources: [
          { media: '(max-width: 734px)', file: `/assets/clips/${spec.key}/hero-medium.mp4` },
          { media: '', file: `/assets/clips/${spec.key}/hero-large.mp4` },
        ],
      };
    } catch (e) {
      console.warn(`  ! clip ${spec.key}: ${e.message}`);
    }
  }
  return clips;
}

/* ------------------------------------------------------------------ */
/* 5. Accessories from the shop page (SKU images)                      */
/* ------------------------------------------------------------------ */
async function harvestShopAccessories() {
  const html = await fetchText(SHOP_URL, 40000);
  // tiles look like:
  //   <img src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MGD74?wid=1200&...&.v=<signed>&traceId=1"
  //        class="ir rf-producttile-image" alt="MagSafe Charger, interior charging surface, ..." />
  // the .v token is a signed cache-buster — required, so capture the full URL
  const seen = new Map();
  for (const m of html.matchAll(/<img[^>]*rf-producttile-image[^>]*>/g)) {
    const tag = m[0];
    const src = (tag.match(/src="([^"]+)"/) || [])[1];
    const alt = (tag.match(/alt="([^"]*)"/) || [])[1] || '';
    const sku = (src.match(/\/is\/([A-Z0-9]{5})\?/) || [])[1];
    if (!src || !sku || seen.has(sku)) continue;
    const name = alt.split(',')[0].replace(/\s+/g, ' ').trim();
    if (name.length < 3) continue; // skip weird/empty tiles
    seen.set(sku, { sku, alt: alt.replace(/\s+/g, ' ').trim(), name, url: src.replace(/&amp;/g, '&') });
  }
  return [...seen.values()].slice(0, 36);
}

async function buildAccessories(shopHtmlExists = true) {
  const out = [];
  // 3a. curated accessory marketing pages
  await pool(EXTRA_ACCESSORY_PAGES, async (slug) => {
    try {
      const p = await harvestProduct(slug, 'accessories');
      out.push(p);
    } catch (e) {
      console.warn(`  ! accessory page ${slug}: ${e.message}`);
    }
  });

  // 3b. shop-page SKU tiles
  if (shopHtmlExists) {
    const skus = await harvestShopAccessories();
    console.log(`  ${skus.length} accessory SKUs found on shop page`);
    await pool(skus, async ({ sku, alt, name, url }) => {
      try {
        const local = await saveImage(url, 'accessories', `sku-${sku.toLowerCase()}`);
        out.push({
          slug: `sku-${sku.toLowerCase()}`,
          name,
          tagline: name,
          description: alt,
          image: local,
          source: SHOP_URL,
          appleUrl: 'https://www.apple.com/shop/accessories/all',
        });
      } catch (e) {
        console.warn(`  ! sku ${sku}: ${e.message}`);
      }
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */
async function main() {
  const accessoriesOnly = process.argv.includes('--accessories-only');

  const data = accessoriesOnly
    ? JSON.parse(await readFile(path.join(ROOT, 'products.json'), 'utf8'))
    : { fetchedAt: new Date().toISOString(), source: 'https://www.apple.com', categories: [] };

  if (!accessoriesOnly) {
    console.log('→ discovering apple.com categories…');
    const cats = await discoverCategories();

    for (const cat of cats) {
      console.log(`\n■ ${cat.label} (${cat.id})`);
      // merge curated + discovered slugs, dedupe, cap
      const slugs = [...new Set([...cat.products, ...cat.linkedSlugs])].slice(0, 10);
      const products = [];
      await pool(slugs, async (slug) => {
        try {
          products.push(await harvestProduct(slug, cat.id));
        } catch (e) {
          console.warn(`  ! ${slug}: ${e.message}`);
        }
      });
      // sort back to curated order
      products.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));

      // chapternav icons as small gallery images
      const gallery = [];
      await pool(cat.navIcons.slice(0, 10), async (iconUrl) => {
        try {
          const base = iconUrl.split('/').pop().replace(/_large\.png$/, '').replace(/^nav_/, '');
          gallery.push({ name: base.replace(/_/g, ' '), image: await saveImage(`https://www.apple.com${iconUrl}`, `${cat.id}/nav`, base) });
        } catch (e) {
          console.warn(`  ! icon: ${e.message}`);
        }
      });

      data.categories.push({ id: cat.id, label: cat.label, appleUrl: cat.url, products, gallery });
    }
  }

  console.log('\n■ Accessories');
  const accProducts = await buildAccessories(true);
  const accCat = data.categories.find((c) => c.id === 'accessories');
  if (accCat) accCat.products = accProducts;
  else data.categories.push({
    id: 'accessories',
    label: 'Accessories',
    appleUrl: 'https://www.apple.com/shop/accessories/all',
    products: accProducts,
    gallery: [],
  });

  if (!accessoriesOnly) {
    console.log('\n■ Video clips');
    data.clips = await fetchClips();
  }

  // prune images that belong to products no longer in the catalogue
  const keep = new Set(data.categories.flatMap((c) => c.products.map((p) => p.image)).filter(Boolean));
  let pruned = 0;
  for (const catId of CATEGORIES.map((c) => c.id)) {
    const dir = path.join(ROOT, catId);
    let entries;
    try {
      // only prune files directly in the category dir (product images);
      // subdirectories like <cat>/nav/ hold gallery icons and are kept
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (!ent.isFile() || ent.name === 'products.json') continue;
      const rel = `/assets/${catId}/${ent.name}`;
      if (!keep.has(rel)) {
        await unlink(path.join(dir, ent.name));
        pruned += 1;
      }
    }
  }
  if (pruned) console.log(`\n✓ pruned ${pruned} orphaned image(s)`);

  await mkdir(ROOT, { recursive: true });
  const json = JSON.stringify(data, null, 2);
  // write to public/assets (served copy) AND src/data (imported by the site)
  await writeFile(path.join(ROOT, 'products.json'), json);
  await writeFile(path.resolve(process.cwd(), 'src/data/products.json'), json);
  const total = data.categories.reduce((n, c) => n + c.products.length, 0);
  console.log(`\n✓ wrote products.json — ${data.categories.length} categories, ${total} products`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
