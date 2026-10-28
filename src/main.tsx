import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import GlobalNav from './components/GlobalNav';
import Footer from './components/Footer';
import LaunchHome from './pages/LaunchHome';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import NotFound from './pages/NotFound';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <>
      <ScrollToTop />
      <GlobalNav />
      <Routes>
        <Route path="/" element={<LaunchHome />} />
        <Route path="/c/:catId/p/:slug" element={<ProductPage />} />
        <Route path="/c/:catId" element={<CategoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </StrictMode>,
);
