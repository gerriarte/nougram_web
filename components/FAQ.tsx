import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const { t: COPY } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 lg:py-24 bg-dark-900 border-t border-white/10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-white uppercase mb-3 lg:mb-4">
            {COPY.faq.title}
          </h2>
          <p className="text-base lg:text-lg text-slate-400 font-mono">
            {COPY.faqExtra.disclaimer}
          </p>
        </div>

        <div className="space-y-3 lg:space-y-4">
          {COPY.faq.questions.map((item, index) => (
            <div 
              key={index} 
              className="bg-nougram-background/50 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden hover:border-brand-500/50 transition-colors"
            >
              <button
                className="w-full flex items-center justify-between p-4 lg:p-6 text-left focus:outline-none group"
                onClick={() => toggle(index)}
              >
                <span className="text-base lg:text-lg font-semibold text-white pr-4 group-hover:text-brand-400 transition-colors">
                  {item.question}
                </span>
                <ChevronDown 
                  className={`h-5 w-5 flex-shrink-0 text-brand-500 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden border-t border-white/5 mx-4 lg:mx-6">
                  <div 
                    className="py-4 lg:py-6 text-sm lg:text-base text-slate-300 leading-relaxed font-mono prose prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-0 max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};