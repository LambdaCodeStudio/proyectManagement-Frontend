import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Cargando...',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black/50 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full gradient-purple animate-pulse`}></div>
          <div className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-2 border-white border-t-transparent animate-spin`}></div>
        </div>
        {text && (
          <p className="text-sm text-gray-300 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};