import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
}

export function KPICard({ title, value, description, icon: Icon, change }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-grey-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-grey-50">
            <Icon className="w-6 h-6 text-grey-600" />
          </div>
        )}
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            change.trend === 'up' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
          }`}>
            {change.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <p className="text-grey-600 mb-1 text-sm">{title}</p>
        <div className="text-3xl font-semibold text-grey-900">{value}</div>
        {description && (
          <p className="text-grey-500 text-xs mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}










