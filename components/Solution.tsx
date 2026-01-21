import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BrainCircuit, Target, Users } from 'lucide-react';

export const Solution: React.FC = () => {
  const { t } = useLanguage();
  const icons = [Target, BrainCircuit, Users];
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 } // Increased slightly so it triggers when more of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center max-w-4xl mx-auto mb-10 lg:mb-20 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
        >
          <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 font-semibold text-xs lg:text-sm rounded-full mb-4">
            {t.solution.tag}
          </span>
          <h2 className="text-2xl md:text-5xl font-bold text-slate-900 mb-4 lg:mb-6">
            {t.solution.headline}
          </h2>
          <p className="text-base lg:text-xl text-slate-600 leading-relaxed">
            {t.solution.subheadline}{' '}
            <span className="block mt-4 lg:mt-6 md:inline md:mt-0">
              {t.solution.targetText}{' '}
              <span className="relative inline-block px-2 py-1 mx-1 whitespace-normal md:whitespace-nowrap">
                <span className="absolute inset-0 bg-brand-100/60 -skew-y-1 rounded-lg border border-brand-200/50 shadow-sm" aria-hidden="true"></span>
                <span className="relative font-bold text-brand-700">
                  {t.solution.targetRoles}
                </span>
              </span>.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {t.solution.benefits.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <div
                key={index}
                className={`group p-6 lg:p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-700 ease-out transform
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                <div className="h-12 w-12 lg:h-14 lg:w-14 bg-brand-50 rounded-xl flex items-center justify-center mb-4 lg:mb-6 group-hover:bg-brand-500 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-brand-500/25">
                  <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-brand-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-3 lg:mb-4">
                  {benefit.title}
                </h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};