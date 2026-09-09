import { Link } from 'react-router-dom';
import { categories, SHOP_ALL, CATEGORY_LINKS } from '../data/catalog';

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-surface-alt text-xs text-ink-soft">
      <div className="mx-auto max-w-[1024px] px-6 py-8">
        {/* fine print */}
        <p className="border-b border-black/10 pb-5 leading-relaxed">
          REDAPPLEKE is an independent reseller of Apple products in Kenya. Apple, iPhone, iPad, Mac,
          Apple Watch, AirPods, HomePod, Apple TV and Apple Pencil are trademarks of Apple Inc.,
          registered in the U.S. and other countries. Product imagery and descriptions are provided
          for illustrative purposes; availability and prices are listed in the{' '}
          <a className="link-chevron" href={SHOP_ALL} target="_blank" rel="noreferrer">
            REDAPPLEKE shop
          </a>
          .
        </p>

        {/* directory */}
        <div className="grid grid-cols-2 gap-8 py-6 sm:grid-cols-3 md:grid-cols-5">
          <div>
            <h3 className="mb-2.5 font-semibold text-ink">Shop</h3>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-ink hover:underline" href={SHOP_ALL} target="_blank" rel="noreferrer">
                  Shop All
                </a>
              </li>
              {categories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <a className="hover:text-ink hover:underline" href={CATEGORY_LINKS[c.id] ?? SHOP_ALL} target="_blank" rel="noreferrer">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2.5 font-semibold text-ink">Explore</h3>
            <ul className="space-y-2">
              {categories.slice(4).map((c) => (
                <li key={c.id}>
                  <Link className="hover:text-ink hover:underline" to={`/c/${c.id}`}>
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="hover:text-ink hover:underline" to="/">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2.5 font-semibold text-ink">Categories</h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link className="hover:text-ink hover:underline" to={`/c/${c.id}`}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2.5 font-semibold text-ink">About REDAPPLEKE</h3>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-ink hover:underline" href={SHOP_ALL} target="_blank" rel="noreferrer">
                  Our Store
                </a>
              </li>
              <li>
                <a className="hover:text-ink hover:underline" href="https://wa.me/" target="_blank" rel="noreferrer">
                  Contact Sales
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2.5 font-semibold text-ink">Apple.com</h3>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-ink hover:underline" href="https://www.apple.com" target="_blank" rel="noreferrer">
                  apple.com
                </a>
              </li>
              <li>
                <a className="hover:text-ink hover:underline" href="https://support.apple.com" target="_blank" rel="noreferrer">
                  Apple Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} REDAPPLEKE. All rights reserved.</p>
          <p className="flex gap-4">
            <span>Kenya</span>
            <a className="hover:text-ink hover:underline" href={SHOP_ALL} target="_blank" rel="noreferrer">
              shop.redappleke.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
