import React, { useState, useEffect } from 'react';
import { COPY } from '../constants';
import { Button } from './Button';
import { FeedbackModal } from './FeedbackModal';
import { CheckCircle2, TrendingUp, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

const Counter = ({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2500;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end]);

  return (
    <div className="flex flex-col items-center justify-center p-2 lg:p-4">
      <div className="text-3xl md:text-5xl font-bold text-white mb-1 tracking-tight tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-[10px] md:text-xs text-brand-200/80 font-medium uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profession: '',
    phone: '',
    country: '',
    whatsappConsent: false,
    _gotcha: '' // Honeypot field
  });
  const [emailError, setEmailError] = useState('');
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'email') {
      if (!isEmailTouched) setIsEmailTouched(true);
      setEmailError(value && !validateEmail(value) ? 'Correo inválido' : '');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setEmailError('Por favor, ingresa un correo válido.');
      return;
    }
    // Open modal to ask for feedback consent before submitting
    setIsModalOpen(true);
  };

  const handleFinalSubmit = async (feedbackConsent: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, feedbackConsent }),
      });

      if (response.ok) {
        setFormData({ name: '', email: '', profession: '', phone: '', country: '', whatsappConsent: false, _gotcha: '' });
        setEmailError('');
        setIsEmailTouched(false);
      } else {
        alert('Hubo un error al enviar tus datos. Por favor intenta de nuevo.');
        setIsModalOpen(false); // Close modal if error
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert('Hubo un error de conexión. Por favor intenta de nuevo.');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-dark-900 pt-20 pb-12 lg:pt-32 lg:pb-32">

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .fade-in-up { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in-up.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        {/* Animated Aurora Blobs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className={`fade-in-up ${loaded ? 'visible' : ''}`} style={{ transitionDelay: '0ms' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-300 text-[10px] md:text-xs font-semibold tracking-wide backdrop-blur-md mb-6 hover:bg-brand-900/60 transition-colors cursor-default">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>ACCESO BETA LIMITADO</span>
              </div>
            </div>

            <h1
              className={`text-4xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4 fade-in-up ${loaded ? 'visible' : ''}`}
              style={{ transitionDelay: '100ms' }}
            >
              {COPY.hero.headline.includes(':') ? (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400 bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
                    {COPY.hero.headline.split(':')[0]}
                  </span>
                  <span className="block text-2xl lg:text-4xl mt-4 text-slate-200 font-normal leading-snug">
                    {COPY.hero.headline.split(':')[1]}
                  </span>
                </>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400 bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
                  {COPY.hero.headline}
                </span>
              )}
            </h1>

            <p
              className={`text-base lg:text-lg text-slate-300/90 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 fade-in-up ${loaded ? 'visible' : ''}`}
              style={{ transitionDelay: '200ms' }}
            >
              {COPY.hero.subheadline}
            </p>

            <div
              className={`grid grid-cols-3 divide-x divide-white/10 border-t border-b border-white/10 py-4 mb-8 fade-in-up ${loaded ? 'visible' : ''}`}
              style={{ transitionDelay: '300ms' }}
            >
              <Counter end={98} suffix="%" label="Precisión" />
              <Counter end={50} suffix="%" label="Ahorro" />
              <Counter end={35} suffix="%" label="Margen" />
            </div>

            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 text-xs font-medium text-slate-400 fade-in-up ${loaded ? 'visible' : ''}`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-brand-400" /> Datos Reales</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> 100% Privado</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Machine Learning</div>
            </div>


          </div>

          {/* Right Content: Glass Form */}
          <div className="w-full max-w-md lg:w-[440px]" id="join-beta">
            <div
              className={`relative bg-white/5 border border-white/10 backdrop-blur-xl p-6 lg:p-8 rounded-3xl shadow-2xl fade-in-up ${loaded ? 'visible' : ''}`}
              style={{ transitionDelay: '500ms' }}
            >
              {/* Decorative Corner Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative">
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-1">Asegura tu lugar</h3>
                <p className="text-xs lg:text-sm text-slate-400 mb-5">Únete a la lista de espera exclusiva.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {/* Honeypot field for bots */}
                  <input
                    type="text"
                    name="_gotcha"
                    value={formData._gotcha}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <div className="space-y-3">
                    <input
                      name="name"
                      type="text"
                      placeholder="Tu Nombre"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/70"
                    />

                    <input
                      name="profession"
                      type="text"
                      placeholder="Tu Profesión"
                      required
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/70"
                    />

                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm bg-dark-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all hover:bg-dark-800/70 ${emailError
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : 'border-white/10 focus:ring-brand-500/50 focus:border-brand-500/50'
                          }`}
                      />
                      {emailError && (
                        <div className="absolute right-3 top-3 text-red-400 animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <input
                      name="phone"
                      type="tel"
                      placeholder="Tu Teléfono"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/70"
                    />

                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange as any} // Cast needed if types are strict for select vs input
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/70 appearance-none"
                    >
                      <option value="" disabled className="bg-dark-900 text-slate-500">Selecciona tu país</option>
                      <option value="Colombia" className="bg-dark-900">Colombia</option>
                      <option value="Argentina" className="bg-dark-900">Argentina</option>
                      <option value="Venezuela" className="bg-dark-900">Venezuela</option>
                      <option value="Perú" className="bg-dark-900">Perú</option>
                      <option value="Chile" className="bg-dark-900">Chile</option>
                    </select>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          name="whatsappConsent"
                          type="checkbox"
                          checked={formData.whatsappConsent}
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border border-white/20 rounded-md bg-dark-800/50 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all"></div>
                        <svg
                          className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors pt-0.5 leading-tight">
                        Acepto ser agregado al grupo de WhatsApp de Nougram para recibir actualizaciones.
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className={`mt-2 py-3 lg:py-4 text-sm lg:text-base shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 border-t border-white/10 ${emailError || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!!emailError || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Obtener Acceso Anticipado'}
                  </Button>
                </form>

                <p className="mt-4 text-center text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Sin Spam • Acceso Gratuito • Cupos Limitados
                </p>
              </div>
            </div>
          </div>

        </div >
      </div >

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDecision={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </section >
  );
};