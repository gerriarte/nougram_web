import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TRANSLATIONS } from '../constants';

type Language = 'es' | 'en';
type TranslationType = typeof TRANSLATIONS.es;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const browserLang = navigator.language || (navigator as any).userLanguage;
            if (browserLang && browserLang.startsWith('es')) {
                return 'es';
            }
            return 'en';
        }
        return 'es';
    });

    const value = {
        language,
        setLanguage,
        t: TRANSLATIONS[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
