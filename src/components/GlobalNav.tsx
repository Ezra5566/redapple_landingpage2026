import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { categories, SHOP_ALL } from '../data/catalog';
import { useScrolled } from '../lib/useScrolled';

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
  const [menuOpen, setMenuOpen] = useState(false);

  // close the mobile menu when the route changes
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Apple's nav is a translucent dark layer content scrolls under */}
      <nav
        className={`text-[0.78rem] text-white/80 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 ${
          scrolled ? 'bg-black/85' : 'bg-black/70'
        }`}
        aria-label="Global"
      >
        <div className="mx-auto flex h-11 max-w-[1024px] items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 py-1.5" aria-label="REDAPPLEKE home">
            <img src="/brand/redapplekenobg.png" alt="" className="h-4.5 w-auto" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-7 md:flex">
            {categories.map((c) => (
              <li key={c.id}>
                <NavLink
                  to={`/c/${c.id}`}
                  className="transition-colors duration-200 hover:text-white"
                >
                  {c.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href={SHOP_ALL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-brand px-3 py-1 text-white transition-colors hover:bg-brand-dark"
              >
                Shop
              </a>
            </li>
          </ul>

          {/* Utilities */}
          <div className="flex items-center gap-5">
            {/* the shop's search is client-side on its products page */}
            <a href={SHOP_ALL} target="_blank" rel="noreferrer" aria-label="Search the shop" className="hover:text-white">
              {SEARCH_ICON}
            </a>
            <a href={SHOP_ALL} target="_blank" rel="noreferrer" aria-label="Shop bag" className="hover:text-white">
              {BAG_ICON}
            </a>
            <button
              type="button"
              className="md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? CLOSE_ICON : MENU_ICON}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-black/95 px-6 py-4 md:hidden">
            <ul className="flex flex-col gap-3 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/c/${c.id}`} onClick={() => setMenuOpen(false)} className="block py-1 text-white/90">
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={SHOP_ALL} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-brand px-4 py-1.5 text-white">
                  Shop All
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
