import React, { useEffect, useState } from 'react';
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
  Download
} from 'lucide-react';

// Mock useAuth hook for the example
const useAuth = () => ({
  user: { 
    role: 'admin', // Change to 'user' to see customer view
    email: 'admin@example.com' 
  }
});

interface Debt {
  _id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'overdue';
  dueDate: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  canBePaid: boolean;
  totalPaid: number;
}

interface DebtsSummary {
  totalAmount: number;
  totalDebts: number;
  currency: string;
}

export const DebtsMain: React.FC = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtsSummary>({
    totalAmount: 0,
    totalDebts: 0,
    currency: 'ARS'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<{_id: string, email: string, name?: string}[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setTimeout(() => {
          const mockDebts = [
            {
              _id: '1',
              description: 'Consulta dental especializada',
              amount: 15000,
              currency: 'ARS',
              status: 'pending' as const,
              dueDate: '2025-06-30',
              user: {
                _id: '101',
                email: 'usuario@ejemplo.com',
                name: 'Usuario Ejemplo'
              },
              canBePaid: true,
              totalPaid: 0
            },
            {
              _id: '2',
              description: 'Limpieza dental profunda',
              amount: 8000,
              currency: 'ARS',
              status: 'overdue' as const,
              dueDate: '2025-05-15',
              user: {
                _id: '101',
                email: 'usuario@ejemplo.com',
                name: 'Usuario Ejemplo'
              },
              canBePaid: true,
              totalPaid: 0
            },
            {
              _id: '3',
              description: 'Ortodoncia - Cuota mensual #1',
              amount: 25000,
              currency: 'ARS',
              status: 'paid' as const,
              dueDate: '2025-04-10',
              user: {
                _id: '102',
                email: 'otro@ejemplo.com',
                name: 'Otro Usuario'
              },
              canBePaid: false,
              totalPaid: 25000
            },
            {
              _id: '4',
              description: 'Tratamiento de conducto',
              amount: 32000,
              currency: 'ARS',
              status: 'processing' as const,
              dueDate: '2025-07-15',
              user: {
                _id: '103',
                email: 'paciente@ejemplo.com',
                name: 'María González'
              },
              canBePaid: false,
              totalPaid: 16000
            },
            {
              _id: '5',
              description: 'Blanqueamiento dental',
              amount: 12000,
              currency: 'ARS',
              status: 'cancelled' as const,
              dueDate: '2025-05-20',
              user: {
                _id: '104',
                email: 'cliente@ejemplo.com',
                name: 'Juan Pérez'
              },
              canBePaid: false,
              totalPaid: 0
            }
          ];
          
          setDebts(mockDebts);
          setSummary({
            totalAmount: 92000,
            totalDebts: 5,
            currency: 'ARS'
          });
          
          if (user?.role === 'admin') {
            setUsers([
              { _id: '101', email: 'usuario@ejemplo.com', name: 'Usuario Ejemplo' },
              { _id: '102', email: 'otro@ejemplo.com', name: 'Otro Usuario' },
              { _id: '103', email: 'paciente@ejemplo.com', name: 'María González' },
              { _id: '104', email: 'cliente@ejemplo.com', name: 'Juan Pérez' }
            ]);
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar las deudas:', error);
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, [user, selectedUserId, statusFilter]);

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = !selectedUserId || debt.user._id === selectedUserId;
    const matchesStatus = !statusFilter || debt.status === statusFilter;
    
    return matchesSearch && matchesUser && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 gradient-purple rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Total de Deudas" 
            value={summary.totalDebts} 
            description="Registros en el sistema" 
            icon={FileText}
            gradient="from-blue-500 to-purple-600"
          />
          <SummaryCard 
            title="Monto Total" 
            value={summary.totalAmount} 
            description={`Valor total en ${summary.currency}`} 
            icon={DollarSign}
            isCurrency={true}
            currency={summary.currency}
            gradient="from-green-500 to-emerald-600"
          />
          <SummaryCard 
            title="Pendientes" 
            value={debts.filter(d => d.status === 'pending' || d.status === 'overdue').length} 
            description="Requieren atención" 
            icon={AlertTriangle}
            gradient="from-orange-500 to-red-600"
          />
          <SummaryCard 
            title="Completadas" 
            value={debts.filter(d => d.status === 'paid').length} 
            description="Pagos finalizados" 
            icon={CheckCircle}
            gradient="from-teal-500 to-green-600"
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

        {/* Debts Display */}
        {viewMode === 'grid' ? (
          <DebtsGrid debts={filteredDebts} user={user} />
        ) : (
          <DebtsTable debts={filteredDebts} user={user} />
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
        <div className="h-10 bg-white/10 rounded-xl w-24"></div>
        <div className="h-10 bg-white/10 rounded-xl w-32"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="gradient-card rounded-2xl p-6">
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
  isCurrency?: boolean;
  currency?: string;
  gradient: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  isCurrency = false,
  currency = 'ARS',
  gradient
}) => {
  const formattedValue = isCurrency 
    ? value.toLocaleString('es-AR', { style: 'currency', currency })
    : value.toLocaleString();

  return (
    <div className="gradient-card rounded-2xl p-6 card-hover group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <p className="text-2xl font-bold text-white group-hover:text-gradient transition-colors duration-200">
          {formattedValue}
        </p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
};

interface FiltersProps {
  user: any;
  users: any[];
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
  <div className="gradient-card rounded-2xl p-6 space-y-6">
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
  </div>
);

const DebtsGrid: React.FC<{ debts: Debt[], user: any }> = ({ debts, user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {debts.length === 0 ? (
      <div className="col-span-full gradient-card rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No se encontraron deudas</h3>
        <p className="text-gray-400">Ajusta los filtros o crea una nueva deuda</p>
      </div>
    ) : (
      debts.map((debt) => <DebtCard key={debt._id} debt={debt} user={user} />)
    )}
  </div>
);

const DebtCard: React.FC<{ debt: Debt, user: any }> = ({ debt, user }) => {
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
    <div className="gradient-card rounded-2xl p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white line-clamp-1">{debt.description}</h3>
            {user?.role === 'admin' && (
              <p className="text-sm text-gray-400">{debt.user.name || debt.user.email}</p>
            )}
          </div>
        </div>
        
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
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
        
        {debt.canBePaid && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 gradient-purple rounded-lg text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
            <CheckCircle className="w-3 h-3" />
            Pagar
          </button>
        )}
        
        {user?.role === 'admin' && (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm text-blue-300 transition-all duration-200 hover:scale-105">
              <Edit3 className="w-3 h-3" />
              Editar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const DebtsTable: React.FC<{ debts: Debt[], user: any }> = ({ debts, user }) => (
  <div className="gradient-card rounded-2xl p-6">
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
                    {debt.canBePaid && (
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 gradient-purple rounded-lg text-xs text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CheckCircle className="w-3 h-3" />
                        Pagar
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-xs text-blue-300 transition-all duration-200 hover:scale-105">
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>
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

export default DebtsMain;