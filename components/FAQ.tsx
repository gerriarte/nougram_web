import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 lg:py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 lg:mb-4">
            {t.faq.title}
          </h2>
          <p className="text-base lg:text-lg text-slate-600">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3 lg:space-y-4">
          {t.faq.questions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 lg:p-6 text-left focus:outline-none"
                onClick={() => toggle(index)}
              >
                <span className="text-base lg:text-lg font-semibold text-slate-900 pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-brand-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                    }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 lg:px-6 lg:pb-6 text-sm lg:text-base text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 lg:mt-12 text-center bg-brand-50 rounded-2xl p-4 lg:p-6 border border-brand-100">
          <p className="font-semibold text-brand-800 text-sm lg:text-base">
            {t.faq.guaranteeTitle}
          </p>
          <p className="text-brand-600 mt-2 text-sm lg:text-base">
            {t.faq.guaranteeText}
          </p>
        </div>
      </div>
    </section>
  );
};