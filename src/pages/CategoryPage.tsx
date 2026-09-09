import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import SubNav from '../components/SubNav';
import ProductCard from '../components/ProductCard';
import SpotlightHero from '../components/SpotlightHero';
import ClipSection from '../components/ClipSection';
import {
  categories,
  category,
  shopLinkFor,
  shortName,
  SPOTLIGHTS,
  CLIP_SECTIONS,
  SHOP_ALL,
  type Product,
} from '../data/catalog';

/** Category page — mirrors apple.com's "family page" layout per top category. */
export default function CategoryPage() {
  const { catId } = useParams<{ catId: string }>();
  const reduceMotion = useReducedMotion();
  const cat = category(catId ?? '');

  if (!cat) return <Navigate to="/" replace />;

  // Resolve this category's curated spotlights against its actual products,
  // keeping the configured order. Slugs that didn't survive a catalogue
  // refresh are silently skipped.
  const byslug = new Map(cat.products.map((p) => [p.slug, p]));
  const spotlighted: Array<{ product: Product; spotlight: (typeof SPOTLIGHTS)[string][number] }> =
    (SPOTLIGHTS[cat.id] ?? [])
      .map((s) => {
        const product = byslug.get(s.slug);
        return product ? { product, spotlight: s } : null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
  const spotlightSlugs = new Set(spotlighted.map((s) => s.product.slug));

  // Generic featured hero = first product, unless it's already spotlighted.
  const [first] = cat.products;
  const showFeatured = first !== undefined && !spotlightSlugs.has(first.slug);
  const buyFirst = first && showFeatured ? shopLinkFor(cat.id, first) : SHOP_ALL;

  // Optional Apple-style product film for this category.
  const clipConfig = CLIP_SECTIONS[cat.id];

  // Grid shows everything not already surfaced above (spotlights + featured).
  const grid = cat.products.filter(
    (p) => !spotlightSlugs.has(p.slug) && !(showFeatured && first && p.slug === first.slug),
  );

  return (
    <>
      <SubNav catId={cat.id} />

      <main>
        {/* ------------------------------------------------------ */}
        {/* SPOTLIGHT HEROES — curated flagships (e.g. iPhone 18 Pro */}
        {/* and iPhone Duo), full-bleed Apple-style stages           */}
        {/* ------------------------------------------------------ */}
        {spotlighted.map(({ product, spotlight }) => (
          <SpotlightHero
            key={product.slug}
            product={product}
            catId={cat.id}
            eyebrow={spotlight.eyebrow}
            line={spotlight.line}
            copy={spotlight.copy}
            theme={spotlight.theme}
          />
        ))}

        {/* ------------------------------------------------------ */}
        {/* FEATURED PRODUCT — only when not already spotlighted     */}
        {/* ------------------------------------------------------ */}
        {first && showFeatured && (
          <section className="bg-surface-alt">
            <div className="mx-auto grid max-w-[1024px] items-center gap-8 px-6 py-16 lg:grid-cols-2">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="order-2 text-center lg:order-1 lg:text-left"
              >
                <p className="eyebrow">{cat.label}</p>
                <h1 className="display-lg mt-2">{shortName(first.name)}</h1>
                <p className="body-copy mx-auto mt-4 max-w-md lg:mx-0">{first.tagline}</p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <a className="btn-pill btn-primary" href={buyFirst} target="_blank" rel="noreferrer">
                    Buy at REDAPPLEKE
                  </a>
                  <a className="btn-pill btn-ghost" href={first.appleUrl} target="_blank" rel="noreferrer">
                    Full specs
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="order-1 lg:order-2"
              >
                <img
                  src={first.image}
                  alt={shortName(first.name)}
                  className="mx-auto max-h-[440px] w-full object-contain drop-shadow-2xl"
                />
              </motion.div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ */}
        {/* PRODUCT GRID                                            */}
        {/* ------------------------------------------------------ */}
        {grid.length > 0 && (
          <section className="mx-auto max-w-[1024px] px-6 py-16">
            <h2 className="display-md text-center">All {cat.label}</h2>
            <p className="body-copy mt-3 text-center">
              {grid.length} products. Tap “Buy” to jump to the shop.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: 'easeOut' }}
                  className="h-full rounded-2xl bg-surface-alt"
                >
                  <ProductCard product={{ ...p, catId: cat.id }} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ */}
        {/* PRODUCT FILM — Apple-style autoplaying clip              */}
        {/* ------------------------------------------------------ */}
        {clipConfig && <ClipSection config={clipConfig} />}

        {/* ------------------------------------------------------ */}
        {/* CATEGORY CROSS-LINKS                                    */}
        {/* ------------------------------------------------------ */}
        <section className="border-t border-black/5 bg-surface-alt py-12">
          <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-center gap-3 px-6">
            <span className="text-sm text-ink-soft">Keep exploring:</span>
            {categories
              .filter((c) => c.id !== cat.id)
              .map((c) => (
                <Link
                  key={c.id}
                  to={`/c/${c.id}`}
                  className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
                >
                  {c.label}
                </Link>
              ))}
          </div>
        </section>
      </main>
    </>
  );
}
