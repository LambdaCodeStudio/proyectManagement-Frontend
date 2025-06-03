import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface DashboardStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
}

export const DashboardMain: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await api.get('/dashboard/stats');
        // setStats(response.data);
        
        // For now, using mock data
        setTimeout(() => {
          setStats({
            totalPayments: 24,
            pendingPayments: 5,
            completedPayments: 19
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return null; // The loading state is handled by the skeleton in the Astro file
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard 
          title="Total de Pagos" 
          value={stats.totalPayments} 
          description="Pagos registrados en el sistema" 
          icon="📊"
        />
        <StatCard 
          title="Pagos Pendientes" 
          value={stats.pendingPayments} 
          description="Pagos que requieren atención" 
          icon="⏳"
        />
        <StatCard 
          title="Pagos Completados" 
          value={stats.completedPayments} 
          description="Pagos procesados exitosamente" 
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pagos Recientes</h3>
          <div className="space-y-3">
            <RecentPaymentItem 
              name="Juan Pérez" 
              amount={150.00} 
              date="2025-06-01" 
              status="completed" 
            />
            <RecentPaymentItem 
              name="María García" 
              amount={200.00} 
              date="2025-05-30" 
              status="pending" 
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <ActivityItem 
              message="Pago #1234 procesado" 
              time="Hace 2 horas" 
            />
            <ActivityItem 
              message="Nuevo cliente registrado" 
              time="Hace 1 día" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

interface RecentPaymentItemProps {
  name: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const RecentPaymentItem: React.FC<RecentPaymentItemProps> = ({ name, amount, date, status }) => {
  const statusClasses = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-medium">${amount.toFixed(2)}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status]}`}>
          {status === 'completed' ? 'Completado' : status === 'pending' ? 'Pendiente' : 'Fallido'}
        </span>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  message: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ message, time }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <p className="font-medium text-gray-900">{message}</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  );
};
