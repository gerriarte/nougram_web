import React, { useEffect, useRef, useState } from 'react';
import {
    Users,
    Clock,
    Target,
    CreditCard,
    BarChart3,
    Zap
} from 'lucide-react';

interface IntegrationCategory {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    platforms: string[];
}

const INTEGRATIONS: IntegrationCategory[] = [
    {
        title: "Gestión de Talento y Nómina",
        subtitle: "Donde vive el costo real",
        description: "El 80% del costo de una agencia es su gente. Nougram absorbe automáticamente salarios, bonos y comisiones para calcular tu costo real sin digitación manual.",
        icon: Users,
        platforms: ["Deel", "Remote", "Factorial", "Personio", "Siigo", "Alegra"]
    },
    {
        title: "Time-Tracking y Operaciones",
        subtitle: "Donde muere la utilidad",
        description: "Detecta el Scope Creep al instante. Compara horas reales vs. presupuestadas para saber si un proyecto sigue siendo rentable antes de que sea tarde.",
        icon: Clock,
        platforms: ["Harvest", "Toggl", "ClickUp", "Monday", "Asana"]
    },
    {
        title: "CRM y Ventas",
        subtitle: "Donde nace la propuesta",
        description: "Elimina el 'ojímetro' desde la negociación. Nougram actúa como validador de rentabilidad antes de cerrar tratos que no tienen sentido financiero.",
        icon: Target,
        platforms: ["HubSpot", "Salesforce", "Pipedrive"]
    },
    {
        title: "Pagos y Finanzas",
        subtitle: "Donde se ve la ceguera fiscal",
        description: "Concilia facturación con recaudo real. Considera comisiones de pasarelas y tasas de cambio (FX) para blindar tu margen neto final.",
        icon: CreditCard,
        platforms: ["Stripe", "Payoneer", "Wise", "Wompi", "Kushki"]
    },
    {
        title: "Almacenamiento y Reporting",
        subtitle: "Para el CFO",
        description: "Dashboards de rentabilidad neta por cliente. Integración bidireccional para reportar resultados estratégicos a la medida de tu agencia.",
        icon: BarChart3,
        platforms: ["Google Sheets", "Looker Studio", "Power BI"]
    }
];

export const Integrations: React.FC = () => {
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

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} id="integrations" className="py-24 lg:py-40 bg-slate-900 overflow-hidden relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-brand-500 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-secondary-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div
                    className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                        }`}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-xs lg:text-sm rounded-full mb-6 uppercase tracking-[0.2em]">
                        <Zap className="w-4 h-4 fill-current" />
                        Ecosistema Nougram
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                        Conecta con tu flujo actual y <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">elimina la ceguera financiera</span>
                    </h2>
                    <p className="text-xl lg:text-2xl text-slate-400 leading-relaxed font-light">
                        Nougram no es una isla. Es el cerebro que centraliza la rentabilidad de las herramientas que ya dominas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8">
                    {INTEGRATIONS.map((cat, index) => {
                        const Icon = cat.icon;
                        // First 2 items take 3 columns each (half width)
                        // Next 3 items take 2 columns each (one third width)
                        const isTopRow = index < 2;
                        const colSpan = isTopRow ? 'md:col-span-3' : 'md:col-span-2';

                        return (
                            <div
                                key={index}
                                className={`group relative p-8 lg:p-10 rounded-[2.5rem] bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/60 hover:border-brand-500/50 transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    } ${colSpan}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="h-16 w-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <span className="text-[10px] font-black text-brand-500/80 uppercase tracking-[0.25em] bg-brand-500/5 px-3 py-1 rounded-full border border-brand-500/10">
                                            Sync v1.0
                                        </span>
                                    </div>

                                    <div className="flex-grow">
                                        <div className="mb-4">
                                            <span className="text-sm font-bold text-secondary-400 uppercase tracking-widest">{cat.subtitle}</span>
                                            <h3 className={`text-xl font-extrabold text-white mt-2 group-hover:text-brand-400 transition-colors duration-300 ${isTopRow ? 'lg:text-3xl' : 'lg:text-2xl'}`}>
                                                {cat.title}
                                            </h3>
                                        </div>
                                        <p className="text-slate-400 text-base lg:text-lg mb-8 leading-relaxed font-light">
                                            {cat.description}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {cat.platforms.map((platform, pIdx) => (
                                                <span
                                                    key={pIdx}
                                                    className="px-4 py-2 bg-slate-900/50 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 group-hover:border-brand-500/30 group-hover:text-white transition-all duration-300"
                                                >
                                                    {platform}
                                                </span>
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
                            <p className="text-white text-lg font-medium">
                                ¿Usas herramientas custom? <span className="text-slate-400">Nuestra API estará abierta para la Beta.</span>
                            </p>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25"
                            >
                                Sumarme a la Beta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
