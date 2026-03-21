import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Shield, Lock, Eye, FileText, AlertTriangle, Database, Users, Settings2, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Terms = () => {
    const { language } = useTranslation();
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const SECTIONS_ES = [
        {
            title: "1. Objeto y Ámbito de Aplicación",
            icon: FileText,
            color: "from-sky-500 to-indigo-500",
            content: (
                <p>El presente documento establece las condiciones bajo las cuales NOUGRAM (en adelante, "la Plataforma" o "el Proveedor") recopila, almacena, procesa y protege la información suministrada por los usuarios registrados (en adelante, "el Usuario") y la información correspondiente a los clientes o prospectos de dicho Usuario (en adelante, "Datos de Terceros").</p>
            )
        },
        {
            title: "2. Naturaleza de los Datos Recopilados",
            icon: Database,
            color: "from-purple-500 to-indigo-500",
            content: (
                <div className="space-y-4">
                    <p>Para la prestación de los servicios de infraestructura financiera y cotización, la Plataforma recopila las siguientes categorías de información:</p>
                    <ul className="space-y-3 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Datos de Cuenta del Usuario:</strong> Nombre, correo electrónico, datos de facturación e información fiscal del titular de la cuenta.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Datos Operativos y Financieros:</strong> Estructuras de costos, márgenes de utilidad, tarifas por hora y proyecciones financieras ingresadas por el Usuario.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Datos de Terceros (Clientes del Usuario):</strong> Nombres, razones sociales, correos electrónicos, presupuestos, historial de cotizaciones y detalles de proyectos de los clientes finales del Usuario.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Rol de las Partes en el Tratamiento de Datos",
            icon: Users,
            color: "from-teal-500 to-emerald-500",
            content: (
                <p>Respecto a los Datos de Terceros ingresados en la Plataforma, el Usuario actúa como único Responsable del Tratamiento. NOUGRAM actúa exclusivamente en calidad de Encargado del Tratamiento, limitando su accionar a proveer la infraestructura tecnológica para el almacenamiento y procesamiento de dicha información, bajo las instrucciones implícitas en el uso del software por parte del Usuario.</p>
            )
        },
        {
            title: "4. Finalidad del Tratamiento de la Información",
            icon: Settings2,
            color: "from-amber-500 to-orange-500",
            content: (
                <div className="space-y-3">
                    <p>Los datos suministrados serán utilizados de manera exclusiva para los siguientes fines:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Generar, almacenar y enviar cotizaciones y propuestas comerciales a solicitud del Usuario.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Calcular métricas de rentabilidad, proyecciones de flujo de caja y obligaciones fiscales según los parámetros de la Plataforma.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Mantener el registro histórico operativo requerido para el funcionamiento de la cuenta del Usuario.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Mejorar los algoritmos de la Plataforma mediante el uso de datos estrictamente agregados y sometidos a un proceso de anonimización irreversible, garantizando que ninguna métrica pueda ser vinculada a un Usuario o Tercero específico.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "5. Confidencialidad y Prohibición de Comercialización",
            icon: Lock,
            color: "from-brand-500 to-red-500",
            content: (
                <div className="space-y-3">
                    <p>NOUGRAM reconoce el carácter estrictamente confidencial de la información financiera y comercial ingresada. El Proveedor se compromete a:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">No vender, alquilar, ceder ni distribuir</strong> total o parcialmente los Datos de la Cuenta ni los Datos de Terceros a ninguna entidad externa con fines publicitarios, de marketing o comerciales.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></div>
                            <span>Restringir el acceso a los datos únicamente al personal técnico autorizado, exclusivamente para fines de mantenimiento, soporte técnico solicitado por el Usuario, o cumplimiento de obligaciones legales frente a autoridades competentes.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "6. Seguridad de la Información y Almacenamiento",
            icon: Shield,
            color: "from-blue-500 to-indigo-500",
            content: (
                <div className="space-y-3">
                    <p>La Plataforma emplea protocolos de seguridad estándar de la industria, incluyendo el cifrado de datos en tránsito y en reposo. La información es almacenada en servidores en la nube de proveedores de infraestructura que cumplen con certificaciones internacionales de seguridad y protección de datos.</p>
                    <p className="p-3 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl mt-3 text-xs font-mono flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>En caso de detectarse una vulnerabilidad o brecha de seguridad que comprometa los Datos de Terceros, NOUGRAM notificará al Usuario en un plazo no mayor a 72 horas desde su confirmación técnica.</span>
                    </p>
                </div>
            )
        },
        {
            title: "7. Retención, Exportación y Eliminación de Datos",
            icon: Trash2,
            color: "from-pink-500 to-rose-500",
            content: (
                <div className="space-y-3">
                    <p>El Usuario mantiene la propiedad intelectual y el control sobre la información ingresada. Durante la vigencia del servicio, el Usuario podrá exportar sus bases de datos operativas y financieras.</p>
                    <p>Tras la cancelación o cierre de la cuenta por cualquier motivo, NOUGRAM procederá a la eliminación definitiva de los Datos de Cuenta y Datos de Terceros de sus servidores de producción en un plazo de treinta (30) días calendario, conservando únicamente aquella información agregada y anonimizada, o la requerida temporalmente para el cumplimiento de obligaciones fiscales y legales propias del Proveedor.</p>
                </div>
            )
        },
        {
            title: "ANEXO: Descargo de Responsabilidad (Disclaimer Legal)",
            icon: AlertTriangle,
            color: "from-amber-500 to-red-500",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-200 font-bold text-sm">DESCARGO DE RESPONSABILIDAD SOBRE CÁLCULOS TRIBUTARIOS Y FINANCIEROS</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">1. Naturaleza Informativa y Herramienta de Estimación</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">NOUGRAM opera exclusivamente como un software de asistencia para el cálculo, cotización y estimación de márgenes operativos, presupuestos y posibles retenciones tributarias. Los resultados, reportes y proyecciones generados por la Plataforma tienen un carácter estrictamente orientativo e informativo. NOUGRAM no es un estudio contable, no provee asesoría fiscal, legal ni financiera, y no sustituye la labor de un Contador Público Autorizado o asesor tributario certificado en la jurisdicción correspondiente al Usuario.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">2. Responsabilidad Exclusiva del Usuario</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">El Usuario reconoce y acepta que es el único responsable de la exactitud, veracidad y legalidad de los datos numéricos ingresados en la Plataforma. Asimismo, es responsabilidad indelegable del Usuario verificar, validar y confirmar cualquier cálculo de impuestos (incluyendo, pero no limitado a, IVA, retenciones en la fuente, impuestos transfronterizos o variaciones de tipo de cambio) con un profesional contable idóneo antes de emitir facturas con valor fiscal, presentar declaraciones juradas o realizar pagos a cualquier entidad gubernamental o autoridad tributaria.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">3. Exención de Responsabilidad ante Autoridades Fiscales</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Bajo ninguna circunstancia, NOUGRAM, sus fundadores, directores, empleados o afiliados serán responsables, solidaria o subsidiariamente, ante el Usuario o ante terceros (incluyendo entidades de recaudación fiscal locales o internacionales) por: Errores, omisiones o discrepancias en las declaraciones de impuestos presentadas por el Usuario; multas, sanciones, recargas, auditorías o intereses moratorios; o pérdidas de beneficios originadas por decisiones comerciales tomadas con base en las métricas del software.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">4. Volatilidad Normativa y Cambios Legislativos</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Las leyes fiscales, los tratados de doble tributación y las normativas contables están sujetos a cambios constantes en cada país o jurisdicción. NOUGRAM no garantiza que sus algoritmos y bases de datos reflejen de forma inmediata y exacta en tiempo real cada actualización legislativa, reforma tributaria o resolución aduanera aplicable al modelo de negocio específico del Usuario.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">5. Fluctuación de Divisas y Riesgo Cambiario</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">En el caso de cotizaciones internacionales o transacciones en moneda extranjera, los cálculos de conversión de divisas o estimaciones de fricción bancaria (Spread) provistos por la Plataforma son referenciales. NOUGRAM no asume responsabilidad por las pérdidas financieras que el Usuario pueda sufrir debido a la volatilidad del mercado cambiario o a las tasas y comisiones finales aplicadas por las pasarelas de pago o entidades bancarias intermediarias.</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    
const SECTIONS_EN = [
        {
            title: "1. Subject and Scope of Application",
            icon: FileText,
            color: "from-sky-500 to-indigo-500",
            content: (
                <p>This document establishes the conditions under which NOUGRAM (hereinafter, "the Platform" or "the Provider") collects, stores, processes, and protects the information supplied by registered users (hereinafter, "the User") and the information corresponding to the clients or prospects of said User (hereinafter, "Third-Party Data").</p>
            )
        },
        {
            title: "2. Nature of Data Collected",
            icon: Database,
            color: "from-purple-500 to-indigo-500",
            content: (
                <div className="space-y-4">
                    <p>For the provision of financial infrastructure and quoting services, the Platform collects the following categories of information:</p>
                    <ul className="space-y-3 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">User Account Data:</strong> Name, email, billing details, and tax information of the account holder.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Operational and Financial Data:</strong> Cost structures, profit margins, hourly rates, and financial projections entered by the User.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Third-Party Data (User's Clients):</strong> Names, corporate names, emails, budgets, quote history, and project details of the User's end clients.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Role of the Parties in Data Processing",
            icon: Users,
            color: "from-teal-500 to-emerald-500",
            content: (
                <p>With respect to Third-Party Data entered into the Platform, the User acts as the sole Data Controller. NOUGRAM acts exclusively as a Data Processor, limiting its scope to providing the technological infrastructure for the storage and processing of said information, under the instructions implicit in the use of the software by the User.</p>
            )
        },
        {
            title: "4. Purpose of Information Processing",
            icon: Settings2,
            color: "from-amber-500 to-orange-500",
            content: (
                <div className="space-y-3">
                    <p>The supplied data will be used exclusively for the following purposes:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Generate, store, and send quotes and commercial proposals at the User's request.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Calculate profitability metrics, cash flow projections, and tax obligations according to Platform parameters.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Maintain the operational historical record required for the functioning of the User's account.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Improve Platform algorithms through the use of strictly aggregated data subjected to an irreversible anonymization process, guaranteeing that no metric can be linked to a specific User or Third Party.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "5. Confidentiality and Ban on Commercialization",
            icon: Lock,
            color: "from-brand-500 to-red-500",
            content: (
                <div className="space-y-3">
                    <p>NOUGRAM recognizes the strictly confidential nature of the financial and commercial information entered. The Provider commits to:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Not selling, renting, transferring, or distributing</strong> strictly or partially Account Data or Third-Party Data to any external entity for advertising, marketing, or commercial purposes.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></div>
                            <span>Restricting access to data solely to authorized technical staff, exclusively for maintenance purposes, technical support requested by the User, or compliance with legal obligations to competent authorities.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "6. Information Security and Storage",
            icon: Shield,
            color: "from-blue-500 to-indigo-500",
            content: (
                <div className="space-y-3">
                    <p>The Platform employs industry-standard security protocols, including encryption of data in transit and at rest. Information is stored in cloud servers of infrastructure providers complying with international security and data protection certifications.</p>
                    <p className="p-3 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl mt-3 text-xs font-mono flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>In case of detecting a vulnerability or security breach compromising Third-Party Data, NOUGRAM will notify the User within a maximum of 72 hours from technical confirmation.</span>
                    </p>
                </div>
            )
        },
        {
            title: "7. Data Retention, Export, and Deletion",
            icon: Trash2,
            color: "from-pink-500 to-rose-500",
            content: (
                <div className="space-y-3">
                    <p>The User maintains intellectual property and control over the entered information. During the service term, the User may export their operational and financial databases.</p>
                    <p>Upon cancellation or closing of the account for any reason, NOUGRAM will proceed to the definitive deletion of Account Data and Third-Party Data from its production servers within thirty (30) calendar days, keeping only aggregated and anonymized information or that required temporarily for the Provider's own tax and legal compliance.</p>
                </div>
            )
        },
        {
            title: "ANNEX: Disclaimer (Legal Disclaimer)",
            icon: AlertTriangle,
            color: "from-amber-500 to-red-500",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-200 font-bold text-sm">TAX AND FINANCIAL CALCULATIONS DISCLAIMER</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">1. Informational Nature and Estimation Tool</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">NOUGRAM operates exclusively as ideal assistance software for calculating, quoting, and estimating operating margins, budgets, and possible tax withholdings. Results, reports, and projections generated by the Platform have a strictly orientational and informational character. NOUGRAM is not an accounting firm, does not provide tax, legal, or financial advice, and does not replace the work of a Certified Public Accountant or certified tax advisor in the User's corresponding jurisdiction.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">2. User's Exclusive Responsibility</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">The User recognizes and accepts that they are solely responsible for the accuracy, veracity, and legality of the numerical data entered into the Platform. Likewise, it is the User's non-delegable responsibility to verify, validate, and confirm any tax calculations (including, but not limited to, VAT, withholding at source, cross-border taxes, or exchange rate variations) with a suitable accounting professional before issuing invoices with tax value, submitting sworn declarations, or making payments to any government entity or tax authority.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">3. Exemption of Liability to Tax Authorities</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Under no circumstances will NOUGRAM, its founders, directors, employees, or affiliates be liable, jointly or severally, to the User or to third parties (including local or international tax collection entities) for: Errors, omissions, or discrepancies in tax declarations submitted by the User; fines, sanctions, surcharges, audits, or default interest; or loss of profits arising from commercial decisions made based on software metrics.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">4. Regulatory Volatility and Legislative Changes</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">Tax laws, double taxation treaties, and accounting regulations are subject to constant changes in each country or jurisdiction. NOUGRAM does not guarantee that its algorithms and databases reflect immediately and accurately in real-time every legislative update, tax reform, or customs resolution applicable to the User's specific business model.</p>
                        </div>

                        <div className="p-4 bg-dark-800/30 border border-white/5 rounded-xl">
                            <h4 className="text-sm font-bold text-white mb-1.5">5. Currency Fluctuations and Exchange Risk</h4>
                            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">In the case of international quotes or foreign currency transactions, currency conversion calculations or banking friction estimates (Spread) provided by the Platform are referential. NOUGRAM does not assume responsibility for financial losses that the User may suffer due to exchange market volatility or final fees and commissions applied by payment gateways or intermediary banking entities.</p>
                        </div>
                    </div>
                </div>
            )
        }
];

    const SECTIONS = language === 'es' ? SECTIONS_ES : SECTIONS_EN;

    return (
        <section className="relative min-h-screen bg-dark-900 overflow-hidden pt-32 pb-24">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-300 text-xs font-semibold tracking-wide backdrop-blur-md mb-6 hover:bg-brand-900/60 transition-colors cursor-default">
                        <Shield className="w-3.5 h-3.5 text-brand-400" />
                        <span>{language === 'es' ? 'PROTECCIÓN Y SEGURIDAD LEGAL' : 'LEGAL PROTECTION AND SECURITY'}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        {language === 'es' ? (
                            <>Términos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400">Tratamiento de Datos</span></>
                        ) : (
                            <>Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400">Processing Terms</span></>
                        )}
                    </h1>
                    <p className="text-slate-400 mt-4 text-sm md:text-base font-mono max-w-xl mx-auto leading-relaxed">
                        {language === 'es' ? 'Nuestra política de privacidad y condiciones vinculantes para el uso seguro de tu infraestructura financiera.' : 'Our privacy policy and binding conditions for the secure use of your financial infrastructure.'}
                    </p>
                </div>

                {/* Accordion / Expandable Content */}
                <div className="space-y-4">
                    {SECTIONS.map((section, index) => {
                        const isOpen = activeIndex === index;
                        const Icon = section.icon;

                        
const SECTIONS_EN = [
        {
            title: "1. Scope and Application",
            icon: FileText,
            color: "from-sky-500 to-indigo-500",
            content: (
                <p>This document establishes the conditions under which NOUGRAM (hereinafter, "the Platform" or "the Provider") collects, stores, processes, and protects the information supplied by registered users (hereinafter, "the User") and the information corresponding to the clients or prospects of said User (hereinafter, "Third-Party Data").</p>
            )
        },
        {
            title: "2. Nature of Collected Data",
            icon: Database,
            color: "from-purple-500 to-indigo-500",
            content: (
                <div className="space-y-4">
                    <p>For the provision of financial infrastructure and quoting services, the Platform collects the following categories of information:</p>
                    <ul className="space-y-3 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">User Account Data:</strong> Name, email, billing data, and fiscal information of the account holder.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Operational and Financial Data:</strong> Cost structures, profit margins, hourly rates, and financial projections entered by the User.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. Role of the Parties",
            icon: Users,
            color: "from-teal-500 to-emerald-500",
            content: (
                <p>Regarding Third-Party Data entered into the Platform, the User acts as the sole Data Controller. NOUGRAM acts exclusively as a Data Processor, limiting its scope to providing the technological infrastructure for storage and processing.</p>
            )
        },
        {
            title: "4. Purpose of Information Processing",
            icon: Settings2,
            color: "from-amber-500 to-orange-500",
            content: (
                <div className="space-y-3">
                    <p>The data supplied will be used exclusively for the following purposes:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Generate, store, and send commercial quotes and proposals at the User's request.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span>Calculate profitability metrics and tax obligations based on Platform parameters.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "5. Confidentiality and Commercialization Ban",
            icon: Lock,
            color: "from-brand-500 to-red-500",
            content: (
                <div className="space-y-3">
                    <p>NOUGRAM recognizes the strictly confidential nature of entered data and commits to:</p>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></div>
                            <span><strong className="text-white">Not selling, renting, or distributing</strong> any account data to external entities for marketing purposes.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "6. Information Security and Storage",
            icon: Shield,
            color: "from-blue-500 to-indigo-500",
            content: (
                <div className="space-y-3">
                    <p>The Platform uses industry-standard security protocols, including encryption of data in transit and at rest with cloud infrastructure.</p>
                </div>
            )
        },
        {
            title: "7. Data Retention and Elimination",
            icon: Trash2,
            color: "from-pink-500 to-rose-500",
            content: (
                <div className="space-y-3">
                    <p>Upon cancellation of the account, data will be permanently deleted from production within 30 days frame timelines.</p>
                </div>
            )
        },
        {
            title: "ANNEX: Disclaimer & Liabilities",
            icon: AlertTriangle,
            color: "from-amber-500 to-red-500",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-200 font-bold text-sm">FINANCIAL AND TAX CALCULATIONS DISCLAIMER</p>
                    <p className="text-xs text-slate-400">Nougram acts as a support software. It does not replace accountancy services or legal tax certification councils layouts frameworks.</p>
                </div>
            )
        }
];

    const SECTIONS = language === 'es' ? SECTIONS_ES : SECTIONS_EN;

    return (
                            <div key={index} className="bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/10">
                                <button
                                    onClick={() => setActiveIndex(isOpen ? null : index)}
                                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer transition-colors hover:bg-white/[0.01]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${section.color} border-white/10 text-white shadow-md`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'rotate-0'}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        >
                                            <div className="px-5 md:px-6 pb-6 text-slate-300 text-sm md:text-base leading-relaxed border-t border-white/5 pt-5">
                                                {section.content}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Legal Node */}
                <div className="text-center pt-12 text-xs text-slate-500 font-mono">
                    {language === 'es' ? (
                        <>Última actualización: Marzo {new Date().getFullYear()}. Para dudas sobre el tratamiento de tus datos o revocatoria de consentimientos, escribe a <a href="mailto:legal@nougram.com" className="text-brand-400 underline hover:text-brand-300">legal@nougram.com</a></>
                    ) : (
                        <>Last updated: March {new Date().getFullYear()}. For doubts about the treatment of your data or revocation of consent, write to <a href="mailto:legal@nougram.com" className="text-brand-400 underline hover:text-brand-300">legal@nougram.com</a></>
                    )}
                </div>

            </div>
        </section>
    );
};
