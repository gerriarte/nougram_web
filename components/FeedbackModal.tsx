import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Check, Hand } from 'lucide-react';
import { Button } from './Button';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDecision: (consent: boolean) => Promise<void> | void;
    isSubmitting?: boolean;
}

type ModalState = 'initial' | 'accepted' | 'declined';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onDecision, isSubmitting = false }) => {
    const { t: COPY } = useTranslation();
    const [state, setState] = useState<ModalState>('initial');

    const handleResponse = async (accepted: boolean) => {
        // 1. Call parent handler (API submit)
        await onDecision(accepted);

        // 2. Update local UI state
        setState(accepted ? 'accepted' : 'declined');

        // 3. Create a timeout to close the modal after showing the message
        setTimeout(() => {
            onClose();
            // Reset state after animation completes (approx)
            setTimeout(() => setState('initial'), 500);
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-dark-950/95 backdrop-blur-lg"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-dark-950 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Background Decorations */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative z-10 text-center py-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">
                                {COPY.feedbackModal.thanks}
                            </h3>
                            <p className="text-lg text-slate-200 mb-8 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: COPY.feedbackModal.purpose }} />

                            <Button
                                onClick={onClose}
                                variant="primary"
                                className="w-full justify-center text-base py-3.5 shadow-lg shadow-brand-500/20 mt-4"
                            >
                                ¡Entendido!
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
