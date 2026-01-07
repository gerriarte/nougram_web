import React from 'react';
import { Countdown } from '../components/Countdown';
import { Hero } from '../components/Hero';
import { TargetAudience } from '../components/TargetAudience';
import { Problem } from '../components/Problem';
import { Solution } from '../components/Solution';
import { Pricing } from '../components/Pricing';
import { Credibility } from '../components/Credibility';
import { FAQ } from '../components/FAQ';
import { FooterCTA } from '../components/FooterCTA';

export const Home: React.FC = () => {
    return (
        <>
            <main>
                <Hero />
                <TargetAudience />
                <Problem />
                <Solution />
                <Pricing />
                <Credibility />
                <FAQ />
            </main>
            <FooterCTA />
            <Countdown targetDate={new Date('2026-02-01T00:00:00')} />
        </>
    );
};
