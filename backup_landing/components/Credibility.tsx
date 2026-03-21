import React from 'react';
import { COPY } from '../constants';
import { Database, BadgeCheck } from 'lucide-react';

export const Credibility: React.FC = () => {
  return (
    <section className="py-12 lg:py-24 bg-dark-900 text-white relative overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-900/20 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold mb-6 lg:mb-8">
              {COPY.credibility.title}
            </h2>
            
            <div className="space-y-6 lg:space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Database className="h-6 w-6 lg:h-8 lg:w-8 text-brand-500" />
                </div>
                <div>
                  <h4 className="text-lg lg:text-xl font-semibold mb-2 text-white">Fundamento Tecnológico</h4>
                  <p className="text-sm lg:text-base text-slate-400 leading-relaxed">
                    {COPY.credibility.tech}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <BadgeCheck className="h-6 w-6 lg:h-8 lg:w-8 text-brand-500" />
                </div>
                <div>
                  <h4 className="text-lg lg:text-xl font-semibold mb-2 text-white">Valor Mutuo</h4>
                  <p className="text-sm lg:text-base text-slate-400 leading-relaxed">
                    {COPY.credibility.value}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
             <div className="absolute -inset-4 bg-brand-500/20 rounded-xl blur-xl"></div>
             <div className="relative bg-dark-800 border border-white/10 p-6 lg:p-8 rounded-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6 lg:mb-8 border-b border-white/10 pb-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500"></div>
                   </div>
                   <span className="text-[10px] lg:text-xs text-slate-500 font-mono">model_training.py</span>
                </div>
                <div className="space-y-2 lg:space-y-3 font-mono text-xs lg:text-sm text-slate-300">
                   <div className="flex">
                      <span className="text-brand-500 mr-2">$</span>
                      <span>analyzing_market_data...</span>
                   </div>
                   <div className="flex">
                      <span className="text-brand-500 mr-2">$</span>
                      <span>loading_user_expertise... [OK]</span>
                   </div>
                   <div className="flex">
                      <span className="text-brand-500 mr-2">$</span>
                      <span>optimizing_pricing_strategy...</span>
                   </div>
                   <div className="text-green-400 mt-4">
                      {">"} Recomendación Generada: Margen +35%
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};