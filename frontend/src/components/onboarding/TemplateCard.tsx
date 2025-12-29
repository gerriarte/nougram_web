"use client";

import { IndustryTemplate } from "@/lib/types/templates";
import { Palette, Code, Megaphone, Briefcase, Video, Users, Package, DollarSign, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TemplateCardProps {
  template: IndustryTemplate;
  isSelected: boolean;
  onSelect: (template: IndustryTemplate) => void;
  onViewDetails: (template: IndustryTemplate) => void;
  isRecommended?: boolean;
}

export function TemplateCard({ template, isSelected, onSelect, onViewDetails, isRecommended }: TemplateCardProps) {
  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-8 h-8 text-white" />;
      case 'Code': return <Code className="w-8 h-8 text-white" />;
      case 'Megaphone': return <Megaphone className="w-8 h-8 text-white" />;
      case 'Briefcase': return <Briefcase className="w-8 h-8 text-white" />;
      case 'Video': return <Video className="w-8 h-8 text-white" />;
      default: return <Briefcase className="w-8 h-8 text-white" />;
    }
  };

  const rolesCount = template.suggested_roles?.length || 0;
  const servicesCount = template.suggested_services?.length || 0;
  const costsCount = template.suggested_fixed_costs?.length || 0;

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
        <div className="absolute top-4 right-4 bg-warning-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10 shadow-md">
          Recommended
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 bg-primary-500 text-white p-1.5 rounded-full z-10 animate-in fade-in zoom-in duration-200 shadow-md">
          <Check className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 shadow-md",
          template.color || "bg-primary-500"
        )}>
          {getIcon(template.icon)}
        </div>

        <h3 className="text-xl font-semibold text-grey-900 mb-2">{template.name}</h3>
        <p className="text-sm text-grey-600 line-clamp-2 mb-4 flex-grow">
          {template.description || "No description available"}
        </p>

        {/* Quick Stats */}
        <div className="bg-grey-50 rounded-lg p-4 space-y-2.5 mb-4 border border-grey-200">
          <div className="flex items-center gap-2.5 text-sm text-grey-700">
            <Users className="w-4 h-4 text-grey-500" />
            <span className="font-medium">{rolesCount} Team Roles</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-grey-700">
            <Package className="w-4 h-4 text-grey-500" />
            <span className="font-medium">{servicesCount} Services</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-grey-700">
            <DollarSign className="w-4 h-4 text-grey-500" />
            <span className="font-medium">{costsCount} Fixed Costs</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className={cn(
            "w-full mt-auto h-10",
            isSelected 
              ? "border-primary-500 text-primary-700 bg-primary-50 hover:bg-primary-100 font-medium" 
              : "border-grey-300 text-grey-700 hover:bg-grey-50"
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

