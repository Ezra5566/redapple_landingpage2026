import { Link, NavLink, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { allProducts, shortName } from '../data/catalog';

const STORE_HOME = 'https://shop.redappleke.com/ke/en';
import { useScrolled } from '../lib/useScrolled';

const NAV_LINKS = [
  { label: 'iPhone', to: '/c/iphone' },
  { label: 'Mac', to: '/c/mac' },
  { label: 'iPad', to: '/c/ipad' },
  { label: 'Watch', to: '/c/watch' },
  { label: 'AirPods', to: '/c/airpods' },
  { label: 'TV & Home', to: '/c/tv-home' },
  { label: 'Accessories', to: '/c/accessories' },
];

const SEARCH_ICON = (
  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const BAG_ICON = (
  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);

const MENU_ICON = (
  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 8h16M4 16h16" strokeLinecap="round" />
  </svg>
);

const CLOSE_ICON = (
  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

export default function GlobalNav() {
  const scrolled = useScrolled();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? allProducts.filter((product) => `${product.name} ${product.tagline}`.toLowerCase().includes(term)).slice(0, 6) : [];
  }, [query]);

  const onNavigate = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery('');
      else setMenuOpen(false);
      return !open;
    });
  };

  const toggleMenu = () => {
    setMenuOpen((open) => {
      if (!open) setSearchOpen(false);
      return !open;
    });
  };

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`site-nav text-[0.78rem] text-white/85 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 ${
          scrolled ? 'site-nav-scrolled bg-black/75' : 'bg-black/35'
        }`}
        aria-label="Global"
        data-current-path={location.pathname}
      >
        <div className="mx-auto flex h-12 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Link to="/" onClick={onNavigate} className="flex shrink-0 items-center gap-2 py-1.5" aria-label="REDAPPLEKE home">
            <img src="/brand/redapplekenobg.png" alt="" className="h-4.5 w-auto" />
          </Link>
          <ul className="hidden items-center gap-5 xl:flex">
            {NAV_LINKS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `nav-category-link transition-colors duration-200 hover:text-white ${isActive ? 'text-white' : 'text-white/65'}`}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li><a href={STORE_HOME} target="_blank" rel="noreferrer" className="rounded-full bg-brand px-3 py-1 text-white transition-colors hover:bg-brand-dark">Shop</a></li>
          </ul>
          <div className="flex shrink-0 items-center gap-4">
            <button type="button" aria-label={searchOpen ? 'Close product search' : 'Search products'} aria-expanded={searchOpen} onClick={toggleSearch} className="hover:text-white">{SEARCH_ICON}</button>
            <a href={STORE_HOME} target="_blank" rel="noreferrer" aria-label="Shop bag" className="hover:text-white">{BAG_ICON}</a>
            <button type="button" className="xl:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={toggleMenu}>
              {menuOpen ? CLOSE_ICON : MENU_ICON}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="nav-search-panel border-t border-white/10 px-6 py-5">
            <div className="mx-auto max-w-[760px]">
              <label htmlFor="site-product-search" className="sr-only">Search Apple products</label>
              <input id="site-product-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search iPhone, Mac, AirPods…" className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-base text-white outline-none placeholder:text-white/45 focus:border-white/45" />
              {query.trim() && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#151518]">
                  {results.length ? results.map((product) => (
                    <Link key={`${product.catId}-${product.slug}`} to={`/c/${product.catId}/p/${product.slug}`} onClick={onNavigate} className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-3 text-sm last:border-0 hover:bg-white/[0.07]">
                      <span><span className="block font-medium text-white">{shortName(product.name)}</span><span className="mt-0.5 block text-xs text-white/50">{product.catId}</span></span><span aria-hidden className="text-white/50">↗</span>
                    </Link>
                  )) : <p className="px-5 py-4 text-sm text-white/60">No products found. Try a different search.</p>}
                </div>
              )}
              {!query.trim() && <p className="mt-3 text-xs text-white/50">Search {allProducts.length} products in the catalogue.</p>}
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="mobile-nav-panel border-t border-white/10 px-6 py-4 xl:hidden">
            <ul className="flex flex-col gap-3 text-sm">
              {NAV_LINKS.map((item) => (
                <li key={item.to}><Link to={item.to} onClick={onNavigate} className="mobile-nav-link block py-2 text-white/90">{item.label}<span aria-hidden>↗</span></Link></li>
              ))}
              <li><a href={STORE_HOME} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-brand px-4 py-1.5 text-white">Shop All</a></li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
