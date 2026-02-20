import React from 'react';
import { COPY } from '../constants';
import { Button } from './Button';

export const FooterCTA: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white pt-12 lg:pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-dark-900 rounded-3xl p-6 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              {COPY.finalCta.title}
            </h2>
            <p className="text-base md:text-xl text-slate-300 mb-8 lg:mb-10 max-w-3xl mx-auto">
              {COPY.finalCta.description}
            </p>
            <Button
              variant="primary"
              className="bg-brand-500 hover:bg-brand-400 text-white border-0 text-base lg:text-lg px-8 py-4 lg:px-10 lg:py-5"
              onClick={scrollToTop}
              icon
            >
              {COPY.finalCta.button}
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 md:flex-row text-xs lg:text-sm text-slate-500">
          <div className="flex items-center">
            <img src="/logo-nougram.webp" alt="Nougram" className="h-8 w-auto object-contain" />
          </div>
          <div>
            &copy; {new Date().getFullYear()} Nougram. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};