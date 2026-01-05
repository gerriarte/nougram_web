import React, { useState } from 'react';
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
                    className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
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

                    <div className="relative z-10 text-center">

                        {state === 'initial' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="mx-auto w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare className="w-6 h-6 text-brand-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    ¡Gracias por unirte!
                                </h3>
                                <p className="text-slate-300 mb-8 leading-relaxed">
                                    Este registro tiene como objetivo que puedas tener <strong>acceso preferencial</strong> al Cotizador Nougram a cambio de tu <strong>feedback sincero</strong>.
                                </p>

                                <p className="text-sm text-slate-400 font-medium mb-6">
                                    ¿Estarías dispuesto a darnos tu opinión?
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleResponse(false)}
                                        className={`px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all font-medium text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        No, gracias
                                    </button>
                                    <Button
                                        onClick={() => handleResponse(true)}
                                        variant="primary"
                                        className={`w-full justify-center ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Sí, cuenta conmigo'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {state === 'accepted' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8"
                            >
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <Check className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    ¡Gracias!
                                </h3>
                                <p className="text-slate-300">
                                    Te contactaremos pronto para conocer tu opinión.
                                </p>
                            </motion.div>
                        )}

                        {state === 'declined' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8"
                            >
                                <div className="mx-auto w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
                                    <Hand className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-lg text-slate-300 font-medium">
                                    Ya estás agregado a nuestra lista de espera.
                                </p>
                            </motion.div>
                        )}

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
