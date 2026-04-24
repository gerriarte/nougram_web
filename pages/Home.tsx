import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../context/LanguageContext';
import { Hero } from '../components/Hero';
import { TargetAudience } from '../components/TargetAudience';
import { Problem } from '../components/Problem';
import { Solution } from '../components/Solution';
import { Integrations } from '../components/Integrations';
import { Pricing } from '../components/Pricing';
import { Credibility } from '../components/Credibility';
import { FAQ } from '../components/FAQ';

export const Home: React.FC = () => {
    const { t: COPY } = useTranslation();

    return (
        <main>
            <Helmet>
                <meta name="description" content={COPY.site.description} />
                <meta name="keywords" content={COPY.site.keywords} />
            </Helmet>
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
