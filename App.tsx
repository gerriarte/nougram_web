import React from 'react';
import { Countdown } from './components/Countdown';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HeroHighlight } from './components/HeroHighlight';
import { TargetAudience } from './components/TargetAudience';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { Pricing } from './components/Pricing';
import { Credibility } from './components/Credibility';
import { FAQ } from './components/FAQ';
import { FooterCTA } from './components/FooterCTA';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      <Header />
      <main>
        <Hero />
        <HeroHighlight />
        <TargetAudience />
        <Problem />
        <Solution />
        <Pricing />
        <Credibility />
        <FAQ />
      </main>
      <FooterCTA />
      <Countdown targetDate={new Date('2026-03-15T00:00:00')} />
    </div>
  );
}

export default App;