import { Link } from 'react-router-dom';
import { category, shopLinkFor, shortName } from '../data/catalog';

interface SubNavProps {
  catId: string;
}

/** Sticky, translucent sub-nav under the global nav on category pages. */
export default function SubNav({ catId }: SubNavProps) {
  const cat = category(catId);
  if (!cat) return null;

  return (
    <div className="category-subnav sticky top-12 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-13 max-w-[1024px] items-center justify-between px-6">
        <span className="text-xl font-semibold tracking-tight">{cat.label}</span>
        <nav aria-label={`${cat.label} products`} className="hidden items-center gap-5 text-xs text-ink-soft lg:flex">
          {cat.products.slice(0, 5).map((p) => (
            <Link key={`${p.slug}-${p.name}`} to={`/c/${catId}/p/${p.slug}`} className="max-w-32 truncate transition-colors hover:text-ink">
              {shortName(p.name)}
            </Link>
          ))}
          <a
            href={cat.products[0] ? shopLinkFor(catId, cat.products[0]) : 'https://shop.redappleke.com/ke/en/products'}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-brand px-3.5 py-1.5 font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Shop {cat.label}
          </a>
        </nav>
        {/* mobile: single shop CTA */}
        <a
          href={cat.products[0] ? shopLinkFor(catId, cat.products[0]) : 'https://shop.redappleke.com/ke/en/products'}
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
