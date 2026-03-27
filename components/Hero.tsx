import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { Button } from './Button';
import { FeedbackModal } from './FeedbackModal';
import { MoneyRain } from './MoneyRain';
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

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80", // Edificio Corporativo
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80", // Oficina Moderna Noche
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80", // Equipo de Trabajo
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80"  // Vista Ciudad Noche
];

export const Hero: React.FC = () => {
  const { t: COPY } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profession: '',
    phone: '',
    company: '',
    country: '',
    website: '',
    termsConsent: false,
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
      setEmailError(value && !validateEmail(value) ? COPY.heroValidation.invalidEmail : '');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setEmailError(COPY.heroValidation.invalidEmailVerbose);
      return;
    }
    // Submit directly without asking for feedback consent in modal first
    handleFinalSubmit(false);
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
        setFormData({ name: '', email: '', profession: '', phone: '', company: '', country: '', website: '', termsConsent: false, _gotcha: '' });
        setEmailError('');
        setIsEmailTouched(false);
        // Show confirmation modal after successful submission
        setIsModalOpen(true);
      } else {
        alert(COPY.heroValidation.connectionError);
        setIsModalOpen(false); // Close modal if error
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(COPY.heroValidation.connectionError);
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
        {/* Continuous Background Slideshow */}
        <div className="absolute inset-0 z-0">
          {BG_IMAGES.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out ${index === bgIndex ? 'opacity-20' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          {/* dark overlay to maintain high contrast for the text */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-900/30 to-dark-900 opacity-90" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <MoneyRain />

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
                <span>{COPY.hero.placeholders.betaBadge}</span>
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
              <Counter end={98} suffix="%" label={COPY.hero.stats.Accuracy} />
              <Counter end={50} suffix="%" label={COPY.hero.stats.Saving} />
              <Counter end={35} suffix="%" label={COPY.hero.stats.Margin} />
            </div>

            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 text-xs font-medium text-slate-400 fade-in-up ${loaded ? 'visible' : ''}`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-brand-400" /> {COPY.hero.specs.RealData}</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> {COPY.hero.specs.Private}</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> {COPY.hero.specs.ML}</div>
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
                <h3 className="text-lg lg:text-xl font-semibold text-white mb-5">{COPY.hero.placeholders.modalTitle}</h3>

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
                      placeholder={COPY.hero.placeholders.name}
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border border-white/20 md:border-white/10 rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70"
                    />

                    <input
                      name="profession"
                      type="text"
                      placeholder={COPY.hero.placeholders.profession}
                      required
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border border-white/20 md:border-white/10 rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70"
                    />

                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        placeholder={COPY.hero.placeholders.email}
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70 ${emailError
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
                      placeholder={COPY.hero.placeholders.phone}
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border border-white/20 md:border-white/10 rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70"
                    />

                    <input
                      name="company"
                      type="text"
                      placeholder={COPY.hero.placeholders.company}
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border border-white/20 md:border-white/10 rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="country"
                        type="text"
                        placeholder={COPY.hero.placeholders.country}
                        required
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border border-white/20 md:border-white/10 rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70"
                      />
                      <input
                        name="website"
                        type="url"
                        placeholder={COPY.hero.placeholders.website}
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm bg-dark-800/70 md:bg-dark-800/50 border border-white/20 md:border-white/10 rounded-xl text-white placeholder-slate-400 md:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all hover:bg-dark-800/80 md:hover:bg-dark-800/70"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          name="termsConsent"
                          type="checkbox"
                          checked={formData.termsConsent}
                          onChange={handleChange}
                          required
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
                      <span className="text-xs text-slate-300 md:text-slate-400 group-hover:text-slate-100 md:group-hover:text-slate-300 transition-colors pt-0.5 leading-tight">
                        {COPY.hero.acceptTerms} <Link to="/terminos" target="_blank" className="text-brand-400 underline hover:text-brand-300">{COPY.hero.terms}</Link>
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
                    {isSubmitting ? COPY.hero.placeholders.submitting : COPY.hero.cta}
                  </Button>
                </form>


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