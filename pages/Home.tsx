import React from 'react';
import { Hero } from '../components/Hero';
import { TargetAudience } from '../components/TargetAudience';
import { Problem } from '../components/Problem';
import { Solution } from '../components/Solution';
import { Integrations } from '../components/Integrations';
import { Pricing } from '../components/Pricing';
import { Credibility } from '../components/Credibility';
import { FAQ } from '../components/FAQ';

export const Home: React.FC = () => {
    return (
        <main>
            <Hero />
            <TargetAudience />
            <Problem />
            <Solution />
            <Integrations />
            <Pricing />
            <Credibility />
            <FAQ />
        </main>
    );
};
