import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CreditCard, 
  Filter, 
  Search, 
  Download,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  MoreVertical,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import type { Payment } from '../../hooks/useDebts';

interface PaymentWithDebt extends Payment {
  debt?: {
    _id: string;
    description: string;
    amount: number;
    currency: string;
  };
}

export const PaymentsHistory: React.FC = () => {
  const { 
    getPaymentHistory, 
    formatPaymentStatus, 
    getPaymentStatusColor,
    loading, 
    error,
    clearError 
  } = usePayments();

  const [payments, setPayments] = useState<PaymentWithDebt[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDebt | null>(null);

  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        console.log('📊 Cargando historial de pagos...');
        const result = await getPaymentHistory({
          status: filters.status || undefined,
          page: currentPage,
          limit: 10
        });
        
        console.log('✅ Historial cargado:', result);
        setPayments(result.payments as PaymentWithDebt[]);
        setStats(result.stats);
        setPagination(result.pagination);
      } catch (err) {
        console.error('❌ Error loading payment history:', err);
      }
    };

    loadPaymentHistory();
  }, [currentPage, filters.status, getPaymentHistory]);

  const formatCurrency = (amount: number, currency: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  };

  const filteredAndSortedPayments = React.useMemo(() => {
    let filtered = payments.filter(payment => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = payment.debt?.description?.toLowerCase().includes(searchLower);
        const matchesId = payment._id.toLowerCase().includes(searchLower);
        const matchesMpId = payment.mercadopago?.paymentId?.toLowerCase().includes(searchLower);
        
        if (!matchesDescription && !matchesId && !matchesMpId) {
          return false;
        }
      }

      if (filters.dateFrom) {
        const paymentDate = new Date(payment.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (paymentDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const paymentDate = new Date(payment.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (paymentDate > toDate) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [payments, filters, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'pending':
      case 'processing':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const handleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleExport = () => {
    console.log('📥 Exportando historial de pagos...');
    // Aquí iría la lógica para exportar a CSV/PDF
  };

  // Loading state mejorado
  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="gradient-card rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-white/20 rounded w-20"></div>
                  <div className="h-8 bg-white/20 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="gradient-card rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded w-32"></div>
                      <div className="h-3 bg-white/20 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-white/20 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-300 font-medium">Error al cargar pagos</h4>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gradient-card rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Total de Pagos</p>
                <p className="text-2xl font-bold text-white flex items-center">
                  {stats.totalPayments}
                  <TrendingUp className="w-5 h-5 ml-2 text-green-400" />
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="gradient-card rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Monto Total</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="gradient-card rounded-xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-white flex items-center">
                  {stats.stats ? 
                    Math.round((stats.stats.find((s: any) => s.status === 'approved')?.count || 0) / stats.totalPayments * 100) 
                    : 0}%
                  <Sparkles className="w-5 h-5 ml-2 text-yellow-400" />
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="gradient-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Historial de Pagos
                </h2>
                <p className="text-gray-300 text-sm">
                  {pagination.total} {pagination.total === 1 ? 'pago registrado' : 'pagos registrados'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar pagos..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-white transition-colors ${
                  showFilters ? 'bg-blue-500/20' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {(filters.status || filters.dateFrom || filters.dateTo) && (
                  <span className="ml-2 w-2 h-2 bg-blue-400 rounded-full"></span>
                )}
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="approved">Aprobados</option>
                    <option value="pending">Pendientes</option>
                    <option value="processing">Procesando</option>
                    <option value="rejected">Rechazados</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Fecha
                <ArrowUpDown className="h-4 w-4 ml-1" />
              </button>
              <button
                onClick={() => handleSort('amount')}
                className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Monto
                <ArrowUpDown className="h-4 w-4 ml-1" />
              </button>
            </div>
            <span className="text-sm text-gray-400">Acciones</span>
          </div>
        </div>

        {/* Payments List */}
        <div className="divide-y divide-white/10">
          {filteredAndSortedPayments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No se encontraron pagos
              </h3>
              <p className="text-gray-400 mb-6">
                {filters.search || filters.status || filters.dateFrom || filters.dateTo
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No tienes pagos registrados aún'
                }
              </p>
              {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedPayments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              const statusColor = getPaymentStatusColor(payment.status);
              
              return (
                <div key={payment._id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-lg ${statusColor.split(' ')[1]}`}>
                        <StatusIcon className={`h-5 w-5 ${statusColor.split(' ')[0]}`} />
                      </div>
                      
                      {/* Payment Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {payment.debt?.description || 'Pago sin descripción'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(payment.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {formatPaymentStatus(payment.status)}
                          </span>
                          {payment.mercadopago?.paymentId && (
                            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">
                              MP: {payment.mercadopago.paymentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.mercadopago?.paymentMethodId && (
                          <div className="text-sm text-gray-400">
                            {payment.mercadopago.paymentMethodId}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Página {pagination.current} de {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 text-sm border border-white/20 rounded-md text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages || loading}
                  className="px-3 py-1 text-sm border border-white/20 rounded-md text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="gradient-card rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Detalles del Pago</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedPayment.status)}`}>
                    {formatPaymentStatus(selectedPayment.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Monto:</span>
                  <span className="text-white font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Fecha:</span>
                  <span className="text-white">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Concepto:</span>
                  <span className="text-white text-right">{selectedPayment.debt?.description || 'N/A'}</span>
                </div>
              </div>

              {selectedPayment.mercadopago && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Información de MercadoPago</h4>
                  <div className="space-y-2 text-sm">
                    {selectedPayment.mercadopago.paymentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">ID de Pago:</span>
                        <span className="text-white font-mono">{selectedPayment.mercadopago.paymentId}</span>
                      </div>
                    )}
                    {selectedPayment.mercadopago.paymentMethodId && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Método:</span>
                        <span className="text-white">{selectedPayment.mercadopago.paymentMethodId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  console.log('📄 Descargando comprobante del pago:', selectedPayment._id);
                  // Aquí iría la lógica para descargar comprobante
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};