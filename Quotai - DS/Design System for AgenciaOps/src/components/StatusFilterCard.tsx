interface StatusFilterCardProps {
  title: string;
  count: number;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

export function StatusFilterCard({ title, count, description, isActive, onClick }: StatusFilterCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-white rounded-xl border p-6 text-left transition-all
        ${isActive 
          ? 'border-primary-500 border-2' 
          : 'border-grey-200 hover:shadow-lg'
        }
      `}
      style={{ boxShadow: isActive ? 'none' : 'var(--elevation-2)' }}
    >
      <p className="text-grey-600 mb-2">{title}</p>
      <div className="text-4xl text-grey-900 mb-1">{count}</div>
      <p className="text-grey-500 text-xs">{description}</p>
    </button>
  );
}
