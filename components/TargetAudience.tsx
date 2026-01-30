import React from 'react';
import { Briefcase, Palette, Camera, Megaphone } from 'lucide-react';

export const TargetAudience: React.FC = () => {
  const audiences = [
    {
      icon: Briefcase,
      title: "Consultores",
      description: "Estrategia & Negocios",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Palette,
      title: "Diseñadores",
      description: "UX/UI, Gráfico & Web",
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      icon: Camera,
      title: "Fotógrafos",
      description: "Editorial & Comercial",
      color: "text-rose-500",
      bg: "bg-rose-50"
    },
    {
      icon: Megaphone,
      title: "Líderes de Marketing",
      description: "Growth & Contenido",
      color: "text-orange-500",
      bg: "bg-orange-50"
    }
  ];

  return (
    <section className="bg-white border-b border-slate-100 relative z-20 py-10 lg:py-0 lg:-mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Standard Grid. Desktop: Uplifted Grid to overlap Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 lg:transform lg:-translate-y-1/2">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 lg:p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full ${item.bg} flex items-center justify-center mb-3 lg:mb-4`}>
                  <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-base lg:text-lg mb-1 leading-tight">{item.title}</h3>
                <p className="text-slate-500 text-xs lg:text-sm font-medium leading-tight">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};