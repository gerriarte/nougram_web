import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Button } from './Button';
import { Check, Star } from 'lucide-react';
import { Reveal } from './Reveal';

export const Pricing = () => {
  const { t: COPY } = useTranslation();
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section className="py-24 bg-dark-900 relative overflow-hidden border-t border-white/5">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Reveal width="100%">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            {COPY.pricing.title}
                        </h2>
                    </Reveal>
                    <Reveal width="100%" delay={0.1}>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-mono">
                            {COPY.pricing.subtitle}
                        </p>
                    </Reveal>
                </div>

                <div className="flex justify-center mb-16">
                    <Reveal delay={0.2}>
                        <div className="inline-flex items-center gap-4">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-300 border ${!isAnnual
                                    ? 'bg-white text-nougram-background border-white shadow-lg'
                                    : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                {COPY.pricingExtra.monthly}
                            </button>

                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-300 border flex items-center gap-3 ${isAnnual
                                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/30'
                                    : 'bg-transparent text-slate-400 border-white/10 hover:border-brand-500/50 hover:text-white'
                                    }`}
                            >
                                {COPY.pricingExtra.yearly}
                                <span className="text-[10px] px-2 py-0.5 bg-white/20 text-white rounded-md uppercase tracking-widest font-black">
                                    -16%
                                </span>
                            </button>
                        </div>
                    </Reveal>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {COPY.pricing.plans.map((plan, index) => {
                        const displayPrice = isAnnual && plan.annualPrice ? plan.annualPrice.split(" ")[0] : plan.price;
                        const displayPeriod = isAnnual && plan.annualPrice ? COPY.pricingExtra.periodAnnual : plan.period;

                        return (
                            <Reveal key={index} delay={index * 0.1}>
                                <div
                                    className={`flex flex-col p-6 rounded-lg border ${plan.popular
                                        ? 'bg-nougram-background border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10'
                                        : 'bg-nougram-background/50 border-white/10 hover:border-brand-500/30'
                                        } backdrop-blur-md transition-all duration-300 hover:-translate-y-2 group`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 inset-x-0 flex justify-center">
                                            <span className="bg-brand-500 text-nougram-background text-[10px] font-bold px-4 py-1.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                {COPY.pricingExtra.popular}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">{plan.name}</h3>
                                        <p className="text-xs text-slate-400 min-h-[40px] font-mono leading-relaxed">{plan.description}</p>
                                    </div>

                                <div className="mb-6 border-b border-white/5 pb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-black text-white tracking-tight ${plan.popular ? 'group-hover:text-brand-400 transition-colors' : ''}`}>{displayPrice}</span>
                                        <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-widest">{displayPeriod}</span>
                                    </div>
                                    {isAnnual && plan.annualPrice && (
                                        <p className="text-xs mt-3 flex items-center gap-2 font-mono font-bold text-brand-400">
                                            <span className="line-through text-slate-500 font-normal opacity-60">
                                                ${(parseFloat(plan.price.replace('$', '')) * 12).toFixed(2)}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-brand-500 text-nougram-background text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                {COPY.pricing.annualSavings}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex-1 space-y-6 mb-8">
                                    {/* Limits */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{COPY.pricingExtra.limits}</p>
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
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-brand-500/80 uppercase tracking-widest bg-brand-500/5 px-2 py-1 rounded-md inline-block border border-brand-500/10">Scope</p>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="text-sm text-white flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    className={`w-full py-3 px-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 border ${plan.popular
                                        ? 'bg-brand-500 hover:bg-brand-400 text-nougram-background border-brand-500 shadow-[0_0_20px_rgba(243,93,10,0.3)]'
                                        : 'bg-transparent hover:bg-white/5 text-white border-white/20 hover:border-white/50'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        </Reveal>
                    );
                })}
                </div>
            </div>
        </section>
    );
};
