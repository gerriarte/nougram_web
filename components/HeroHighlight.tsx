import React from 'react';
import { Globe2 } from 'lucide-react';

export const HeroHighlight: React.FC = () => {
    return (
        <section className="bg-dark-900 border-t border-white/5 relative z-10 pb-20 lg:pb-32 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex flex-col items-center justify-center text-center pt-8">

                    <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-brand-900/30 border border-brand-500/20 backdrop-blur-sm">
                        <Globe2 className="w-4 h-4 text-brand-400" />
                        <span className="text-brand-200 text-xs font-medium tracking-wide">ALCANCE INTERNACIONAL</span>
                    </div>

                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-4xl">
                        <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Cotiza a nivel local y global
                        </span>
                        <br className="hidden md:block" />
                        <span className="inline-block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
                            con Nougram
                        </span>
                    </h2>

                    {/* Decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-brand-500/10 filter blur-[100px] rounded-full pointer-events-none"></div>
                </div>
            </div>
        </section>
    );
};
