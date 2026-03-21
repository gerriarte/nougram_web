import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Terminal, Activity, DollarSign, Globe, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

const glitchAnimation: Variants = {
  hidden: { opacity: 0, x: -5 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export const MissionControl: React.FC = () => {
  const [projectBaseValue, setProjectBaseValue] = useState<number>(10000);
  const [hoursEstimated, setHoursEstimated] = useState<number>(40);
  const [targetMargin, setTargetMargin] = useState<number>(40);
  
  // Simulated Outputs
  const [internalCost, setInternalCost] = useState<number>(4500);
  const [taxWithholding, setTaxWithholding] = useState<number>(1500);
  const [finalNetMargin, setFinalNetMargin] = useState<number>(0);
  const [marginHealth, setMarginHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  // Recalculate physics when inputs change
  useEffect(() => {
    // Fictional calculation for demonstration
    const generatedCost = hoursEstimated * 85; 
    const taxes = projectBaseValue * 0.15; // Simulated 15% cross-border tax
    const netTake = projectBaseValue - generatedCost - taxes;
    const marginPct = (netTake / projectBaseValue) * 100;

    setInternalCost(generatedCost);
    setTaxWithholding(taxes);
    setFinalNetMargin(netTake);

    if (marginPct >= targetMargin) {
      setMarginHealth('healthy');
    } else if (marginPct >= targetMargin - 15) {
      setMarginHealth('warning');
    } else {
      setMarginHealth('critical');
    }
  }, [projectBaseValue, hoursEstimated, targetMargin]);

  return (
    <div className="min-h-screen bg-nougram-background text-nougram-textBase p-4 sm:p-8 font-sans selection:bg-nougram-primary">
      <header className="mb-8 border-b border-nougram-data/20 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="text-nougram-primary w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight uppercase">Nougram <span className="text-nougram-data/60 font-mono text-sm">v1.0.0-beta</span></h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-nougram-secondary">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>SYSTEM_ONLINE</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full">

        {/* OUTPUT PANEL: Financial Health Monitor */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-nougram-data/20 bg-[#1D1C2A] p-6 flex flex-col relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nougram-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <h2 className="text-lg font-semibold uppercase tracking-widest text-nougram-data mb-6 flex items-center justify-between">
            <span>Telemetry</span>
            <span className="text-xs font-mono bg-nougram-data/10 px-2 py-1 text-nougram-secondary border border-nougram-secondary/20">LIVE_SYNC</span>
          </h2>

          <div className="flex-1 flex flex-col justify-center space-y-8 z-10">
            {/* Artifact 1: Internal Cost */}
            <motion.div variants={glitchAnimation} initial="hidden" animate="visible" className="flex justify-between items-end border-b border-nougram-data/10 pb-2">
              <div>
                <span className="block text-xs uppercase font-mono text-nougram-textBase/50 mb-1">Internal Cost (Burdened)</span>
                <span className="text-2xl font-mono text-nougram-textBase">${internalCost.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-nougram-primary/80">-{((internalCost/projectBaseValue)*100).toFixed(1)}%</span>
              </div>
            </motion.div>

            {/* Artifact 2: Tax Leakage */}
            <motion.div variants={glitchAnimation} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="flex justify-between items-end border-b border-nougram-data/10 pb-2">
              <div>
                <span className="block text-xs uppercase font-mono text-nougram-textBase/50 mb-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Cross-Border Tax</span>
                <span className="text-2xl font-mono text-nougram-textBase">${taxWithholding.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-nougram-primary/80">-{((taxWithholding/projectBaseValue)*100).toFixed(1)}%</span>
              </div>
            </motion.div>

            {/* Artifact 3: Net Take (The Truth) */}
            <motion.div 
              className={`mt-6 p-4 border relative overflow-hidden transition-colors duration-500 ${
                marginHealth === 'critical' ? 'border-nougram-primary bg-nougram-primary/10' : 
                marginHealth === 'warning' ? 'border-nougram-secondary bg-nougram-secondary/10' : 
                'border-nougram-data/30 bg-[#262537]'
              }`}
            >
              {/* Animated scanline effect for critical status */}
              {marginHealth === 'critical' && (
                <motion.div 
                  initial={{ top: "-100%" }}
                  animate={{ top: "200%" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-nougram-primary/20 to-transparent pointer-events-none"
                />
              )}

              <div className="flex justify-between items-center relative z-10">
                <div>
                  <span className="block text-xs uppercase font-mono mb-1 flex items-center gap-2">
                    {marginHealth === 'critical' ? <ShieldAlert className="w-4 h-4 text-nougram-primary" /> : <CheckCircle2 className="w-4 h-4 text-nougram-secondary" />}
                    Final Net Take
                  </span>
                  <span className={`text-4xl font-mono font-bold tracking-tight ${marginHealth === 'critical' ? 'text-nougram-primary' : 'text-nougram-textBase'}`}>
                    ${finalNetMargin.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-xs uppercase font-mono text-nougram-textBase/50 mb-1">Real Margin</span>
                  <span className={`text-2xl font-mono ${marginHealth === 'critical' ? 'text-nougram-primary' : marginHealth === 'warning' ? 'text-nougram-secondary' : 'text-green-400'}`}>
                    {((finalNetMargin/projectBaseValue)*100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {marginHealth === 'critical' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 text-xs font-mono text-nougram-primary bg-nougram-primary/10 p-2 border border-nougram-primary/20"
                  >
                    MARGIN ANEMIA DETECTED: Spread is { (targetMargin - ((finalNetMargin/projectBaseValue)*100)).toFixed(1) }% below target threshold. Re-evaluate project scope or increase gross value immediately.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
