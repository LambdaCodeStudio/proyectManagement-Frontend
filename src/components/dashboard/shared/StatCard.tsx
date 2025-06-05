import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
  action?: () => void;
  actionText?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon: Icon,
  color,
  action,
  actionText,
  loading = false
}) => {
  const changeColor = changeType === 'positive' ? 'text-green-400' : 
                     changeType === 'negative' ? 'text-red-400' : 'text-gray-400';

  if (loading) {
    return (
      <div className="gradient-card rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-white/20"></div>
          {action && actionText && (
            <div className="w-16 h-4 bg-white/10 rounded"></div>
          )}
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-8 bg-white/20 rounded w-1/2"></div>
          {subtitle && <div className="h-3 bg-white/10 rounded w-2/3"></div>}
          {change && <div className="h-3 bg-white/10 rounded w-1/3"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-xl p-6 card-hover group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {action && actionText && (
          <button
            onClick={action}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 opacity-0 group-hover:opacity-100"
          >
            <span>{actionText}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 counter">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
        {change && (
          <p className={`text-sm mt-2 ${changeColor} flex items-center space-x-1`}>
            <span>{change}</span>
            {changeType === 'positive' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {changeType === 'negative' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </p>
        )}
      </div>
    </div>
  );
};