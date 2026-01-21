import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './Button';
import { Check, Star } from 'lucide-react';
import { Reveal } from './Reveal';

export const Pricing = () => {
    const { t } = useLanguage();

    return (
        <section className="py-24 bg-dark-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Reveal width="100%">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            {t.pricing.title}
                        </h2>
                    </Reveal>
                    <Reveal width="100%" delay={0.1}>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            {t.pricing.subtitle}
                        </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {t.pricing.plans.map((plan, index) => (
                        <Reveal key={index} delay={index * 0.1}>
                            <div
                                className={`flex flex-col p-6 rounded-3xl border ${plan.popular
                                    ? 'bg-brand-900/10 border-brand-500/50 shadow-2xl shadow-brand-500/10 scale-105 z-10'
                                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                    } backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                                        <span className="bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-brand-500/40 animate-pulse">
                                            <Star className="w-3 h-3 fill-current" />
                                            {t.pricing.labels.popular}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-xs text-slate-400 min-h-[40px]">{plan.description}</p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white tracking-tight">{plan.price}</span>
                                        <span className="text-sm text-slate-500 font-medium">{plan.period}</span>
                                    </div>
                                    {plan.annualPrice && (
                                        <p className="text-[10px] text-green-400 mt-1 font-medium">
                                            {plan.annualPrice}
                                        </p>
                                    )}
                                </div>

                                <div className="flex-1 space-y-6 mb-8">
                                    {/* Limits */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.pricing.labels.limits}</p>
                                        <ul className="space-y-2">
                                            {plan.limits.map((limit, i) => (
                                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></span>
                                                    {limit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.pricing.labels.includes}</p>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  fullWidth
                  className={!plan.popular ? 'border-white/10 text-white hover:bg-white/5' : ''}
                >
                  {plan.cta}
                </Button> */}
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
