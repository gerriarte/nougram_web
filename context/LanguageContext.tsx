import React, { createContext, useContext, useState } from 'react';
import { es } from '../translations/es';
import { en } from '../translations/en';

const translations = { es, en };

type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
    t: typeof es;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ 
    children, 
    initialLanguage 
}: { 
    children: React.ReactNode, 
    initialLanguage?: Language 
}) => {
    const [lang, setLang] = useState<Language>(() => {
        if (initialLanguage) return initialLanguage;
        
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('language') as Language;
            if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
                return savedLang;
            }
            const browserLang = navigator.language.toLowerCase();
            return browserLang.startsWith('es') ? 'es' : 'en';
        }
        return 'es';
    });
    
    const toggleLanguage = () => {
        setLang((prev) => {
            const next = prev === 'es' ? 'en' : 'es';
            if (typeof window !== 'undefined') {
                localStorage.setItem('language', next);
                document.cookie = `language=${next}; path=/; max-age=31536000`;
            }
            return next;
        });
    };

    const setLanguage = (l: Language) => {
        setLang(l);
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', l);
            document.cookie = `language=${l}; path=/; max-age=31536000`;
        }
    };
    
    const t = translations[lang];

    return (
        <LanguageContext.Provider value={{ language: lang, toggleLanguage, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useTranslation must be used within LanguageProvider');
    return context;
};
