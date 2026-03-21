import React, { useEffect, useRef, useState } from 'react';
import {
    Users, Clock, Target, CreditCard, BarChart3, Zap
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const Integrations: React.FC = () => {
    const { t } = useTranslation();
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
            { threshold: 0.1 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const INTEGRATIONS = t.integrationsSection.list.map((item: any, i: number) => ({
        ...item,
        icon: [Users, Clock, Target, CreditCard, BarChart3][i]
    }));

    return (
        <section ref={sectionRef} id="integrations" className="py-24 lg:py-40 bg-slate-900 overflow-hidden relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-brand-500 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-secondary-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-xs lg:text-sm rounded-full mb-6 uppercase tracking-[0.2em]">
                        <Zap className="w-4 h-4 fill-current" />
                        {t.integrationsSection.badge}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight" dangerouslySetInnerHTML={{ __html: t.integrationsSection.headline }} />
                    <p className="text-lg lg:text-xl text-slate-400 leading-relaxed font-mono">
                        {t.integrationsSection.subheadline}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8">
                    {INTEGRATIONS.map((cat: any, index: number) => {
                        const Icon = cat.icon;
                        const isTopRow = index < 2;
                        const colSpan = isTopRow ? 'md:col-span-3' : 'md:col-span-2';

                        return (
                            <div key={index} className={`group relative p-8 lg:p-10 rounded-[2.5rem] bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/60 hover:border-brand-500/50 transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${colSpan}`} style={{ transitionDelay: `${index * 100}ms` }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="h-16 w-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <span className="text-[10px] font-black text-brand-500/80 uppercase tracking-[0.25em] bg-brand-500/5 px-3 py-1 rounded-full border border-brand-500/10">Sync v1.0</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="mb-4">
                                            <span className="text-sm font-bold text-secondary-400 uppercase tracking-widest">{cat.subtitle}</span>
                                            <h3 className={`text-xl font-extrabold text-white mt-2 group-hover:text-brand-400 transition-colors duration-300 ${isTopRow ? 'lg:text-3xl' : 'lg:text-2xl'}`}>{cat.title}</h3>
                                        </div>
                                        <p className="text-slate-400 text-sm lg:text-base mb-8 leading-relaxed font-light">{cat.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.platforms.map((platform: string, pIdx: number) => (
                                                <span key={pIdx} className="px-3 py-1 bg-slate-900/50 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 group-hover:border-brand-500/30 group-hover:text-white transition-all duration-300">{platform}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={`mt-24 text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="inline-block group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-secondary-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative px-10 py-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                            <p className="text-white text-lg font-medium" dangerouslySetInnerHTML={{ __html: t.integrationsSection.apiLabel }} />
                            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25">
                                {t.finalCta.button}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
