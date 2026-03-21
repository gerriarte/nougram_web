import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { motion } from 'framer-motion';



interface FloatingQuestionProps {
  text: string;
  index: number;
}

const FloatingQuestion: React.FC<FloatingQuestionProps> = ({ text, index }) => {
  // Seeded pseudo-random for consistent but scattered placement
  const seed = (index * 1337 + 42) % 100;
  const seed2 = (index * 773 + 17) % 100;
  const left = 2 + (seed * 0.9);
  const top = 2 + (seed2 * 0.85);

  const duration = 4 + (seed % 5) * 1.2;
  const delay = (index * 1.1) + (seed2 % 3) * 0.7;
  const driftX = seed % 2 === 0 ? 20 : -20;

  return (
    <motion.div
      className="absolute max-w-[280px] lg:max-w-xs"
      style={{ left: `${Math.min(left, 82)}%`, top: `${Math.min(top, 85)}%` }}
      initial={{ opacity: 0, scale: 0.7, y: 20, x: 0 }}
      animate={{
        opacity: [0, 0.85, 0.85, 0.6, 0],
        scale: [0.7, 1.05, 1, 0.95, 0.8],
        y: [20, -5, 0, -10, -30],
        x: [0, driftX * 0.3, driftX * 0.5, driftX * 0.2, 0],
      }}
      transition={{
        duration: duration + 3,
        delay: delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <span
        className={`
          px-3 py-1.5 lg:px-4 lg:py-2
          text-xs lg:text-sm font-mono
          ${index % 3 === 0
            ? 'text-red-400'
            : index % 3 === 1
              ? 'text-brand-400'
              : 'text-slate-400'
          }
        `}
      >
        {text}
      </span>
    </motion.div>
  );
};

export const Problem: React.FC = () => {
  const { t: COPY } = useTranslation();
  const FLOATING_QUESTIONS = COPY.problem.floatingQuestions;
  return (
    <section className="py-12 lg:py-24 bg-nougram-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Floating Questions Animation */}
          <div className="order-2 lg:order-1">
            <div className="relative w-full h-[360px] lg:h-[500px] overflow-hidden">
              {/* Subtle radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(243,93,10,0.06),transparent_70%)]"></div>

              {/* Floating questions */}
              {FLOATING_QUESTIONS.map((q, i) => (
                <FloatingQuestion key={i} text={q} index={i} />
              ))}


            </div>
          </div>

          {/* Right: Problem Text */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs rounded-md mb-4 uppercase tracking-[0.2em]">
              {COPY.problem.badge}
            </span>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              {COPY.problem.title}
            </h3>
            <p className="text-base lg:text-lg text-slate-400 mb-6 leading-relaxed font-mono">
              {COPY.problem.description}
            </p>
            <div className="pl-4 lg:pl-6 border-l-2 border-brand-500">
              <p className="text-base lg:text-lg text-slate-300 font-medium italic leading-relaxed">
                {COPY.problem.implication}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};