import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'debt' | 'payment';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'debt',
  size = 'sm'
}) => {
  const getStatusConfig = (status: string, type: string) => {
    if (type === 'debt') {
      switch (status) {
        case 'paid':
          return { color: 'text-green-400 bg-green-400/20', text: 'Pagada' };
        case 'overdue':
          return { color: 'text-red-400 bg-red-400/20', text: 'Vencida' };
        case 'processing':
          return { color: 'text-blue-400 bg-blue-400/20', text: 'Procesando' };
        case 'cancelled':
          return { color: 'text-gray-400 bg-gray-400/20', text: 'Cancelada' };
        default:
          return { color: 'text-yellow-400 bg-yellow-400/20', text: 'Pendiente' };
      }
    } else {
      switch (status) {
        case 'approved':
          return { color: 'text-green-400 bg-green-400/20', text: 'Aprobado' };
        case 'rejected':
          return { color: 'text-red-400 bg-red-400/20', text: 'Rechazado' };
        case 'cancelled':
          return { color: 'text-gray-400 bg-gray-400/20', text: 'Cancelado' };
        case 'refunded':
          return { color: 'text-purple-400 bg-purple-400/20', text: 'Reembolsado' };
        case 'processing':
          return { color: 'text-blue-400 bg-blue-400/20', text: 'Procesando' };
        default:
          return { color: 'text-yellow-400 bg-yellow-400/20', text: 'Pendiente' };
      }
    }
  };

  const { color, text } = getStatusConfig(status, type);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClasses}`}>
      {text}
    </span>
  );
};