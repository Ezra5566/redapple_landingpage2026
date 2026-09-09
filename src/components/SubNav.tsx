import { category, shopLinkFor, SHOP_ALL } from '../data/catalog';

interface SubNavProps {
  catId: string;
}

/** Sticky, translucent sub-nav under the global nav on category pages. */
export default function SubNav({ catId }: SubNavProps) {
  const cat = category(catId);
  if (!cat) return null;

  return (
    <div className="sticky top-11 z-40 border-b border-black/5 bg-white/72 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-13 max-w-[1024px] items-center justify-between px-6">
        <span className="text-xl font-semibold tracking-tight">{cat.label}</span>
        <nav aria-label={`${cat.label} sections`} className="hidden items-center gap-5 text-xs text-ink-soft lg:flex">
          {cat.products.slice(0, 6).map((p) => (
            <a key={p.slug} href={`#p-${p.slug}`} className="transition-colors hover:text-ink">
              {p.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()}
            </a>
          ))}
          <a
            href={SHOP_ALL}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-brand px-3.5 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Shop {cat.label}
          </a>
        </nav>
        {/* mobile: single shop CTA */}
        <a
          href={shopLinkFor(catId, cat.products[0])}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white lg:hidden"
        >
          Shop
        </a>
      </div>
    </div>
  );
}
