"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './dialog';
import { Button } from './button';
import { HelpCircle, Info } from 'lucide-react';
import { ReactNode } from 'react';

interface PageGuideProps {
    title: string;
    description?: string;
    children?: ReactNode;
}

export function PageGuide({ title, description, children }: PageGuideProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-grey-500 hover:text-primary-600 hover:bg-primary-50">
                    <HelpCircle className="w-5 h-5" />
                    <span className="sr-only">Help</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Info className="w-5 h-5 text-primary-600" />
                        </div>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </div>
                    {description && (
                        <DialogDescription className="text-grey-600 text-base">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}










