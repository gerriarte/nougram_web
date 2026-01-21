import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Timer, ArrowRight } from 'lucide-react';

interface CountdownProps {
    targetDate: Date;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const scrollToForm = () => {
        const formElement = document.getElementById('join-beta');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-2 p-3 bg-brand-900/90 border border-brand-500/30 rounded-2xl backdrop-blur-md shadow-2xl shadow-brand-900/50 animate-fade-in-up">
            <div className="flex items-center gap-2 text-brand-300 text-[10px] font-bold uppercase tracking-wider">
                <Timer className="w-3 h-3" />
                <span>{t.countdown.label}</span>
            </div>

            <div className="flex gap-2 text-center items-center justify-center bg-black/20 rounded-lg px-3 py-1.5 w-full">
                <div className="flex flex-col min-w-[24px]">
                    <span className="text-xl font-bold text-white font-mono leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[8px] text-brand-400 uppercase">{t.countdown.days}</span>
                </div>
                <span className="text-white/30 font-bold -mt-2">:</span>
                <div className="flex flex-col min-w-[24px]">
                    <span className="text-xl font-bold text-white font-mono leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[8px] text-brand-400 uppercase">{t.countdown.hours}</span>
                </div>
                <span className="text-white/30 font-bold -mt-2">:</span>
                <div className="flex flex-col min-w-[24px]">
                    <span className="text-xl font-bold text-white font-mono leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[8px] text-brand-400 uppercase">{t.countdown.minutes}</span>
                </div>
                <span className="text-white/30 font-bold -mt-2">:</span>
                <div className="flex flex-col min-w-[24px]">
                    <span className="text-xl font-bold text-white font-mono leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[8px] text-brand-400 uppercase">{t.countdown.seconds}</span>
                </div>
            </div>

            <button
                onClick={scrollToForm}
                className="w-full mt-1 bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 group shadow-lg shadow-brand-500/20"
            >
                <span>{t.countdown.cta}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
    );
};
