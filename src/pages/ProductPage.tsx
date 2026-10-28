import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import SubNav from '../components/SubNav';
import { category, shopLinkFor, shortName, SHOP_ALL } from '../data/catalog';

const WHATSAPP_NUMBER = '254718398081';

export default function ProductPage() {
  const { catId = '', slug = '' } = useParams<{ catId: string; slug: string }>();
  const reduceMotion = useReducedMotion();
  const cat = category(catId);
  const product = cat?.products.find((item) => item.slug === slug);

  if (!cat || !product) return <Navigate to="/" replace />;

  const name = shortName(product.name);
  const shopUrl = shopLinkFor(cat.id, product);
  const message = encodeURIComponent(`Hi REDAPPLEKE, I'm interested in ${name}. Please share availability and pricing in Kenya.`);
  const related = cat.products.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <>
      <SubNav catId={cat.id} />
      <main>
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1200px] items-center gap-2 px-6 pt-7 text-sm text-ink-soft">
          <Link to="/" className="hover:text-ink">Home</Link><span aria-hidden>/</span>
          <Link to={`/c/${cat.id}`} className="hover:text-ink">{cat.label}</Link><span aria-hidden>/</span>
          <span aria-current="page" className="truncate text-ink">{name}</span>
        </nav>

        <section className="product-detail-stage relative isolate overflow-hidden px-6 pb-16 pt-6 sm:pb-24 sm:pt-10">
          <div aria-hidden className="product-detail-glow pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="product-detail-art relative grid min-h-[280px] place-items-center sm:min-h-[440px]"
            >
              <img src={product.image} alt={name} fetchPriority="high" className="relative z-10 block h-auto max-h-[520px] w-full object-contain" />
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
              className="relative z-10 mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
            >
              <p className="eyebrow">{cat.label}</p>
              <h1 className="display-xl mt-3">{name}</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">{product.tagline}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <a className="btn-pill btn-primary" href={shopUrl} target="_blank" rel="noreferrer">Shop at REDAPPLEKE <span aria-hidden>↗</span></a>
                <a className="btn-pill btn-ghost" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`} target="_blank" rel="noreferrer">Ask about availability</a>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">Availability and pricing are confirmed by REDAPPLEKE. Product information and imagery are illustrative.</p>
            </motion.div>
          </div>
        </section>

        <section className="product-detail-copy border-y border-black/5 bg-surface-alt px-6 py-14 sm:py-20">
          <div className="mx-auto grid max-w-[1000px] gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <div>
              <p className="eyebrow">Get to know {name}</p>
              <h2 className="display-md mt-3">Made for more.</h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-ink-soft">
              <p>{product.description || product.tagline}</p>
              <p>See the full technical details from Apple, or ask our team about current availability, configurations, and pricing in Kenya.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm font-medium">
                <a className="link-chevron" href={product.appleUrl} target="_blank" rel="noreferrer">View Apple product information ↗</a>
                <a className="link-chevron" href={shopUrl || SHOP_ALL} target="_blank" rel="noreferrer">View REDAPPLEKE listing ↗</a>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-6 py-14 sm:py-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div><p className="eyebrow">Keep exploring</p><h2 className="display-md mt-2">More from {cat.label}.</h2></div>
              <Link to={`/c/${cat.id}`} className="link-chevron text-sm">See all {cat.label} ›</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} to={`/c/${cat.id}/p/${item.slug}`} className="product-related group">
                  <span className="product-related-art"><img src={item.image} alt="" loading="lazy" /></span>
                  <span className="mt-4 block text-lg font-semibold tracking-tight">{shortName(item.name)}</span>
                  <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.tagline}</span>
                  <span className="mt-3 inline-block text-sm font-medium text-brand">Explore {shortName(item.name)} <span aria-hidden>›</span></span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
