import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Project } from '../../lib/types';
import { Calendar, Mail, Building2, DollarSign, Clock } from 'lucide-react';

interface ViewQuoteDialogProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

export function ViewQuoteDialog({ project, isOpen, onClose, onEdit }: ViewQuoteDialogProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-8">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-grey-900">{project.name}</DialogTitle>
                            <p className="text-sm text-grey-500 mt-1">ID: {project.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === 'won' ? 'bg-success-50 text-success-700' :
                                project.status === 'sent' ? 'bg-blue-50 text-blue-700' :
                                    project.status === 'lost' ? 'bg-error-50 text-error-700' :
                                        'bg-grey-100 text-grey-700'
                            }`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Client Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-grey-900 uppercase tracking-wider">Client Details</h4>
                        <div className="bg-grey-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-grey-500" />
                                <span className="text-grey-900 font-medium">{project.client}</span>
                            </div>
                            {project.clientEmail && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-grey-500" />
                                    <span className="text-grey-700">{project.clientEmail}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-grey-500" />
                                <span className="text-grey-700">Created on {formatDate(project.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-grey-900 uppercase tracking-wider">Financial Summary</h4>
                        <div className="bg-grey-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-grey-600">Subtotal</span>
                                <span className="text-grey-900 font-medium">${project.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-grey-600">Taxes</span>
                                <span className="text-grey-900 font-medium">${project.taxes.toLocaleString()}</span>
                            </div>
                            <div className="pt-3 border-t border-grey-200 flex justify-between items-center">
                                <span className="text-grey-900 font-bold">Total</span>
                                <span className="text-xl font-bold text-primary-600">${project.total.toLocaleString()}</span>
                            </div>
                            {project.margin > 0 && (
                                <div className="pt-2 flex items-center justify-between text-sm">
                                    <span className="text-grey-600">Estimated Margin</span>
                                    <span className={`font-medium ${project.margin >= 40 ? 'text-success-600' :
                                            project.margin >= 30 ? 'text-warning-600' :
                                                'text-error-600'
                                        }`}>
                                        {project.margin}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Services List */}
                {project.services && project.services.length > 0 && (
                    <div className="space-y-4 mt-2">
                        <h4 className="text-sm font-medium text-grey-900 uppercase tracking-wider">Included Services</h4>
                        <div className="border border-grey-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-grey-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-grey-600 font-medium">Service</th>
                                        <th className="px-4 py-2 text-right text-grey-600 font-medium">Hours</th>
                                        <th className="px-4 py-2 text-right text-grey-600 font-medium">Rate</th>
                                        <th className="px-4 py-2 text-right text-grey-600 font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-grey-200">
                                    {project.services.map((service) => (
                                        <tr key={service.id}>
                                            <td className="px-4 py-2 text-grey-900">{service.serviceName}</td>
                                            <td className="px-4 py-2 text-right text-grey-700">{service.hours}</td>
                                            <td className="px-4 py-2 text-right text-grey-700">${service.hourlyRate}</td>
                                            <td className="px-4 py-2 text-right text-grey-900 font-medium">
                                                ${(service.hours * service.hourlyRate).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={() => { onClose(); onEdit(); }} className="bg-primary-500 hover:bg-primary-700 text-white">
                        Edit Quote
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
