import { Link } from 'react-router-dom';
import { shopLinkFor, shortName, type CatalogEntry } from '../data/catalog';

interface ProductCardProps {
  product: CatalogEntry;
  layout?: 'grid' | 'stacked';
}

export default function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const buy = shopLinkFor(product.catId, product);
  const detailPath = `/c/${product.catId}/p/${product.slug}`;

  return (
    <article id={`p-${product.slug}`} className="product-card flex h-full flex-col" data-layout={layout}>
      <Link to={detailPath} title={`Explore ${shortName(product.name)}`} className="product-card-visual group relative block overflow-hidden">
        <span className="product-image-wash" aria-hidden />
        <img src={product.image} alt={shortName(product.name)} loading="lazy" className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.035]" />
        <span className="product-card-open" aria-hidden>Explore <span>↗</span></span>
      </Link>
      <div className="flex flex-1 flex-col px-1 pb-2 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-brand">{product.catId}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight"><Link to={detailPath} className="hover:text-brand">{shortName(product.name)}</Link></h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{product.tagline}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-5 text-sm">
          <Link className="link-chevron" to={detailPath}>Explore product</Link>
          <a className="font-medium text-ink-soft hover:text-ink" href={buy} target="_blank" rel="noreferrer">Shop ↗</a>
        </div>
      </div>
    </article>
  );
}
