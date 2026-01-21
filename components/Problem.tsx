import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, Clock, Calculator } from 'lucide-react';

export const Problem: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 lg:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                  <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-slate-900">{t.problem.card.tag}</h3>
                  <p className="text-sm lg:text-base text-slate-600 mt-1">{t.problem.card.text}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 opacity-50">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
                  <div className="h-2 bg-slate-200 rounded w-24"></div>
                  <div className="h-2 bg-slate-200 rounded w-full ml-auto"></div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <Calculator className="h-4 w-4 lg:h-5 lg:w-5 text-slate-600" />
                  <span className="text-sm lg:text-base text-slate-700 font-medium">{t.problem.card.calculating}</span>
                </div>
                <div className="h-px bg-slate-100 w-full my-4"></div>
                <p className="text-xs lg:text-sm text-slate-500 italic">
                  {t.problem.card.quote}
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-sm lg:text-base font-semibold text-brand-600 uppercase tracking-wide mb-2 lg:mb-3">
              {t.problem.tag}
            </h2>
            <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 lg:mb-6 leading-tight">
              {t.problem.title}
            </h3>
            <p className="text-base lg:text-lg text-slate-600 mb-6 leading-relaxed">
              {t.problem.description}
            </p>
            <div className="pl-4 lg:pl-6 border-l-4 border-brand-500">
              <p className="text-base lg:text-lg text-slate-800 font-medium italic leading-relaxed">
                {t.problem.implication}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};