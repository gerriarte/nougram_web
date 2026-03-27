import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Loader2, RotateCcw, Target } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

type TestStep = 'welcome' | 'questions' | 'gate' | 'result';

interface QuestionOption {
  label: string;
  points: number;
}

interface Question {
  id: number;
  category: string;
  prompt: string;
  options: QuestionOption[];
}

interface Diagnosis {
  title: string;
  description: string;
  accentClass: string;
  badgeClass: string;
}

interface CategoryMetric {
  label: string;
  value: number;
  max: number;
}

interface TestAnswer {
  questionId: number;
  question: string;
  answer: string;
  points: number;
}

const QUESTIONS_ES: Question[] = [
  {
    id: 1,
    category: 'Flujo de Caja',
    prompt: '¿Cuántos meses sobrevive tu negocio sin clientes nuevos?',
    options: [
      { label: 'Menos de 1 mes', points: 0 },
      { label: '1 a 3 meses', points: 3 },
      { label: 'Más de 3 meses', points: 7 },
    ],
  },
  {
    id: 2,
    category: 'Flujo de Caja',
    prompt: '¿Qué porcentaje de tus ingresos son recurrentes?',
    options: [
      { label: '0% a 20%', points: 0 },
      { label: '20% a 50%', points: 3 },
      { label: 'Más de 50%', points: 7 },
    ],
  },
  {
    id: 3,
    category: 'Flujo de Caja',
    prompt: '¿Cuál es tu tiempo promedio de cobro?',
    options: [
      { label: 'Más de 30 días', points: 0 },
      { label: '0 a 30 días', points: 3 },
      { label: 'Por adelantado', points: 6 },
    ],
  },
  {
    id: 4,
    category: 'Rentabilidad',
    prompt: '¿Conocés tu costo por hora operativo real?',
    options: [
      { label: 'No', points: 0 },
      { label: 'Tengo un estimado', points: 5 },
      { label: 'Sí, al centavo', points: 12 },
    ],
  },
  {
    id: 5,
    category: 'Rentabilidad',
    prompt: '¿El margen final de tus proyectos es el presupuestado?',
    options: [
      { label: 'No lo calculo', points: 0 },
      { label: 'Termino cobrando menos', points: 5 },
      { label: 'Exactamente el presupuestado', points: 11 },
    ],
  },
  {
    id: 6,
    category: 'Rentabilidad',
    prompt: '¿Cada cuánto actualizás tus tarifas?',
    options: [
      { label: 'Hace más de un año', points: 0 },
      { label: 'Una vez al año', points: 5 },
      { label: 'Cada 6 meses', points: 12 },
    ],
  },
  {
    id: 7,
    category: 'Pipeline',
    prompt: '¿Cuántas propuestas necesitás para cerrar un cliente?',
    options: [
      { label: 'Más de 7', points: 0 },
      { label: 'Entre 4 y 7', points: 3 },
      { label: 'Entre 1 y 3', points: 7 },
    ],
  },
  {
    id: 8,
    category: 'Pipeline',
    prompt: '¿Cuánto tiempo invertís por semana cotizando?',
    options: [
      { label: 'Más de 3 horas', points: 0 },
      { label: 'Entre 1 y 3 horas', points: 4 },
      { label: 'Menos de 1 hora', points: 8 },
    ],
  },
  {
    id: 9,
    category: 'Eficiencia',
    prompt: '¿Qué porcentaje de tu tiempo va a tareas no facturables?',
    options: [
      { label: 'Más del 30%', points: 0 },
      { label: 'Entre 10% y 30%', points: 7 },
      { label: 'Menos del 10%', points: 15 },
    ],
  },
  {
    id: 10,
    category: 'Eficiencia',
    prompt: '¿Qué sistema usás para gestionar propuestas y operaciones?',
    options: [
      { label: 'A mano / memoria', points: 0 },
      { label: 'Frankenstein de Excel + correos', points: 5 },
      { label: 'Sistema centralizado', points: 15 },
    ],
  },
];

const QUESTIONS_EN: Question[] = [
  {
    id: 1,
    category: 'Cash Flow',
    prompt: 'How many months can your business survive without new clients?',
    options: [
      { label: 'Less than 1 month', points: 0 },
      { label: '1 to 3 months', points: 3 },
      { label: 'More than 3 months', points: 7 },
    ],
  },
  {
    id: 2,
    category: 'Cash Flow',
    prompt: 'What percentage of your income is recurring?',
    options: [
      { label: '0% to 20%', points: 0 },
      { label: '20% to 50%', points: 3 },
      { label: 'More than 50%', points: 7 },
    ],
  },
  {
    id: 3,
    category: 'Cash Flow',
    prompt: 'What is your average collection time?',
    options: [
      { label: 'More than 30 days', points: 0 },
      { label: '0 to 30 days', points: 3 },
      { label: 'Paid upfront', points: 6 },
    ],
  },
  {
    id: 4,
    category: 'Profitability',
    prompt: 'Do you know your real operating hourly cost?',
    options: [
      { label: 'No', points: 0 },
      { label: 'I have an estimate', points: 5 },
      { label: 'Yes, to the cent', points: 12 },
    ],
  },
  {
    id: 5,
    category: 'Profitability',
    prompt: 'Is your final project margin what you budgeted?',
    options: [
      { label: "I don't calculate it", points: 0 },
      { label: 'I usually charge less', points: 5 },
      { label: 'Exactly as budgeted', points: 11 },
    ],
  },
  {
    id: 6,
    category: 'Profitability',
    prompt: 'How often do you update your rates?',
    options: [
      { label: 'More than a year ago', points: 0 },
      { label: 'Once per year', points: 5 },
      { label: 'Every 6 months', points: 12 },
    ],
  },
  {
    id: 7,
    category: 'Pipeline',
    prompt: 'How many proposals do you need to close one client?',
    options: [
      { label: 'More than 7', points: 0 },
      { label: 'Between 4 and 7', points: 3 },
      { label: 'Between 1 and 3', points: 7 },
    ],
  },
  {
    id: 8,
    category: 'Pipeline',
    prompt: 'How much time do you spend weekly creating quotes?',
    options: [
      { label: 'More than 3 hours', points: 0 },
      { label: 'Between 1 and 3 hours', points: 4 },
      { label: 'Less than 1 hour', points: 8 },
    ],
  },
  {
    id: 9,
    category: 'Efficiency',
    prompt: 'How much time goes to non-billable tasks?',
    options: [
      { label: 'More than 30%', points: 0 },
      { label: 'Between 10% and 30%', points: 7 },
      { label: 'Less than 10%', points: 15 },
    ],
  },
  {
    id: 10,
    category: 'Efficiency',
    prompt: 'What system do you use to manage proposals and operations?',
    options: [
      { label: 'Manual / memory', points: 0 },
      { label: 'Excel + emails Frankenstein', points: 5 },
      { label: 'Centralized system', points: 15 },
    ],
  },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FinancialHealthTest: React.FC = () => {
  const { language } = useTranslation();
  const isES = language === 'es';

  const questions = useMemo(() => (isES ? QUESTIONS_ES : QUESTIONS_EN), [isES]);

  const [step, setStep] = useState<TestStep>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerPoints, setAnswerPoints] = useState<number[]>(Array(10).fill(0));
  const [answers, setAnswers] = useState<Array<TestAnswer | null>>(Array(10).fill(null));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isEmailValid = emailRegex.test(email);
  const isGateFormValid = name.trim().length > 0 && isEmailValid;
  const gaugeColor = score <= 40 ? '#fca5a5' : score <= 75 ? '#fcd34d' : '#6ee7b7';

  const getDiagnosis = (points: number): Diagnosis => {
    if (points <= 40) {
      return {
        title: isES ? 'Modo Supervivencia' : 'Survival Mode',
        description: isES
          ? 'Tu operación está en riesgo por ineficiencia y fuga de margen. Necesitás ordenar costos, tiempos y tu sistema de cotización para proteger tu caja.'
          : 'Your operation is at risk due to inefficiency and margin leakage. You need to organize costs, time, and your quoting system to protect cash flow.',
        accentClass: 'text-red-300',
        badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30',
      };
    }

    if (points <= 75) {
      return {
        title: isES ? 'La Rueda de Hámster' : 'Hamster Wheel',
        description: isES
          ? 'Tenés tracción, pero tu sistema operativo no escala. Automatizar cotizaciones y decisiones financieras te ayudará a salir del estancamiento.'
          : 'You have traction, but your operating system does not scale. Automating quoting and financial decisions will help you break out of stagnation.',
        accentClass: 'text-amber-300',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    }

    return {
      title: isES ? 'Máquina Aceitada' : 'Well-Oiled Machine',
      description: isES
        ? 'Excelente salud financiera. Tu siguiente paso es escalar con precisión para multiplicar margen sin perder control.'
        : 'Excellent financial health. Your next step is to scale with precision to multiply margin without losing control.',
      accentClass: 'text-emerald-300',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  };

  const diagnosis = getDiagnosis(score);
  const categoryMetrics: CategoryMetric[] = [
    {
      label: isES ? 'Flujo de Caja' : 'Cash Flow',
      value: answerPoints[0] + answerPoints[1] + answerPoints[2],
      max: 20,
    },
    {
      label: isES ? 'Rentabilidad' : 'Profitability',
      value: answerPoints[3] + answerPoints[4] + answerPoints[5],
      max: 35,
    },
    {
      label: 'Pipeline',
      value: answerPoints[6] + answerPoints[7],
      max: 15,
    },
    {
      label: isES ? 'Eficiencia' : 'Efficiency',
      value: answerPoints[8] + answerPoints[9],
      max: 30,
    },
  ];
  const weakestMetric = categoryMetrics.reduce((lowest, metric) => {
    const lowestRatio = lowest.value / lowest.max;
    const currentRatio = metric.value / metric.max;
    return currentRatio < lowestRatio ? metric : lowest;
  }, categoryMetrics[0]);

  const marginProtection = Math.max(6, Math.min(28, Math.round((100 - score) * 0.24)));
  const quoteTimeRecovered =
    answerPoints[7] === 0
      ? isES ? '2 a 4 h/sem' : '2 to 4 h/week'
      : answerPoints[7] === 4
        ? isES ? '1 a 2 h/sem' : '1 to 2 h/week'
        : isES ? '0.5 a 1 h/sem' : '0.5 to 1 h/week';
  const automationPotential =
    answerPoints[9] === 0
      ? isES ? 'Muy Alto' : 'Very High'
      : answerPoints[9] === 5
        ? isES ? 'Alto' : 'High'
        : isES ? 'Medio' : 'Medium';

  const resetTest = () => {
    setStep('welcome');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswerPoints(Array(questions.length).fill(0));
    setAnswers(Array(questions.length).fill(null));
    setSelectedOption(null);
    setName('');
    setEmail('');
    setEmailTouched(false);
    setIsSubmitting(false);
  };

  const handleStart = () => {
    setStep('questions');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswerPoints(Array(questions.length).fill(0));
    setAnswers(Array(questions.length).fill(null));
    setSelectedOption(null);
    setEmailTouched(false);
  };

  const handleSelectOption = (option: QuestionOption, index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    window.setTimeout(() => {
      setScore((prev) => prev + option.points);
      setAnswerPoints((prev) => {
        const next = [...prev];
        next[currentQuestionIndex] = option.points;
        return next;
      });
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestionIndex] = {
          questionId: currentQuestion.id,
          question: currentQuestion.prompt,
          answer: option.label,
          points: option.points,
        };
        return next;
      });

      if (currentQuestionIndex === questions.length - 1) {
        setStep('gate');
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }

      setSelectedOption(null);
    }, 180);
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!name.trim() || !isEmailValid) return;

    setIsSubmitting(true);
    const leadPayload = {
      name: name.trim(),
      email: email.trim(),
      leadSource: 'financial-health-test',
      testSummary: {
        score,
        diagnosis: diagnosis.title,
        weakArea: weakestMetric.label,
        marginProtection: `+${marginProtection}%`,
        quoteTimeRecovered,
        automationPotential,
      },
      testAnswers: answers.filter((item): item is TestAnswer => item !== null),
      _gotcha: '',
    };

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      });
    } catch (error) {
      // Non-blocking: even if endpoint fails, keep experience flowing.
      console.error('Financial test lead capture failed:', error);
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep('result');
  };

  return (
    <main className="min-h-screen bg-dark-900 text-white pt-28 pb-16 px-4">
      <Helmet>
        <title>{isES ? 'Test de Salud Financiera | Nougram' : 'Financial Health Test | Nougram'}</title>
        <meta
          name="description"
          content={
            isES
              ? 'Descubrí en 2 minutos el estado financiero de tu operación y obtené un diagnóstico accionable.'
              : 'Discover your operation financial health in 2 minutes and get an actionable diagnosis.'
          }
        />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        {step === 'questions' && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>
                {isES ? 'Progreso' : 'Progress'} {currentQuestionIndex + 1}/{questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <section className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 sm:p-8 min-h-[440px] shadow-2xl shadow-black/30">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-center"
              >
                <span className="inline-flex w-fit items-center gap-2 text-xs tracking-widest uppercase font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full mb-6">
                  <Target className="w-3.5 h-3.5" />
                  {isES ? 'Diagnóstico Express' : 'Express Diagnostic'}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  {isES ? 'Test de Salud Financiera' : 'Financial Health Test'}
                </h1>
                <p className="mt-4 text-slate-300 leading-relaxed max-w-2xl">
                  {isES
                    ? 'Respondé 10 preguntas y recibí un diagnóstico preciso de tu operación financiera. Te tomará menos de 2 minutos.'
                    : 'Answer 10 questions and get a precise diagnosis of your financial operation. It takes less than 2 minutes.'}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
                    <p className="text-xl font-bold text-white">10</p>
                    <p className="text-[11px] text-slate-400">{isES ? 'Preguntas' : 'Questions'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
                    <p className="text-xl font-bold text-white">2m</p>
                    <p className="text-[11px] text-slate-400">{isES ? 'Duración' : 'Duration'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
                    <p className="text-xl font-bold text-white">100</p>
                    <p className="text-[11px] text-slate-400">{isES ? 'Puntos' : 'Points'}</p>
                  </div>
                </div>
                <button
                  onClick={handleStart}
                  className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {isES ? 'Comenzar Test' : 'Start Test'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 'questions' && currentQuestion && (
              <motion.div
                key={`q-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="h-full flex flex-col"
              >
                <span className="inline-flex w-fit text-[11px] font-semibold uppercase tracking-wider text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1">
                  {currentQuestion.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-5 leading-tight">
                  {currentQuestion.prompt}
                </h2>

                <div className="mt-8 space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isActive = selectedOption === index;
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleSelectOption(option, index)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isActive
                            ? 'border-brand-400 bg-brand-500/20 scale-[1.01]'
                            : 'border-white/10 hover:border-brand-500/40 hover:bg-white/[0.04]'
                          }`}
                      >
                        <span className="text-base font-medium text-slate-100">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 'gate' && (
              <motion.form
                key="gate"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleGateSubmit}
                className="h-full flex flex-col justify-center"
              >
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {isES ? 'Tu diagnóstico está listo' : 'Your diagnosis is ready'}
                </h2>
                <p className="mt-3 text-slate-300">
                  {isES
                    ? 'Dejá tus datos para mostrarte el resultado completo y recomendaciones accionables.'
                    : 'Leave your details to unlock your full result and actionable recommendations.'}
                </p>

                <div className="mt-6 space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isES ? 'Nombre' : 'Name'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/15 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={isES ? 'Correo electrónico' : 'Email address'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/15 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    required
                  />
                </div>

                {emailTouched && !isEmailValid && (
                  <p className="mt-2 text-sm text-red-300">
                    {isES ? 'Ingresa un correo electrónico válido.' : 'Please enter a valid email address.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !isGateFormValid}
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/50 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isES ? 'Ver mi resultado ahora' : 'See my result now'}
                </button>
              </motion.form>
            )}

            {step === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center">
                  <div className="mx-auto md:mx-0">
                    <div
                      className="relative w-44 h-44 rounded-full grid place-items-center"
                      style={{
                        background: `conic-gradient(${gaugeColor} ${score}%, rgba(255,255,255,0.12) ${score}% 100%)`,
                      }}
                    >
                      <div className="w-32 h-32 rounded-full bg-dark-900 border border-white/10 grid place-items-center">
                        <div className="text-center">
                          <p className="text-[11px] uppercase tracking-wider text-slate-400">
                            {isES ? 'Puntaje' : 'Score'}
                          </p>
                          <p className="text-3xl font-black text-white mt-1">{score}</p>
                          <p className="text-[11px] text-slate-400">/100</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={`rounded-2xl border p-5 ${diagnosis.badgeClass}`}>
                      <h3 className={`text-2xl font-bold ${diagnosis.accentClass}`}>{diagnosis.title}</h3>
                      <p className="mt-2 text-slate-100 leading-relaxed">{diagnosis.description}</p>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-sm text-slate-300">
                        {isES
                          ? `Tu área más crítica hoy es ${weakestMetric.label}. Este es el cuello de botella con mayor impacto en margen y caja.`
                          : `Your most critical area today is ${weakestMetric.label}. This bottleneck has the biggest impact on margin and cash flow.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    {isES ? 'Métricas del diagnóstico' : 'Diagnostic metrics'}
                  </h4>
                  <div className="mt-4 space-y-4">
                    {categoryMetrics.map((metric) => {
                      const pct = Math.round((metric.value / metric.max) * 100);
                      return (
                        <div key={metric.label}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-200">{metric.label}</span>
                            <span className="text-slate-300">{metric.value}/{metric.max} ({pct}%)</span>
                          </div>
                          <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">
                    {isES ? 'Impacto estimado con Nougram' : 'Estimated impact with Nougram'}
                  </h4>
                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {isES ? 'Margen protegido' : 'Protected margin'}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">+{marginProtection}%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {isES ? 'Tiempo recuperable' : 'Recoverable time'}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">{quoteTimeRecovered}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        {isES ? 'Potencial de automatización' : 'Automation potential'}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">{automationPotential}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    {isES
                      ? '*Estimaciones orientativas basadas en tu puntaje y patrones operativos reportados en el test.'
                      : '*Directional estimates based on your score and operating patterns reported in this test.'}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    {isES ? 'Quiero optimizar con Nougram' : 'I want to optimize with Nougram'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={resetTest}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isES ? 'Hacer test de nuevo' : 'Retake test'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
};
