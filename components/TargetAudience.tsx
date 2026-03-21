import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Briefcase, Palette, Camera, Megaphone, Building2 } from 'lucide-react';

export const TargetAudience: React.FC = () => {
  const { t } = useTranslation();
  const audiences = t.targetAudience.map((item, i) => ({
    ...item,
    icon: [Briefcase, Palette, Camera, Megaphone, Building2][i],
    color: ["text-blue-400", "text-purple-400", "text-rose-400", "text-orange-500", "text-emerald-500"][i],
    bg: ["bg-blue-500/10", "bg-purple-500/10", "bg-rose-500/10", "bg-orange-500/10", "bg-emerald-500/10"][i]
  }));

  return (
    <section className="bg-nougram-background relative z-20 py-10 lg:py-0 lg:-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Standard Grid. Desktop: Uplifted Grid to overlap Hero */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 lg:transform lg:-translate-y-1/2">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="bg-dark-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 p-4 lg:p-6 flex flex-col items-center text-center hover:shadow-brand-500/10 hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full ${item.bg} flex items-center justify-center mb-3 lg:mb-4 outline outline-1 outline-white/5`}>
                  <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-white text-base lg:text-lg mb-1 leading-tight tracking-wide">{item.title}</h3>
                <p className="text-slate-400 text-xs lg:text-sm font-mono leading-tight">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};