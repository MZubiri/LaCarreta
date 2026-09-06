import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';

import './i18n';
import './index.css';

// Scroll to top component on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export function AppContent() {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <div className="app-layout">
        <Header onOpenCart={() => setIsCartDrawerOpen(true)} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home onOpenCart={() => setIsCartDrawerOpen(true)} />} />
            <Route path="/catalogo" element={<Catalog onOpenCart={() => setIsCartDrawerOpen(true)} />} />
            <Route path="/catalogo/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />

        {/* Slide-out Cart Drawer */}
        <CartDrawer 
          isOpen={isCartDrawerOpen} 
          onClose={() => setIsCartDrawerOpen(false)} 
        />
      </div>
    </Router>
  );
}

export function App() {
  return (
    <SiteSettingsProvider>
      <LanguageProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </LanguageProvider>
    </SiteSettingsProvider>
  );
}

export default App;
