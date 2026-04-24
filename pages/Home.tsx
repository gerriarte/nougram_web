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

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://nougram.co/#organization",
                "name": "Nougram",
                "url": "https://nougram.co",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://nougram.co/logo-nougram.png"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://nougram.co/#website",
                "url": "https://nougram.co",
                "name": "Nougram",
                "publisher": { "@id": "https://nougram.co/#organization" },
                "description": COPY.hero.subheadline
            },
            {
                "@type": "SoftwareApplication",
                "name": "Nougram AI Quoter",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": COPY.hero.subheadline,
                "url": "https://nougram.co",
                "author": { "@id": "https://nougram.co/#organization" },
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                }
            }
        ]
    };

    return (
        <main>
            <Helmet>
                <meta name="description" content={COPY.site.description} />
                <meta name="keywords" content={COPY.site.keywords} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
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
