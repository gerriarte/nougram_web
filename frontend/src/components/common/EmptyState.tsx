import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-grey-100 mb-4">
        <Icon className="w-8 h-8 text-grey-400" />
      </div>
      <h3 className="text-lg font-semibold text-grey-900 mb-2">{title}</h3>
      <p className="text-grey-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-primary-500 hover:bg-primary-700 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

