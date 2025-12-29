import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TargetAudience } from './components/TargetAudience';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { Credibility } from './components/Credibility';
import { FAQ } from './components/FAQ';
import { FooterCTA } from './components/FooterCTA';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      <Header />
      <main>
        <Hero />
        <TargetAudience />
        <Problem />
        <Solution />
        <Credibility />
        <FAQ />
      </main>
      <FooterCTA />
    </div>
  );
}

export default App;