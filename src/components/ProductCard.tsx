import { shopLinkFor, shortName, type CatalogEntry } from '../data/catalog';

interface ProductCardProps {
  product: CatalogEntry;
  layout?: 'grid' | 'stacked';
}

export default function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const buy = shopLinkFor(product.catId, product);

  return (
    <article
      id={`p-${product.slug}`}
      className="product-card flex scroll-mt-32 flex-col overflow-hidden rounded-2xl bg-white"
      data-layout={layout}
    >
      <a
        href={product.appleUrl}
        target="_blank"
        rel="noreferrer"
        title={`${shortName(product.name)} — full specs on apple.com`}
        className="block overflow-hidden bg-surface-alt"
      >
        <img
          src={product.image}
          alt={shortName(product.name)}
          loading="lazy"
          className="aspect-[4/3] w-full object-contain p-6 transition-transform duration-500 hover:scale-[1.03]"
        />
      </a>

      <div className="flex flex-1 flex-col gap-2 px-6 pb-6 text-center">
        <h3 className="text-lg font-semibold tracking-tight">{shortName(product.name)}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.tagline}</p>

        <div className="mt-auto flex items-center justify-center gap-5 pt-3 text-sm">
          <a className="link-chevron" href={product.appleUrl} target="_blank" rel="noreferrer">
            Learn more
          </a>
          <a className="link-chevron" href={buy} target="_blank" rel="noreferrer">
            Buy at REDAPPLEKE <span aria-hidden>›</span>
          </a>
        </div>
      </div>
    </article>
  );
}
