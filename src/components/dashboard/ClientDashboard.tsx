import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDebts } from '../../hooks/useDebts';
import { usePayments } from '../../hooks/usePayments';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  ArrowRight,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  action?: () => void;
  actionText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, action, actionText }) => {
  return (
    <div className="gradient-card rounded-xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {action && actionText && (
          <button
            onClick={action}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

interface DebtItemProps {
  debt: any;
  onPayClick: (debtId: string) => void;
  onViewClick: (debtId: string) => void;
}

const DebtItem: React.FC<DebtItemProps> = ({ debt, onPayClick, onViewClick }) => {
  const isOverdue = new Date(debt.dueDate) < new Date() && debt.status === 'pending';
  const daysUntilDue = Math.ceil((new Date(debt.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    switch (debt.status) {
      case 'paid': return 'text-green-400 bg-green-400/20';
      case 'overdue': return 'text-red-400 bg-red-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-yellow-400 bg-yellow-400/20';
    }
  };

  const getStatusText = () => {
    switch (debt.status) {
      case 'paid': return 'Pagada';
      case 'overdue': return 'Vencida';
      case 'processing': return 'Procesando';
      default: return 'Pendiente';
    }
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${
      isOverdue ? 'border-red-400/30 bg-red-400/5' : 'border-white/20 bg-white/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-white font-medium">{debt.description}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>${debt.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(debt.dueDate).toLocaleDateString()}</span>
            </div>
            {debt.status === 'pending' && (
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400' : ''}`}>
                <Clock className="w-4 h-4" />
                <span>
                  {isOverdue ? `${Math.abs(daysUntilDue)} días vencida` : `${daysUntilDue} días restantes`}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewClick(debt._id)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {debt.status === 'pending' && (
            <button
              onClick={() => onPayClick(debt._id)}
              className="px-4 py-2 rounded-lg gradient-purple hover:opacity-90 transition-opacity text-white text-sm font-medium"
            >
              Pagar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface PaymentItemProps {
  payment: any;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ payment }) => {
  const getStatusColor = () => {
    switch (payment.status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusText = () => {
    switch (payment.status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      default: return payment.status;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <CreditCard className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm text-white">Pago #{payment._id.slice(-8)}</p>
          <p className="text-xs text-gray-400">
            {new Date(payment.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium text-white">${payment.amount.toLocaleString()}</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { debts, summary, loading: debtsLoading, getOverdueDebts, getUpcomingDebts } = useDebts();
  const { processPayment, getPaymentHistory, loading: paymentsLoading } = usePayments();
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    // Cargar historial de pagos recientes
    getPaymentHistory({ limit: 5 }).then(history => {
      setRecentPayments(history.payments || []);
    }).catch(console.error);
  }, []);

  const handlePayDebt = async (debtId: string) => {
    try {
      await processPayment(debtId);
    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago: ' + error.message);
    }
  };

  const handleViewDebt = (debtId: string) => {
    // Implementar navegación a detalle de deuda
    console.log('Ver deuda:', debtId);
  };

  const overdueDebts = getOverdueDebts();
  const upcomingDebts = getUpcomingDebts();
  const pendingDebts = debts.filter(debt => debt.status === 'pending');
  const paidDebts = debts.filter(debt => debt.status === 'paid');

  return (
    <div className="space-y-6">
      {/* Estadísticas del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Deudas Pendientes"
          value={pendingDebts.length}
          subtitle={`$${pendingDebts.reduce((sum, debt) => sum + debt.amount, 0).toLocaleString()}`}
          icon={AlertTriangle}
          color="bg-orange-600"
          action={() => console.log('Ver deudas pendientes')}
          actionText="Ver todas"
        />
        
        <StatCard
          title="Deudas Vencidas"
          value={overdueDebts.length}
          subtitle={overdueDebts.length > 0 ? "¡Requiere atención!" : "¡Excelente!"}
          icon={AlertCircle}
          color={overdueDebts.length > 0 ? "bg-red-600" : "bg-green-600"}
        />
        
        <StatCard
          title="Próximos Vencimientos"
          value={upcomingDebts.length}
          subtitle="Próximos 7 días"
          icon={Calendar}
          color="bg-blue-600"
        />
        
        <StatCard
          title="Deudas Pagadas"
          value={paidDebts.length}
          subtitle="Este mes"
          icon={CheckCircle}
          color="bg-green-600"
        />
      </div>

      {/* Alertas y Notificaciones */}
      {(overdueDebts.length > 0 || upcomingDebts.length > 0) && (
        <div className="gradient-card rounded-xl p-6 border-l-4 border-orange-500">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Atención Requerida</h3>
              {overdueDebts.length > 0 && (
                <p className="text-sm text-red-300 mb-1">
                  • Tienes {overdueDebts.length} deuda(s) vencida(s) que requieren pago inmediato
                </p>
              )}
              {upcomingDebts.length > 0 && (
                <p className="text-sm text-yellow-300">
                  • {upcomingDebts.length} deuda(s) vencen en los próximos 7 días
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deudas Activas */}
        <div className="gradient-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Mis Deudas</h2>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Exportar"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {debtsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">¡Excelente!</p>
              <p className="text-gray-400 text-sm">No tienes deudas pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Priorizar deudas vencidas */}
              {overdueDebts.map((debt) => (
                <DebtItem
                  key={debt._id}
                  debt={debt}
                  onPayClick={handlePayDebt}
                  onViewClick={handleViewDebt}
                />
              ))}
              {/* Luego deudas próximas a vencer */}
              {upcomingDebts.map((debt) => (
                <DebtItem
                  key={debt._id}
                  debt={debt}
                  onPayClick={handlePayDebt}
                  onViewClick={handleViewDebt}
                />
              ))}
              {/* Finalmente otras deudas pendientes */}
              {pendingDebts
                .filter(debt => !overdueDebts.includes(debt) && !upcomingDebts.includes(debt))
                .slice(0, 3)
                .map((debt) => (
                <DebtItem
                  key={debt._id}
                  debt={debt}
                  onPayClick={handlePayDebt}
                  onViewClick={handleViewDebt}
                />
              ))}
            </div>
          )}
        </div>

        {/* Historial de Pagos */}
        <div className="gradient-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Pagos Recientes</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Ver historial completo
            </button>
          </div>
          
          {paymentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-white font-medium">Sin pagos recientes</p>
              <p className="text-gray-400 text-sm">Tus pagos aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <PaymentItem key={payment._id} payment={payment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumen Financiero Personal */}
      <div className="gradient-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Mi Resumen Financiero</h2>
          <div className="flex items-center space-x-2">
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white">
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full gradient-purple flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              ${summary.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Adeudado</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-600/20 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              ${recentPayments
                .filter(p => p.status === 'approved')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Pagado Este Mes</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-600/20 flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {recentPayments.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-400">Pagos Pendientes</p>
          </div>
        </div>
      </div>
    </div>
  );
};