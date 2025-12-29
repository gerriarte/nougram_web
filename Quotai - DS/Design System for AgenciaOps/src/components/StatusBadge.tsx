import { ProjectStatus } from '../lib/types';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-grey-100 text-grey-800' },
    sent: { label: 'Sent', color: 'bg-info-50 text-info-700' },
    won: { label: 'Won', color: 'bg-success-50 text-success-700' },
    lost: { label: 'Lost', color: 'bg-error-50 text-error-700' },
    archived: { label: 'Archived', color: 'bg-grey-100 text-grey-600' }
  };

  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full ${config.color} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
