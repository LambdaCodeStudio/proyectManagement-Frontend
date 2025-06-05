import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  Users, 
  Eye, 
  CheckCircle, 
  Edit3, 
  X, 
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  TrendingUp,
  FileText,
  ChevronRight,
  RefreshCw,
  Download,
  Plus,
  Save,
  Trash2,
  XCircle,
  Settings,
  MoreVertical,
  UserPlus,
  Building,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

import apiService from '../../services/api';
import { useAuth } from '../../hooks/useAuth'; // CORREGIDO: Usar el hook real

interface Debt {
  _id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'overdue';
  dueDate: string;
  category: string;
  notes?: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  canBePaid: boolean;
  totalPaid: number;
  createdAt: string;
  remindersSent?: number;
}

interface DebtsSummary {
  totalAmount: number;
  totalDebts: number;
  pendingAmount: number;
  pendingDebts: number;
  overdueAmount: number;
  overdueDebts: number;
  paidAmount: number;
  paidDebts: number;
  currency: string;
}

interface User {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
}

interface CreateDebtForm {
  userId: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  category: string;
  notes: string;
}

interface EditDebtForm {
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  notes: string;
  status: string;
}

export const DebtsMain: React.FC = () => {
  // CORREGIDO: Usar el hook real y manejar todos los estados
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtsSummary>({
    totalAmount: 0,
    totalDebts: 0,
    pendingAmount: 0,
    pendingDebts: 0,
    overdueAmount: 0,
    overdueDebts: 0,
    paidAmount: 0,
    paidDebts: 0,
    currency: 'ARS'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para formularios
  const [createForm, setCreateForm] = useState<CreateDebtForm>({
    userId: '',
    description: '',
    amount: 0,
    currency: 'ARS',
    dueDate: '',
    category: 'other',
    notes: ''
  });
  
  const [editForm, setEditForm] = useState<EditDebtForm>({
    description: '',
    amount: 0,
    dueDate: '',
    category: 'other',
    notes: '',
    status: 'pending'
  });

  // Calcular resumen de deudas
  const calculateSummary = useCallback((debts: Debt[]) => {
    const summary = debts.reduce((acc, debt) => {
      acc.totalAmount += debt.amount;
      acc.totalDebts += 1;
      
      switch (debt.status) {
        case 'pending':
          acc.pendingAmount += debt.amount;
          acc.pendingDebts += 1;
          break;
        case 'overdue':
          acc.overdueAmount += debt.amount;
          acc.overdueDebts += 1;
          break;
        case 'paid':
          acc.paidAmount += debt.amount;
          acc.paidDebts += 1;
          break;
      }
      
      return acc;
    }, {
      totalAmount: 0,
      totalDebts: 0,
      pendingAmount: 0,
      pendingDebts: 0,
      overdueAmount: 0,
      overdueDebts: 0,
      paidAmount: 0,
      paidDebts: 0,
      currency: 'ARS'
    });
    
    setSummary(summary);
  }, []);

  // Datos mock para fallback
  const getMockDebts = useCallback((): Debt[] => [
    {
      _id: '1',
      description: 'Consulta dental especializada',
      amount: 15000,
      currency: 'ARS',
      status: 'pending',
      dueDate: '2025-06-30',
      category: 'service',
      user: { _id: '101', email: 'usuario@ejemplo.com', name: 'Usuario Ejemplo' },
      canBePaid: true,
      totalPaid: 0,
      createdAt: '2025-01-01',
      remindersSent: 0
    },
    {
      _id: '2',
      description: 'Limpieza dental profunda',
      amount: 8000,
      currency: 'ARS',
      status: 'overdue',
      dueDate: '2025-05-15',
      category: 'service',
      user: { _id: '101', email: 'usuario@ejemplo.com', name: 'Usuario Ejemplo' },
      canBePaid: true,
      totalPaid: 0,
      createdAt: '2025-01-02',
      remindersSent: 2
    },
    {
      _id: '3',
      description: 'Ortodoncia - Cuota mensual #1',
      amount: 25000,
      currency: 'ARS',
      status: 'paid',
      dueDate: '2025-04-10',
      category: 'service',
      user: { _id: '102', email: 'otro@ejemplo.com', name: 'Otro Usuario' },
      canBePaid: false,
      totalPaid: 25000,
      createdAt: '2025-01-03'
    }
  ], []);

  const fetchDebts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      if (statusFilter) params.append('status', statusFilter);
      
      console.log('🔄 Fetching debts with params:', params.toString());
      const response = await apiService.get(`/debts?${params}`);
      
      if (response.status === 'success' && response.data?.debts) {
        setDebts(response.data.debts);
        calculateSummary(response.data.debts);
        console.log('✅ Debts loaded successfully:', response.data.debts.length);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('❌ Error al cargar las deudas:', error);
      // Usar datos mock en caso de error para la demo
      const mockDebts = getMockDebts();
      setDebts(mockDebts);
      calculateSummary(mockDebts);
      console.log('✅ Using mock data:', mockDebts.length, 'debts');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, statusFilter, calculateSummary, getMockDebts]);

  const fetchUsers = useCallback(async () => {
    if (!user?.role || user.role !== 'admin') {
      console.log('🚫 fetchUsers: Not admin or no user role');
      return;
    }
    
    try {
      console.log('🔄 Fetching users...');
      const response = await apiService.get('/auth/users');
      if (response.status === 'success' && response.data?.users) {
        const clientUsers = response.data.users.filter((u: User) => u.role === 'cliente');
        setUsers(clientUsers);
        console.log('✅ Users loaded successfully:', clientUsers.length);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('❌ Error al cargar usuarios:', error);
      // Usar datos mock para la demo
      const mockUsers = [
        { _id: '101', email: 'usuario@ejemplo.com', name: 'Usuario Ejemplo', role: 'cliente' },
        { _id: '102', email: 'otro@ejemplo.com', name: 'Otro Usuario', role: 'cliente' },
        { _id: '103', email: 'paciente@ejemplo.com', name: 'María González', role: 'cliente' },
        { _id: '104', email: 'cliente@ejemplo.com', name: 'Juan Pérez', role: 'cliente' }
      ];
      setUsers(mockUsers);
      console.log('✅ Using mock users:', mockUsers.length);
    }
  }, [user?.role]);

  // CORREGIDO: Manejo de carga inicial mejorado
  useEffect(() => {
    console.log('🚀 DebtsMain mounted, loading initial data');
    console.log('📊 Auth state:', { 
      user: !!user, 
      isAuthenticated, 
      authLoading,
      userRole: user?.role 
    });
    
    // Si la autenticación está en progreso, esperar
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // Si no hay usuario autenticado después de que termine la carga
    if (!isAuthenticated || !user) {
      console.log('❌ No authenticated user after auth complete');
      setIsLoading(false);
      return;
    }
    
    // Solo ahora cargar datos
    const loadInitialData = async () => {
      console.log('👤 User authenticated, loading data for:', user.role);
      
      try {
        // Cargar deudas primero
        await fetchDebts();
        // Luego cargar usuarios si es admin
        if (user.role === 'admin') {
          await fetchUsers();
        }
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [isAuthenticated, authLoading, user?.id, user?.role, fetchDebts, fetchUsers]);

  const createDebt = async () => {
    if (!createForm.userId || !createForm.description || createForm.amount <= 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await apiService.post('/debts', createForm);
      
      if (response.status === 'success') {
        setShowCreateModal(false);
        resetCreateForm();
        fetchDebts();
        alert('Deuda creada exitosamente');
      }
    } catch (error: any) {
      console.error('Error creando deuda:', error);
      alert('Error al crear la deuda: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDebt = async () => {
    if (!editingDebt || !editForm.description || editForm.amount <= 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await apiService.put(`/debts/${editingDebt._id}`, editForm);
      
      if (response.status === 'success') {
        setShowEditModal(false);
        setEditingDebt(null);
        fetchDebts();
        alert('Deuda actualizada exitosamente');
      }
    } catch (error: any) {
      console.error('Error actualizando deuda:', error);
      alert('Error al actualizar la deuda: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeDebtStatus = async (debtId: string, newStatus: string, reason?: string) => {
    try {
      let response;
      
      if (newStatus === 'cancelled') {
        response = await apiService.post(`/debts/${debtId}/cancel`, { reason });
      } else if (newStatus === 'paid') {
        response = await apiService.post(`/debts/${debtId}/mark-paid`, { notes: reason });
      } else {
        response = await apiService.put(`/debts/${debtId}`, { status: newStatus });
      }
      
      if (response.status === 'success') {
        fetchDebts();
        alert('Estado actualizado exitosamente');
      }
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const deleteDebt = async (debtId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta deuda?')) return;
    
    try {
      await changeDebtStatus(debtId, 'cancelled', 'Eliminada por administrador');
    } catch (error: any) {
      console.error('Error eliminando deuda:', error);
    }
  };

  const openEditModal = useCallback((debt: Debt) => {
    setEditingDebt(debt);
    setEditForm({
      description: debt.description,
      amount: debt.amount,
      dueDate: debt.dueDate.split('T')[0],
      category: debt.category,
      notes: debt.notes || '',
      status: debt.status
    });
    setShowEditModal(true);
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateForm({
      userId: '',
      description: '',
      amount: 0,
      currency: 'ARS',
      dueDate: '',
      category: 'other',
      notes: ''
    });
  }, []);

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = !selectedUserId || debt.user._id === selectedUserId;
    const matchesStatus = !statusFilter || debt.status === statusFilter;
    
    return matchesSearch && matchesUser && matchesStatus;
  });

  // CORREGIDO: Mostrar loading solo cuando sea necesario
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // CORREGIDO: Si no hay usuario autenticado, mostrar mensaje apropiado
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso no autorizado</h2>
          <p className="text-gray-300 mb-6">Debes iniciar sesión para acceder a esta página.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all duration-200"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering main DebtsMain content');

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {user?.role === 'admin' ? 'Gestión de Deudas' : 'Mis Deudas'}
            </h1>
            <p className="text-gray-300">
              {user?.role === 'admin' 
                ? 'Administra y supervisa todas las deudas del sistema'
                : 'Revisa el estado de tus pagos pendientes'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Nueva Deuda
              </button>
            )}
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button 
              onClick={() => {
                fetchDebts();
                if (user?.role === 'admin') fetchUsers();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Deudas Pendientes" 
            value={summary.pendingDebts} 
            description={`$${summary.pendingAmount.toLocaleString()} pendientes`} 
            icon={Clock}
            gradient="from-yellow-500 to-orange-600"
            trend={`${summary.pendingDebts} de ${summary.totalDebts} total`}
          />
          <SummaryCard 
            title="Deudas Vencidas" 
            value={summary.overdueDebts} 
            description={`$${summary.overdueAmount.toLocaleString()} vencidas`} 
            icon={AlertTriangle}
            gradient="from-red-500 to-pink-600"
            urgent={summary.overdueDebts > 0}
          />
          <SummaryCard 
            title="Deudas Pagadas" 
            value={summary.paidDebts} 
            description={`$${summary.paidAmount.toLocaleString()} cobrados`} 
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-600"
          />
          <SummaryCard 
            title="Total General" 
            value={summary.totalDebts} 
            description={`$${summary.totalAmount.toLocaleString()} en total`} 
            icon={DollarSign}
            gradient="from-blue-500 to-purple-600"
          />
        </div>

        {/* Filters and Search */}
        <FiltersSection 
          user={user}
          users={users}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Loading indicator durante fetch de datos */}
        {isLoading && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-white">Cargando datos...</p>
          </div>
        )}

        {/* Debts Display */}
        {!isLoading && (
          <>
            {viewMode === 'grid' ? (
              <DebtsGrid 
                debts={filteredDebts} 
                user={user} 
                onEdit={openEditModal}
                onChangeStatus={changeDebtStatus}
                onDelete={deleteDebt}
              />
            ) : (
              <DebtsTable 
                debts={filteredDebts} 
                user={user}
                onEdit={openEditModal}
                onChangeStatus={changeDebtStatus}
                onDelete={deleteDebt}
              />
            )}
          </>
        )}

        {/* Create Debt Modal */}
        {showCreateModal && (
          <CreateDebtModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            form={createForm}
            setForm={setCreateForm}
            users={users}
            onSubmit={createDebt}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Edit Debt Modal */}
        {showEditModal && editingDebt && (
          <EditDebtModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            form={editForm}
            setForm={setEditForm}
            debt={editingDebt}
            onSubmit={updateDebt}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 bg-white/10 rounded-lg w-64"></div>
        <div className="h-4 bg-white/10 rounded-lg w-96"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-white/10 rounded-xl w-32"></div>
        <div className="h-10 bg-white/10 rounded-xl w-24"></div>
        <div className="h-10 bg-white/10 rounded-xl w-32"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="space-y-4">
            <div className="h-4 bg-white/10 rounded w-24"></div>
            <div className="h-8 bg-white/10 rounded w-32"></div>
            <div className="h-3 bg-white/10 rounded w-40"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  gradient: string;
  trend?: string;
  urgent?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  gradient,
  trend,
  urgent = false
}) => {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-105 border ${urgent ? 'border-red-500/50 animate-pulse' : 'border-white/10'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {urgent && (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <p className="text-2xl font-bold text-white">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">{description}</p>
        {trend && (
          <p className="text-xs text-blue-400">{trend}</p>
        )}
      </div>
    </div>
  );
};

interface FiltersProps {
  user: any;
  users: User[];
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

const FiltersSection: React.FC<FiltersProps> = ({
  user, users, selectedUserId, setSelectedUserId, statusFilter, setStatusFilter,
  searchTerm, setSearchTerm, viewMode, setViewMode
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-white/10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Filter className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Filtros y Búsqueda</h3>
      </div>
      
      <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'grid' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'table' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Tabla
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Descripción, usuario..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* User Filter (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Usuario</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
            >
              <option value="" className="bg-gray-800">Todos los usuarios</option>
              {users.map(user => (
                <option key={user._id} value={user._id} className="bg-gray-800">
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Estado</label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="" className="bg-gray-800">Todos los estados</option>
            <option value="pending" className="bg-gray-800">Pendiente</option>
            <option value="overdue" className="bg-gray-800">Vencida</option>
            <option value="paid" className="bg-gray-800">Pagada</option>
            <option value="cancelled" className="bg-gray-800">Cancelada</option>
            <option value="processing" className="bg-gray-800">En proceso</option>
          </select>
        </div>
      </div>
    </div>

    {/* Info Message */}
    {(selectedUserId || statusFilter || searchTerm) && (
      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-300">
          💡 Has aplicado filtros. Presiona <strong>Actualizar</strong> para ver los resultados.
        </p>
      </div>
    )}
  </div>
);

interface DebtsGridProps {
  debts: Debt[];
  user: any;
  onEdit: (debt: Debt) => void;
  onChangeStatus: (debtId: string, status: string, reason?: string) => void;
  onDelete: (debtId: string) => void;
}

const DebtsGrid: React.FC<DebtsGridProps> = ({ debts, user, onEdit, onChangeStatus, onDelete }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {debts.length === 0 ? (
      <div className="col-span-full bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No se encontraron deudas</h3>
        <p className="text-gray-400">Ajusta los filtros o crea una nueva deuda</p>
      </div>
    ) : (
      debts.map((debt) => (
        <DebtCard 
          key={debt._id} 
          debt={debt} 
          user={user}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
        />
      ))
    )}
  </div>
);

interface DebtCardProps {
  debt: Debt;
  user: any;
  onEdit: (debt: Debt) => void;
  onChangeStatus: (debtId: string, status: string, reason?: string) => void;
  onDelete: (debtId: string) => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, user, onEdit, onChangeStatus, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  const statusConfig = {
    pending: { label: 'Pendiente', classes: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
    processing: { label: 'En proceso', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: TrendingUp },
    paid: { label: 'Pagada', classes: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle },
    cancelled: { label: 'Cancelada', classes: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: X },
    overdue: { label: 'Vencida', classes: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertTriangle },
  };

  const config = statusConfig[debt.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/10 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-1">{debt.description}</h3>
            {user?.role === 'admin' && (
              <p className="text-sm text-gray-400">{debt.user.name || debt.user.email}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}>
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </div>
          
          {user?.role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-10 z-10 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => {
                      onEdit(debt);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    Editar
                  </button>
                  {debt.status !== 'paid' && (
                    <button
                      onClick={() => {
                        onChangeStatus(debt._id, 'paid');
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Marcar Pagada
                    </button>
                  )}
                  {debt.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        onChangeStatus(debt._id, 'cancelled', 'Cancelada por administrador');
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Monto</span>
          <span className="font-bold text-white">
            {debt.amount.toLocaleString('es-AR', { style: 'currency', currency: debt.currency })}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Vencimiento</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-white">
              {new Date(debt.dueDate).toLocaleDateString('es-AR')}
            </span>
          </div>
        </div>

        {debt.totalPaid > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Pagado</span>
            <span className="text-sm text-green-400">
              {debt.totalPaid.toLocaleString('es-AR', { style: 'currency', currency: debt.currency })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all duration-200 hover:scale-105">
          <Eye className="w-3 h-3" />
          Ver
        </button>
        
        {debt.canBePaid && user?.role !== 'admin' && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
            <CheckCircle className="w-3 h-3" />
            Pagar
          </button>
        )}
      </div>
    </div>
  );
};

const DebtsTable: React.FC<DebtsGridProps> = ({ debts, user, onEdit, onChangeStatus, onDelete }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
        <FileText className="w-4 h-4 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">
        {user?.role === 'admin' ? 'Listado de Deudas' : 'Mis Deudas'}
      </h3>
    </div>
    
    {debts.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No se encontraron deudas</h3>
        <p className="text-gray-400">Ajusta los filtros para ver más resultados</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              {user?.role === 'admin' && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {debts.map((debt) => (
              <tr key={debt._id} className="hover:bg-white/5 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-sm font-medium text-white">{debt.description}</div>
                  </div>
                </td>
                {user?.role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{debt.user.name || debt.user.email}</div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-white">
                    {debt.amount.toLocaleString('es-AR', { style: 'currency', currency: debt.currency })}
                  </div>
                  {debt.totalPaid > 0 && (
                    <div className="text-xs text-green-400">
                      Pagado: {debt.totalPaid.toLocaleString('es-AR', { style: 'currency', currency: debt.currency })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <div className="text-sm text-gray-300">
                      {new Date(debt.dueDate).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DebtStatusBadge status={debt.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-all duration-200 hover:scale-105">
                      <Eye className="w-3 h-3" />
                      Ver
                    </button>
                    {debt.canBePaid && user?.role !== 'admin' && (
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xs text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CheckCircle className="w-3 h-3" />
                        Pagar
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => onEdit(debt)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-xs text-blue-300 transition-all duration-200 hover:scale-105"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>
                        {debt.status !== 'paid' && (
                          <button 
                            onClick={() => onChangeStatus(debt._id, 'paid')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-xs text-green-300 transition-all duration-200 hover:scale-105"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Marcar Pagada
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

interface DebtStatusBadgeProps {
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'overdue';
}

const DebtStatusBadge: React.FC<DebtStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pendiente', classes: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: Clock },
    processing: { label: 'En proceso', classes: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: TrendingUp },
    paid: { label: 'Pagada', classes: 'bg-green-500/20 text-green-300 border border-green-500/30', icon: CheckCircle },
    cancelled: { label: 'Cancelada', classes: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', icon: X },
    overdue: { label: 'Vencida', classes: 'bg-red-500/20 text-red-300 border border-red-500/30', icon: AlertTriangle },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}>
      <StatusIcon className="w-3 h-3" />
      {config.label}
    </div>
  );
};

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: CreateDebtForm;
  setForm: (form: CreateDebtForm) => void;
  users: User[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CreateDebtModal: React.FC<CreateDebtModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  users,
  onSubmit,
  isSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Crear Nueva Deuda</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario *
              </label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar usuario</option>
                {users.map(user => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="service" className="bg-gray-800">Servicio</option>
                <option value="product" className="bg-gray-800">Producto</option>
                <option value="subscription" className="bg-gray-800">Suscripción</option>
                <option value="fine" className="bg-gray-800">Multa</option>
                <option value="other" className="bg-gray-800">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción de la deuda"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monto *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ARS" className="bg-gray-800">ARS</option>
                <option value="USD" className="bg-gray-800">USD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 disabled:scale-100"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Creando...' : 'Crear Deuda'}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: EditDebtForm;
  setForm: (form: EditDebtForm) => void;
  debt: Debt;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const EditDebtModal: React.FC<EditDebtModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  debt,
  onSubmit,
  isSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Editar Deuda</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={debt.user.name || debt.user.email}
                disabled
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending" className="bg-gray-800">Pendiente</option>
                <option value="processing" className="bg-gray-800">En proceso</option>
                <option value="paid" className="bg-gray-800">Pagada</option>
                <option value="cancelled" className="bg-gray-800">Cancelada</option>
                <option value="overdue" className="bg-gray-800">Vencida</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción de la deuda"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monto *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 disabled:scale-100"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Actualizando...' : 'Actualizar Deuda'}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtsMain;