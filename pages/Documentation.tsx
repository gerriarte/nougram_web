import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Settings, Hammer, Send, Eye, TrendingUp, ChevronDown, CheckCircle2 } from 'lucide-react';

const STEPS_ES = [
    {
        phase: 1,
        title: "Onboarding y ADN Financiero",
        icon: Settings,
        color: "from-sky-500 to-indigo-500",
        description: "Establecer tu Blended Cost Rate (BCR) real. Sin este dato, estás cotizando a ciegas.",
        procedures: [
            { subtitle: "1.1 Identidad Organizacional", text: "Define quién eres. Ingresa el nombre de tu organización y sector. Ideal para el portal que verá tu cliente." },
            { subtitle: "1.2 Registro de Costos Fijos", text: "Carga tus costos recurrentes (software, alquiler, servicios). Utiliza plantillas para evitar gastos invisibles." },
            { subtitle: "1.3 Equipo y Capacidad Real", text: "Agrega tu equipo con sus salarios reales. Configura las horas facturables reales, no las teóricas." },
            { subtitle: "1.4 El Momento de la Verdad: Tu BCR", text: "Revisa tu Blended Cost Rate. Este número representa cuánto cuesta operativamente producir una hora de trabajo." }
        ],
        expected: "Un dashboard activo con la certeza de tu tasa de costo por hora (BCR) real.",
        image: "/Onboarding.gif"
    },
    {
        phase: 2,
        title: "Construcción de Cotizaciones Inteligentes",
        icon: Hammer,
        color: "from-brand-500 to-orange-500",
        description: "Diseñar una propuesta rentable basada en ingeniería, no en supuestos.",
        procedures: [
            { subtitle: "2.1 Estructura del Proyecto", text: "Crea un proyecto, asigna un cliente y define la moneda. Nougram preparará el entorno fiscal según la ubicación." },
            { subtitle: "2.2 Selección de Servicios y Recursos", text: "Elige los ítems de tu catálogo y define el esfuerzo estimado en horas o cantidades." },
            { subtitle: "2.3 Resumen Ejecutivo e IA", text: "Optimiza cálculos en vivo y usa nuestra IA para redactar un resumen ejecutivo que justifique técnicamente tu precio." }
        ],
        expected: "Una propuesta comercial blindada con un margen neto precalculado con exactitud.",
        image: "/docs/step2.png"
    },
    {
        phase: 3,
        title: "Despliegue y Seguridad",
        icon: Send,
        color: "from-purple-500 to-fuchsia-500",
        description: "Entregar la propuesta de forma profesional y segura.",
        procedures: [
            { subtitle: "3.1 Preparación del Envío", text: "Configura el mensaje comercial y verifica datos de contacto. Nougram genera accesos seguros." },
            { subtitle: "3.2 Protocolo de Acceso", text: "Elige el nivel de seguridad del enlace: Automática (Clave segura) o Manual (Clave del usuario). Define la vigencia del enlace." }
        ],
        expected: "Un enlace seguro y encriptado con caducidad definida para el portal del cliente.",
        image: "/docs/step3.png"
    },
    {
        phase: 4,
        title: "Experiencia del Cliente (El Portal)",
        icon: Eye,
        color: "from-teal-500 to-emerald-500",
        description: "Eliminar la fricción en la toma de decisiones con el Mission Control.",
        procedures: [
            { subtitle: "4.1 Acceso y Revisión", text: "El cliente ingresa con su clave temporal para desglosar condiciones y alcances sin adjuntos pesados." },
            { subtitle: "4.2 Resolución del Cliente", text: "Tres rutas claras: Aceptar (Formalizar cierre), Solicitar Revisión (Feedback trazable) o Rechazar." }
        ],
        expected: "Aprobación o retroalimentación en tiempo real con plena trazabilidad de acceso.",
        image: "/docs/step4.png"
    },
    {
        phase: 5,
        title: "Seguimiento y Cierre",
        icon: TrendingUp,
        color: "from-pink-500 to-rose-500",
        description: "Control total del pipeline comercial.",
        procedures: [
            { subtitle: "5.1 Monitoreo y Reenvíos", text: "Identifica propuestas por vencer. Renueva la vigencia con un solo clic para reactivar la negociación." },
            { subtitle: "5.2 Mejores Prácticas Nougram", text: "Evita claves obvias, personaliza con IA y mantén tus costos actualizados para que tu BCR siempre sea exacto." }
        ],
        expected: "Monitoreo constante del embudo de ingresos y actualización del costo para futuras cotizaciones.",
        image: "/docs/step5.png" }
];

const STEPS_EN = [
    {
        phase: 1,
        title: "Onboarding and Financial DNA",
        icon: Settings,
        color: "from-sky-500 to-indigo-500",
        description: "Establish your real Blended Cost Rate (BCR). Without this data, you are quoting blind.",
        procedures: [
            { subtitle: "1.1 Organizational Identity", text: "Define who you are. Enter your organization name and sector. Ideal for the portal your client will see." },
            { subtitle: "1.2 Fixed Costs Registration", text: "Load recurring costs (software, rent, services). Use templates to avoid invisible expenses." },
            { subtitle: "1.3 Team and Real Capacity", text: "Add your team with their real salaries. Set up actual billable hours, not theoretical ones." },
            { subtitle: "1.4 The Moment of Truth: Your BCR", text: "Review your Blended Cost Rate. This number represents how much it costs operatively to produce an hour of work." }
        ],
        expected: "A live dashboard with the certainty of your real hourly cost rate (BCR).",
        image: "/Onboarding.gif"
    },
    {
        phase: 2,
        title: "Smart Quotes Construction",
        icon: Hammer,
        color: "from-brand-500 to-orange-500",
        description: "Design a profitable proposal based on engineering, not assumptions.",
        procedures: [
            { subtitle: "2.1 Project Structure", text: "Create a project, assign a client, and set currency. Nougram will prepare the fiscal environment by location." },
            { subtitle: "2.2 Services and Resources Selection", text: "Choose items from your catalog and define estimated effort in hours or quantities." },
            { subtitle: "2.3 Executive Summary and AI", text: "Optimize calculations live and use our AI to draft an executive summary justifying your price technically." }
        ],
        expected: "A secure commercial proposal with a net margin pre-calculated with accuracy.",
        image: "/docs/step2.png"
    },
    {
        phase: 3,
        title: "Deployment and Security",
        icon: Send,
        color: "from-purple-500 to-fuchsia-500",
        description: "Deliver proposals professionally and securely.",
        procedures: [
            { subtitle: "3.1 Shipping Preparation", text: "Configure the commercial message and verify contact data. Nougram generates secure accesses." },
            { subtitle: "3.2 Access Protocol", text: "Choose link security: Automatic (Secure key) or Manual (User key). Define link expiration." }
        ],
        expected: "A secure, encrypted link with defined expiration for the client portal.",
        image: "/docs/step3.png"
    },
    {
        phase: 4,
        title: "Client Experience (The Portal)",
        icon: Eye,
        color: "from-teal-500 to-emerald-500",
        description: "Eliminate friction in decision making with Mission Control.",
        procedures: [
            { subtitle: "4.1 Access and Review", text: "Clients enter with temporary key to break down conditions and scopes without heavy attachments." },
            { subtitle: "4.2 Client Resolution", text: "Three clear paths: Accept (Close deal), Request Review (Traceable feedback), or Reject." }
        ],
        expected: "Real-time approval or feedback with full access traceability.",
        image: "/docs/step4.png"
    },
    {
        phase: 5,
        title: "Follow-up and Closing",
        icon: TrendingUp,
        color: "from-pink-500 to-rose-500",
        description: "Full control of the commercial pipeline.",
        procedures: [
            { subtitle: "5.1 Monitoring and Resending", text: "Identify quotes about to expire. Renew with one click to reactivate negotiations." },
            { subtitle: "5.2 Nougram Best Practices", text: "Avoid obvious keys, personalize with AI, and keep your costs updated to support your BCR rate." }
        ],
        expected: "Constant monitoring of the revenue funnel and cost update for future quotes.",
        image: "/docs/step5.png"
    }
];


export const Documentation = () => {
    const { language } = useTranslation();
    const STEPS = language === 'es' ? STEPS_ES : STEPS_EN;
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="relative min-h-screen bg-dark-900 overflow-hidden pt-32 pb-24">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-300 text-xs font-semibold tracking-wide backdrop-blur-md mb-6 hover:bg-brand-900/60 transition-colors cursor-default">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>{language === 'es' ? 'GUÍA MAESTRA DE CONFIGURACIÓN' : 'MASTER CONFIGURATION GUIDE'}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        <span>{language === 'es' ? 'De Cero a la ' : 'From Zero to '}</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400 bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">{language === 'es' ? 'Certeza Financiera' : 'Financial Certainty'}</span>
                    </h1>
                    <p className="text-slate-400 mt-4 text-sm md:text-base font-mono max-w-xl mx-auto leading-relaxed">
                        {language === 'es' ? 'Bienvenido a la infraestructura de Nougram. Esta guía te llevará paso a paso.' : 'Welcome to Nougram infrastructure. This guide will take you step by step.'}
                    </p>
                </div>

                {/* Stepper Container */}
                <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[24px] md:left-[28px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-700/60 z-0"></div>

                    <div className="space-y-6">
                        {STEPS.map((step, index) => {
                            const isOpen = activeIndex === index;
                            const Icon = step.icon;

                            return (
                                <div key={step.phase} className="relative z-10">
                                    <div className="flex items-start gap-4 md:gap-6">
                                        
                                        {/* Stepper Node (Icon) */}
                                        <button
                                            onClick={() => setActiveIndex(isOpen ? null : index)}
                                            className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                                                isOpen
                                                    ? `bg-gradient-to-br ${step.color} border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-110`
                                                    : 'bg-dark-800 border-white/5 text-slate-500 hover:border-slate-600/50 hover:text-slate-300'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isOpen ? 'rotate-12' : 'rotate-0'}`} />
                                        </button>

                                        {/* Content Card / Expandable Artifact */}
                                        <div className="flex-1">
                                            <button
                                                onClick={() => setActiveIndex(isOpen ? null : index)}
                                                className={`w-full text-left p-5 md:p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
                                                    isOpen
                                                        ? 'bg-white/[0.03] border-white/10 shadow-2xl shadow-black/30'
                                                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className={`text-xs font-black uppercase tracking-widest bg-clip-text bg-gradient-to-r ${step.color}`}>
                                                            {language === 'es' ? 'FASE' : 'PHASE'} {step.phase}
                                                        </span>
                                                        <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                                                            {step.title}
                                                        </h3>
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'rotate-0'}`} />
                                                </div>

                                                <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
                                                    {step.description}
                                                </p>

                                                <AnimatePresence initial={false}>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1, marginTop: '1.5rem' }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="border-t border-white/5 pt-4 space-y-4">
                                                                <ul className="space-y-4">
                                                                    {step.procedures.map((proc, i) => (
                                                                        <li key={i} className="flex items-start gap-2.5">
                                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                            <div>
                                                                                <h4 className="text-sm font-bold text-white tracking-wide">
                                                                                    {proc.subtitle}
                                                                                </h4>
                                                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                                                    {proc.text}
                                                                                </p>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>

                                                                {/* Screenshot Placeholder */}
                                                                {step.image && (
                                                                    <div className="mt-4 relative rounded-xl overflow-hidden border border-white/5 bg-dark-800/50 aspect-video flex items-center justify-center p-1 group/img">
                                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                                                                        <img 
                                                                            src={step.image} 
                                                                            alt={step.title} 
                                                                            className="w-full h-full object-cover rounded-lg group-hover/img:scale-[1.02] transition-transform duration-500"
                                                                            onError={(e) => {
                                                                                e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"; // fallback para visualización premium
                                                                            }}
                                                                        />
                                                                        <div className="absolute bottom-2 right-2 bg-dark-900/80 backdrop-blur-md px-2 py-1 rounded text-[9px] text-slate-500 border border-white/5 font-mono">
                                                                            {step.image.split('/').pop()}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Expected Results - Monospace style requested */}
                                                                <div className="p-3.5 bg-brand-500/[0.03] border border-brand-500/10 rounded-xl mt-4">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">{language === 'es' ? 'Resultados Esperados' : 'Expected Results'}</span>
                                                                    </div>
                                                                    <p className="text-xs font-mono font-semibold text-white leading-relaxed">
                                                                        {step.expected}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
