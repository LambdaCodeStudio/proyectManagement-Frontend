// src/components/admin/DebtManagement.tsx
import React, { useState, useEffect } from 'react';
import { useDebts } from '../../hooks/useDebts';
import { DataTable } from '../dashboard/shared/DataTable';
import { StatCard } from '../dashboard/shared/StatCard';
import { StatusBadge } from '../dashboard/shared/StatusBadge';
import { LoadingSpinner } from '../dashboard/shared/LoadingSpinner';
import { EmptyState } from '../dashboard/shared/EmptyState';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';
import type { Debt, TableColumn } from '../../types';

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CreateDebtModal: React.FC<CreateDebtModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    userId: '',
    userEmail: '',
    description: '',
    amount: '',
    currency: 'ARS',
    dueDate: '',
    category: 'other',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.userEmail || !formData.description || !formData.amount || !formData.dueDate) {
      setError('Todos los campos requeridos deben estar completos');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('El monto debe ser un número válido mayor a 0');
      return;
    }

    const dueDate = new Date(formData.dueDate);
    if (dueDate <= new Date()) {
      setError('La fecha de vencimiento debe ser futura');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount,
        dueDate: formData.dueDate
      });
      
      // Reset form
      setFormData({
        userId: '',
        userEmail: '',
        description: '',
        amount: '',
        currency: 'ARS',
        dueDate: '',
        category: 'other',
        notes: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la deuda');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="gradient-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Crear Nueva Deuda</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email del Usuario *
            </label>
            <input
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="usuario@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Descripción de la deuda"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monto *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="service">Servicio</option>
              <option value="product">Producto</option>
              <option value="subscription">Suscripción</option>
              <option value="fine">Multa</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Notas adicionales..."
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 gradient-purple rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creando...
                </>
              ) : (
                'Crear Deuda'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DebtManagement: React.FC = () => {
  const { debts, stats, loading, fetchDebts, sendReminder } = useDebts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleCreateDebt = async (debtData: any) => {
    try {
      // Aquí implementarías la llamada a la API para crear la deuda
      console.log('Creating debt:', debtData);
      // await createDebt(debtData);
      await fetchDebts(); // Refresh the list
    } catch (error) {
      throw error;
    }
  };

  const handleSendReminder = async (debtId: string) => {
    try {
      await sendReminder(debtId);
      alert('Recordatorio enviado exitosamente');
    } catch (error: any) {
      alert('Error al enviar recordatorio: ' + error.message);
    }
  };

  const handleViewDebt = (debt: Debt) => {
    setSelectedDebt(debt);
  };

  const handleEditDebt = (debt: Debt) => {
    console.log('Edit debt:', debt._id);
  };

  const handleDeleteDebt = (debt: Debt) => {
    if (confirm('¿Está seguro de que desea eliminar esta deuda?')) {
      console.log('Delete debt:', debt._id);
    }
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: TableColumn<Debt>[] = [
    {
      key: '_id',
      title: 'ID',
      render: (value) => `#${value.slice(-8)}`,
      width: '100px'
    },
    {
      key: 'description',
      title: 'Descripción',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-white font-medium truncate">{value}</p>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Monto',
      render: (value, debt) => (
        <span className="font-medium text-white">
          {formatCurrency(value, debt.currency as any)}
        </span>
      ),
      width: '120px'
    },
    {
      key: 'status',
      title: 'Estado',
      render: (value) => <StatusBadge status={value} type="debt" />,
      width: '120px'
    },
    {
      key: 'dueDate',
      title: 'Vencimiento',
      render: (value) => (
        <div className="text-sm">
          <p className="text-white">{formatDate(value)}</p>
          <p className="text-gray-400">{formatRelativeTime(value)}</p>
        </div>
      ),
      width: '140px'
    },
    {
      key: 'createdAt',
      title: 'Creada',
      render: (value) => formatDate(value),
      width: '120px'
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, debt) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDebt(debt)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditDebt(debt)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          {debt.status === 'pending' && (
            <button
              onClick={() => handleSendReminder(debt._id)}
              className="p-1 rounded hover:bg-white/10 transition-colors text-blue-400"
              title="Enviar recordatorio"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteDebt(debt)}
            className="p-1 rounded hover:bg-white/10 transition-colors text-red-400"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '150px'
    }
  ];

  const totalDebts = stats?.totalDebts || 0;
  const totalAmount = stats?.totalAmount || 0;
  const overdueCount = stats?.statusBreakdown?.find(s => s.status === 'overdue')?.count || 0;
  const paidCount = stats?.statusBreakdown?.find(s => s.status === 'paid')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Deudas"
          value={totalDebts}
          icon={CreditCard}
          color="gradient-purple"
          loading={loading}
        />
        <StatCard
          title="Monto Total"
          value={formatCurrency(totalAmount)}
          icon={CheckCircle}
          color="bg-blue-600"
          loading={loading}
        />
        <StatCard
          title="Deudas Vencidas"
          value={overdueCount}
          icon={AlertTriangle}
          color="bg-red-600"
          loading={loading}
        />
        <StatCard
          title="Deudas Pagadas"
          value={paidCount}
          icon={CheckCircle}
          color="bg-green-600"
          loading={loading}
        />
      </div>

      {/* Controles y Filtros */}
      <div className="gradient-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Gestión de Deudas</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 gradient-purple rounded-lg hover:opacity-90 transition-opacity text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Deuda</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar deudas..."
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="processing">Procesando</option>
              <option value="paid">Pagadas</option>
              <option value="overdue">Vencidas</option>
              <option value="cancelled">Canceladas</option>
            </select>

            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Deudas */}
      <DataTable
        data={filteredDebts}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron deudas"
        onRowClick={handleViewDebt}
      />

      {/* Modal de Crear Deuda */}
      <CreateDebtModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDebt}
      />

      {/* Modal de Detalle de Deuda */}
      {selectedDebt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="gradient-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Detalles de la Deuda</h2>
              <button
                onClick={() => setSelectedDebt(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ID</label>
                  <p className="text-white">#{selectedDebt._id.slice(-8)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                  <StatusBadge status={selectedDebt.status} type="debt" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <p className="text-white">{selectedDebt.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Monto</label>
                  <p className="text-white font-semibold">
                    {formatCurrency(selectedDebt.amount, selectedDebt.currency as any)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Vencimiento</label>
                  <p className="text-white">{formatDate(selectedDebt.dueDate, 'LONG')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                  <p className="text-white capitalize">{selectedDebt.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Recordatorios</label>
                  <p className="text-white">{selectedDebt.remindersSent || 0} enviados</p>
                </div>
              </div>

              {selectedDebt.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
                  <p className="text-white">{selectedDebt.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Creada</label>
                  <p className="text-white">{formatDate(selectedDebt.createdAt, 'LONG')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Actualizada</label>
                  <p className="text-white">{formatDate(selectedDebt.updatedAt, 'LONG')}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-white/10 mt-6">
              {selectedDebt.status === 'pending' && (
                <button
                  onClick={() => handleSendReminder(selectedDebt._id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-white"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Recordatorio</span>
                </button>
              )}
              <button
                onClick={() => handleEditDebt(selectedDebt)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtManagement;