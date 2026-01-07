import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isHome ? 'bg-dark-900/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/logo-nougram.webp" alt="Nougram" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/blog"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Blog
          </Link>
          <button
            onClick={() => {
              if (isHome) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.location.href = '/#join-beta';
              }
            }}
            className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
          >
            Acceso Beta
          </button>
        </nav>
      </div>
    </header>
  );
};