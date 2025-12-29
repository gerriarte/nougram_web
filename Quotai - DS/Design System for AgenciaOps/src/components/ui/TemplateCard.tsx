import { IndustryTemplate } from '../../lib/types';
import { Palette, Code, Megaphone, Briefcase, Video, Users, Package, DollarSign, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface TemplateCardProps {
    template: IndustryTemplate;
    isSelected: boolean;
    onSelect: (template: IndustryTemplate) => void;
    onViewDetails: (template: IndustryTemplate) => void;
    isRecommended?: boolean;
}

export function TemplateCard({ template, isSelected, onSelect, onViewDetails, isRecommended }: TemplateCardProps) {
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Palette': return <Palette className="w-8 h-8 text-white" />;
            case 'Code': return <Code className="w-8 h-8 text-white" />;
            case 'Megaphone': return <Megaphone className="w-8 h-8 text-white" />;
            case 'Briefcase': return <Briefcase className="w-8 h-8 text-white" />;
            case 'Video': return <Video className="w-8 h-8 text-white" />;
            default: return <Briefcase className="w-8 h-8 text-white" />;
        }
    };

    return (
        <div
            onClick={() => onSelect(template)}
            className={cn(
                "relative bg-white rounded-xl border transition-all duration-200 cursor-pointer group flex flex-col h-full",
                isSelected
                    ? "border-primary-500 shadow-md bg-primary-50/5"
                    : "border-grey-200 hover:border-grey-300 hover:shadow-lg"
            )}
        >
            {/* Recommended Badge */}
            {isRecommended && (
                <div className="absolute top-4 right-4 bg-warning-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                    Recommended
                </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-4 right-4 bg-primary-500 text-white p-1 rounded-full z-10 animate-in fade-in zoom-in duration-200">
                    <Check className="w-3 h-3" />
                </div>
            )}

            <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105",
                    template.color
                )}>
                    {getIcon(template.icon)}
                </div>

                <h3 className="text-xl font-medium text-grey-900 mb-2">{template.name}</h3>
                <p className="text-sm text-grey-600 line-clamp-2 mb-4 flex-grow">
                    {template.description}
                </p>

                {/* Quick Stats */}
                <div className="bg-grey-50 rounded-lg p-4 space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-grey-700">
                        <Users className="w-4 h-4 text-grey-500" />
                        <span>{template.suggestedRoles.length} Team Roles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-grey-700">
                        <Package className="w-4 h-4 text-grey-500" />
                        <span>{template.suggestedServices.length} Services</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-grey-700">
                        <DollarSign className="w-4 h-4 text-grey-500" />
                        <span>{template.suggestedCompanyCosts.length} Fixed Costs</span>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    variant="outline"
                    className={cn(
                        "w-full mt-auto",
                        isSelected ? "border-primary-500 text-primary-600 bg-primary-50" : "text-grey-600"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(template);
                    }}
                >
                    View Details
                </Button>
            </div>
        </div>
    );
}
