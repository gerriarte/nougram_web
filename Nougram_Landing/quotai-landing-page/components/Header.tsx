import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" onClick={scrollToTop} className="flex items-center">
          <img src="/logo-nougram.webp" alt="Nougram" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            to="/blog"
            className={`text-sm font-semibold transition-colors ${scrolled || !isHome ? 'text-slate-600 hover:text-brand-600' : 'text-slate-300 hover:text-white'
              }`}
          >
            Blog
          </Link>
          {isHome ? (
            <button
              onClick={() => document.getElementById('join-beta')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${scrolled ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-white/10 text-white backdrop-blur-md border border-white/20'
                }`}
            >
              Acceso Beta
            </button>
          ) : (
            <Link
              to="/"
              className="px-5 py-2 bg-brand-600 text-white rounded-full text-sm font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all"
            >
              Probar Gratis
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};