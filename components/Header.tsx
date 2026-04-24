import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Linkedin, Instagram } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

// Custom TikTok icon since Lucide doesn't have an official one yet
const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useTranslation();
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-nougram-background/80 backdrop-blur-md shadow-sm border-b border-white/5 py-2 md:py-3' : 'bg-transparent py-3 md:py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-4">
          <Link to="/" onClick={scrollToTop} className="flex items-center">
            <img src="/logo-nougram.png" alt="Nougram" className="h-5 sm:h-6 w-auto object-contain" />
          </Link>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          {/* Desktop Social Links */}
          <div className="hidden md:flex items-center gap-4 border-r border-white/10 pr-6">
            <a href="https://linkedin.com/company/nougram" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-400 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://instagram.com/nougram_" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-400 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://tiktok.com/@nougram4" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-400 transition-colors">
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Language Toggle (All screens) */}
          <button
            onClick={toggleLanguage}
            className="text-[10px] font-bold text-brand-400 bg-brand-500/5 border border-brand-500/10 px-2 py-1 rounded cursor-pointer hover:bg-brand-500/10 transition-colors tracking-widest"
          >
            {language === 'es' ? 'EN' : 'ES'}
          </button>

          <Link
            to="/blog"
            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {t.nav.blog}
          </Link>
          {isHome ? (
            <button
              onClick={() => document.getElementById('join-beta')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${scrolled ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500' : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20'
                }`}
            >
              {t.nav.demo}
            </button>
          ) : (
            <Link
              to="/"
              className="px-3 sm:px-5 py-2 bg-brand-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all"
            >
              {t.nav.demo}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};