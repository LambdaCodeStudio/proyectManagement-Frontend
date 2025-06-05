// src/components/dashboard/AdminDashboard.tsx (Actualizado con notificaciones)
import React, { useState, useEffect } from 'react';
import { useDebts } from '../../hooks/useDebts';
import { usePayments } from '../../hooks/usePayments';
import { useAppNotifications } from '../common/NotificationSystem';
import { DebtManagement } from '../admin/DebtManagement';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Activity
} from 'lucide-react';
import { StatCard } from './shared/StatCard';
import { formatCurrency, formatRelativeTime } from '../../utils/helpers';

interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, title, description, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-3 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 card-hover w-full text-left"
    >
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </button>
  );
};

interface RecentActivityItemProps {
  type: 'debt' | 'payment' | 'user';
  description: string;
  amount?: number;
  time: string;
  status?: string;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({ type, description, amount, time, status }) => {
  const getIcon = () => {
    switch (type) {
      case 'debt': return <CreditCard className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <p className="text-sm text-white">{description}</p>
          <p className="text-xs text-gray-400">{time}</p>
        </div>
      </div>
      <div className="text-right">
        {amount && (
          <p className="text-sm font-medium text-white">${amount.toLocaleString()}</p>
        )}
        {status && (
          <p className={`text-xs ${getStatusColor()}`}>
            {status === 'approved' ? 'Aprobado' : 
             status === 'pending' ? 'Pendiente' : 
             status === 'rejected' ? 'Rechazado' : status}
          </p>
        )}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { debts, stats, loading: debtsLoading, fetchDebts, fetchStats } = useDebts();
  const { getPaymentHistory, loading: paymentsLoading } = usePayments();
  const notifications = useAppNotifications();
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'debts' | 'users' | 'reports'>('overview');

  useEffect(() => {
    // Cargar datos iniciales
    fetchStats();
    fetchDebts({ limit: 5 });
    
    // Cargar pagos recientes
    getPaymentHistory({ limit: 5 }).then(history => {
      setRecentPayments(history.payments || []);
    }).catch(console.error);
  }, []);

  const handleCreateDebt = () => {
    setCurrentView('debts');
    notifications.info('Crear Deuda', 'Accediendo al módulo de gestión de deudas...');
  };

  const handleManageUsers = () => {
    notifications.info('Gestión de Usuarios', 'Funcionalidad en desarrollo...');
  };

  const handleExportReports = () => {
    notifications.info('Exportar Reportes', 'Generando reporte de datos...');
    // Simular descarga
    setTimeout(() => {
      notifications.success('Reporte Generado', 'El reporte ha sido descargado exitosamente.');
    }, 2000);
  };

  const handleViewAnalytics = () => {
    notifications.info('Analytics', 'Cargando panel de analíticas...');
  };

  const totalDebts = stats?.totalDebts || 0;
  const totalAmount = stats?.totalAmount || 0;
  const upcomingDebts = stats?.upcomingDebts || 0;
  
  // Calcular estadísticas de pagos
  const approvedPayments = recentPayments.filter(p => p.status === 'approved').length;
  const pendingPayments = recentPayments.filter(p => p.status === 'pending').length;

  if (currentView === 'debts') {
    return <DebtManagement />;
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Deudas"
          value={totalDebts}
          change="+12% este mes"
          changeType="positive"
          icon={CreditCard}
          color="gradient-purple"
          loading={debtsLoading}
        />
        <StatCard
          title="Monto Total"
          value={formatCurrency(totalAmount)}
          change="+8% este mes"
          changeType="positive"
          icon={DollarSign}
          color="bg-blue-600"
          loading={debtsLoading}
        />
        <StatCard
          title="Pagos Procesados"
          value={approvedPayments}
          change="+15% esta semana"
          changeType="positive"
          icon={CheckCircle}
          color="bg-green-600"
          loading={paymentsLoading}
        />
        <StatCard
          title="Vencimientos"
          value={upcomingDebts}
          subtitle="Próximos 7 días"
          icon={AlertTriangle}
          color="bg-orange-600"
          loading={debtsLoading}
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="gradient-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Acciones Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={Plus}
            title="Crear Deuda"
            description="Asignar nueva deuda a usuario"
            onClick={handleCreateDebt}
            color="bg-blue-600"
          />
          
          <QuickAction
            icon={Users}
            title="Gestionar Usuarios"
            description="Ver y editar usuarios"
            onClick={handleManageUsers}
            color="bg-green-600"
          />
          
          <QuickAction
            icon={Download}
            title="Exportar Reportes"
            description="Descargar datos del sistema"
            onClick={handleExportReports}
            color="bg-purple-600"
          />

          <QuickAction
            icon={BarChart3}
            title="Ver Analíticas"
            description="Dashboard de métricas avanzadas"
            onClick={handleViewAnalytics}
            color="bg-orange-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deudas Recientes */}
        <div className="gradient-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Deudas Recientes</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentView('debts')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ver todas
              </button>
            </div>
          </div>
          
          {debtsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {debts.slice(0, 5).map((debt) => (
                <div key={debt._id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{debt.description}</p>
                      <p className="text-xs text-gray-400">
                        Vence: {new Date(debt.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatCurrency(debt.amount)}</p>
                      <p className={`text-xs ${
                        debt.status === 'paid' ? 'text-green-400' : 
                        debt.status === 'overdue' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {debt.status === 'paid' ? 'Pagada' : 
                         debt.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10 transition-colors">
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className="gradient-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-3">
            <RecentActivityItem
              type="payment"
              description="Pago procesado exitosamente"
              amount={1500}
              time="Hace 2 horas"
              status="approved"
            />
            <RecentActivityItem
              type="debt"
              description="Nueva deuda creada"
              amount={800}
              time="Hace 4 horas"
              status="pending"
            />
            <RecentActivityItem
              type="user"
              description="Nuevo usuario registrado"
              time="Hace 6 horas"
            />
            <RecentActivityItem
              type="payment"
              description="Pago rechazado"
              amount={2200}
              time="Hace 1 día"
              status="rejected"
            />
            <RecentActivityItem
              type="debt"
              description="Deuda marcada como vencida"
              amount={500}
              time="Hace 1 día"
              status="overdue"
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Resumen */}
      <div className="gradient-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Resumen Financiero</h2>
          <div className="flex items-center space-x-2">
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 3 meses</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-600/20 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">68%</p>
            <p className="text-sm text-gray-400">Pagos Exitosos</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-600/20 flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">24%</p>
            <p className="text-sm text-gray-400">Pagos Pendientes</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-600/20 flex items-center justify-center mb-3">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">8%</p>
            <p className="text-sm text-gray-400">Pagos Fallidos</p>
          </div>
        </div>
      </div>
    </div>
  );
};
