import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { StatCard } from './StatCard';
import { DataTable } from './DataTable';
import { LoadingSpinner } from './LoadingSpinner';
import { StatusBadge } from './StatusBadge';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 rounded-lg gradient-purple hover:opacity-90 transition-opacity text-white font-medium"
        >
          {action.text}
        </button>
      )}
    </div>
  );
};

export default {
  StatCard,
  DataTable,
  LoadingSpinner,
  StatusBadge,
  EmptyState
};