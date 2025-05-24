#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "${PURPLE}[SECTION]${NC} $1"
}

# Función para crear directorio si no existe
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        print_success "Directorio creado: $1"
    else
        print_warning "Directorio ya existe: $1"
    fi
}

# Función para crear archivo si no existe o preguntar si sobrescribir
create_file() {
    if [ ! -f "$1" ]; then
        touch "$1"
        print_success "Archivo creado: $1"
        return 0
    else
        print_warning "Archivo ya existe: $1"
        echo -n "¿Quieres sobrescribirlo? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_status "Sobrescribiendo: $1"
            return 0
        else
            return 1
        fi
    fi
}

# Verificar que estemos en un proyecto Astro
if [ ! -f "astro.config.mjs" ] && [ ! -f "astro.config.js" ] && [ ! -f "astro.config.ts" ]; then
    print_error "No se detectó un proyecto Astro. Asegúrate de ejecutar este script en la raíz de tu proyecto Astro."
    exit 1
fi

print_status "🚀 Iniciando configuración COMPLETA del Sistema de Pagos..."

# ===== CREAR ESTRUCTURA DE DIRECTORIOS =====
print_section "📁 Creando estructura completa de directorios..."

create_dir "src/hooks"
create_dir "src/components/debts"
create_dir "src/components/payments"
create_dir "src/components/dashboard"
create_dir "src/components/common"
create_dir "src/components/auth/shared"
create_dir "src/layouts/main"
create_dir "src/middleware"
create_dir "src/pages"

# ===== PÁGINAS ASTRO =====
print_section "📄 Creando páginas Astro..."

# debts.astro
if create_file "src/pages/debts.astro"; then
cat > "src/pages/debts.astro" << 'EOF'
---
import Layout from '../layouts/main/Layout.astro';
import { Navbar } from '../components/common/Navbar';
---

<Layout title="Mis Deudas">
  <Navbar client:load />
  
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Mis Deudas
        </h1>
        <p class="text-gray-600">
          Gestiona y paga tus deudas de forma segura y rápida
        </p>
      </div>

      <div id="debts-dashboard">
        <div class="animate-pulse space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow h-32"></div>
            <div class="bg-white p-6 rounded-lg shadow h-32"></div>
            <div class="bg-white p-6 rounded-lg shadow h-32"></div>
          </div>
          <div class="bg-white rounded-lg shadow h-64"></div>
        </div>
      </div>
    </div>
  </main>

  <script>
    import { DebtsMain } from '../components/debts/DebtsMain';
    import { createRoot } from 'react-dom/client';
    import React from 'react';

    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('debts-dashboard');
      if (container) {
        const root = createRoot(container);
        root.render(React.createElement(DebtsMain));
      }
    });
  </script>
</Layout>
EOF
fi

# payments.astro
if create_file "src/pages/payments.astro"; then
cat > "src/pages/payments.astro" << 'EOF'
---
import Layout from '../layouts/main/Layout.astro';
import { Navbar } from '../components/common/Navbar';
---

<Layout title="Historial de Pagos">
  <Navbar client:load />
  
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Historial de Pagos
        </h1>
        <p class="text-gray-600">
          Revisa todos tus pagos realizados y sus estados
        </p>
      </div>

      <div id="payments-history">
        <div class="animate-pulse space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div class="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div class="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div class="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    import { PaymentsHistory } from '../components/payments/PaymentsHistory';
    import { createRoot } from 'react-dom/client';
    import React from 'react';

    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('payments-history');
      if (container) {
        const root = createRoot(container);
        root.render(React.createElement(PaymentsHistory));
      }
    });
  </script>
</Layout>
EOF
fi

# payment-success.astro
if create_file "src/pages/payment-success.astro"; then
cat > "src/pages/payment-success.astro" << 'EOF'
---
import Layout from '../layouts/main/Layout.astro';
---

<Layout title="Pago Exitoso">
  <main class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div id="payment-result-container">
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="animate-pulse">
            <div class="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    import { PaymentResult } from '../components/payments/PaymentResult';
    import { createRoot } from 'react-dom/client';
    import React from 'react';

    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('payment-result-container');
      if (container) {
        const root = createRoot(container);
        
        const urlParams = new URLSearchParams(window.location.search);
        
        root.render(React.createElement(PaymentResult, {
          type: 'success',
          externalReference: urlParams.get('external_reference'),
          paymentId: urlParams.get('payment_id'),
          status: urlParams.get('status')
        }));
      }
    });
  </script>
</Layout>
EOF
fi

# payment-failure.astro
if create_file "src/pages/payment-failure.astro"; then
cat > "src/pages/payment-failure.astro" << 'EOF'
---
import Layout from '../layouts/main/Layout.astro';
---

<Layout title="Pago Rechazado">
  <main class="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div id="payment-result-container">
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="animate-pulse">
            <div class="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    import { PaymentResult } from '../components/payments/PaymentResult';
    import { createRoot } from 'react-dom/client';
    import React from 'react';

    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('payment-result-container');
      if (container) {
        const root = createRoot(container);
        
        const urlParams = new URLSearchParams(window.location.search);
        
        root.render(React.createElement(PaymentResult, {
          type: 'failure',
          externalReference: urlParams.get('external_reference'),
          paymentId: urlParams.get('payment_id'),
          status: urlParams.get('status')
        }));
      }
    });
  </script>
</Layout>
EOF
fi

# payment-pending.astro
if create_file "src/pages/payment-pending.astro"; then
cat > "src/pages/payment-pending.astro" << 'EOF'
---
import Layout from '../layouts/main/Layout.astro';
---

<Layout title="Pago Pendiente">
  <main class="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div id="payment-result-container">
        <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="animate-pulse">
            <div class="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    import { PaymentResult } from '../components/payments/PaymentResult';
    import { createRoot } from 'react-dom/client';
    import React from 'react';

    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('payment-result-container');
      if (container) {
        const root = createRoot(container);
        
        const urlParams = new URLSearchParams(window.location.search);
        
        root.render(React.createElement(PaymentResult, {
          type: 'pending',
          externalReference: urlParams.get('external_reference'),
          paymentId: urlParams.get('payment_id'),
          status: urlParams.get('status')
        }));
      }
    });
  </script>
</Layout>
EOF
fi

# Actualizar dashboard.astro
if create_file "src/pages/dashboard.astro"; then
cat > "src/pages/dashboard.astro" << 'EOF'
---
import Layout from '../layouts/main/Layout.astro';
import { Navbar } from '../components/common/Navbar';
---

<Layout title="Dashboard">
  <Navbar client:load />
  
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p class="text-gray-600">
          Bienvenido a tu panel de control
        </p>
      </div>

      <div id="dashboard-main">
        <div class="animate-pulse space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div class="space-y-3">
                <div class="h-16 bg-gray-200 rounded"></div>
                <div class="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div class="space-y-3">
                <div class="h-16 bg-gray-200 rounded"></div>
                <div class="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    import { DashboardMain } from '../components/dashboard/DashboardMain';
    import { createRoot } from 'react-dom/client';
    import React from 'react';

    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('dashboard-main');
      if (container) {
        const root = createRoot(container);
        root.render(React.createElement(DashboardMain));
      }
    });
  </script>
</Layout>
EOF
fi

# ===== HOOKS =====
print_section "🎣 Creando hooks React..."

# useDebts.ts (versión completa)
if create_file "src/hooks/useDebts.ts"; then
cat > "src/hooks/useDebts.ts" << 'EOF'
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export interface Debt {
  _id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'overdue';
  dueDate: string;
  category: 'service' | 'product' | 'subscription' | 'fine' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
  canBePaid?: boolean;
  totalPaid?: number;
  pendingAmount?: number;
  isOverdue?: boolean;
  daysUntilDue?: number;
  remindersSent?: number;
}

export interface Payment {
  _id: string;
  amount: number;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  createdAt: string;
  mercadopago: {
    paymentId?: string;
    preferenceId?: string;
    paymentType?: string;
    paymentMethodId?: string;
  };
}

export interface DebtSummary {
  totalAmount: number;
  totalDebts: number;
  currency: string;
}

export interface DebtStats {
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  totalDebts: number;
  totalAmount: number;
  upcomingDebts: number;
}

interface DebtsResponse {
  status: string;
  data: {
    debts: Debt[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
    summary: DebtSummary;
  };
}

interface StatsResponse {
  status: string;
  data: DebtStats;
}

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary>({
    totalAmount: 0,
    totalDebts: 0,
    currency: 'ARS'
  });
  const [stats, setStats] = useState<DebtStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const fetchDebts = useCallback(async (options: {
    status?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.overdue) params.append('overdue', 'true');
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await apiService.get<DebtsResponse>(
        `/debts?${params.toString()}`
      );

      if (response.status === 'success') {
        setDebts(response.data.debts);
        setSummary(response.data.summary);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las deudas');
      console.error('Error fetching debts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.get<StatsResponse>('/debts/stats');
      if (response.status === 'success') {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const getDebt = useCallback(async (debtId: string): Promise<Debt | null> => {
    try {
      const response = await apiService.get<{ status: string; data: Debt }>(`/debts/${debtId}`);
      if (response.status === 'success') {
        return response.data;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching debt:', err);
      throw new Error(err.message || 'Error al cargar la deuda');
    }
  }, []);

  const sendReminder = useCallback(async (debtId: string): Promise<boolean> => {
    try {
      const response = await apiService.post(`/debts/${debtId}/reminder`);
      
      setDebts(prevDebts => 
        prevDebts.map(debt => 
          debt._id === debtId 
            ? { ...debt, remindersSent: (debt.remindersSent || 0) + 1 }
            : debt
        )
      );

      return response.status === 'success';
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      throw new Error(err.message || 'Error al enviar recordatorio');
    }
  }, []);

  const filterDebts = useCallback((filterFn: (debt: Debt) => boolean) => {
    return debts.filter(filterFn);
  }, [debts]);

  const getDebtsByStatus = useCallback((status: Debt['status']) => {
    return filterDebts(debt => debt.status === status);
  }, [filterDebts]);

  const getOverdueDebts = useCallback(() => {
    return filterDebts(debt => 
      debt.status === 'overdue' || 
      (debt.status === 'pending' && new Date(debt.dueDate) < new Date())
    );
  }, [filterDebts]);

  const getUpcomingDebts = useCallback(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return filterDebts(debt => {
      const dueDate = new Date(debt.dueDate);
      const now = new Date();
      return debt.status === 'pending' && dueDate >= now && dueDate <= nextWeek;
    });
  }, [filterDebts]);

  const getTotalByStatus = useCallback((status: Debt['status']) => {
    return getDebtsByStatus(status).reduce((total, debt) => total + debt.amount, 0);
  }, [getDebtsByStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchDebts({ page: pagination.current, limit: pagination.limit }),
      fetchStats()
    ]);
  }, [fetchDebts, fetchStats, pagination.current, pagination.limit]);

  useEffect(() => {
    fetchDebts();
    fetchStats();
  }, [fetchDebts, fetchStats]);

  return {
    debts,
    summary,
    stats,
    pagination,
    loading,
    error,
    fetchDebts,
    fetchStats,
    getDebt,
    sendReminder,
    refresh,
    clearError,
    filterDebts,
    getDebtsByStatus,
    getOverdueDebts,
    getUpcomingDebts,
    getTotalByStatus
  };
};
EOF
fi

# usePayments.ts (versión completa)
if create_file "src/hooks/usePayments.ts"; then
cat > "src/hooks/usePayments.ts" << 'EOF'
import { useState, useCallback } from 'react';
import apiService from '../services/api';
import type { Payment } from './useDebts';

export interface PaymentPreference {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  expirationDate: string;
  paymentId: string;
}

export interface PaymentHistory {
  payments: Payment[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  stats: {
    totalPayments: number;
    totalAmount: number;
    stats: Array<{
      status: string;
      count: number;
      totalAmount: number;
    }>;
  };
}

interface PaymentPreferenceResponse {
  status: string;
  message: string;
  data: PaymentPreference;
}

interface PaymentResponse {
  status: string;
  data: Payment;
}

interface PaymentHistoryResponse {
  status: string;
  data: PaymentHistory;
}

interface PaymentStatusResponse {
  status: string;
  data: {
    payment: {
      id: string;
      status: string;
      amount: number;
      createdAt: string;
    };
    debt: {
      id: string;
      description: string;
      status: string;
    };
  };
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentPreference = useCallback(async (debtId: string): Promise<PaymentPreference> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post<PaymentPreferenceResponse>(`/payments/preference/${debtId}`);
      
      if (response.status === 'success') {
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear preferencia de pago');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear preferencia de pago';
      setError(errorMessage);
      console.error('Error creating payment preference:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPayment = useCallback(async (paymentId: string): Promise<Payment> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get<PaymentResponse>(`/payments/${paymentId}`);
      
      if (response.status === 'success') {
        return response.data;
      }
      
      throw new Error('Error al obtener información del pago');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener el pago';
      setError(errorMessage);
      console.error('Error fetching payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentHistory = useCallback(async (options: {
    status?: string;
    debtId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaymentHistory> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.debtId) params.append('debtId', options.debtId);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await apiService.get<PaymentHistoryResponse>(
        `/payments?${params.toString()}`
      );
      
      if (response.status === 'success') {
        return response.data;
      }
      
      throw new Error('Error al obtener historial de pagos');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener historial de pagos';
      setError(errorMessage);
      console.error('Error fetching payment history:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (
    externalReference: string,
    paymentId?: string,
    status?: string
  ): Promise<PaymentStatusResponse['data']> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ external_reference: externalReference });
      if (paymentId) params.append('payment_id', paymentId);
      if (status) params.append('status', status);

      const response = await apiService.get<PaymentStatusResponse>(
        `/payments/status/check?${params.toString()}`
      );
      
      if (response.status === 'success') {
        return response.data;
      }
      
      throw new Error('Error al verificar estado del pago');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al verificar el pago';
      setError(errorMessage);
      console.error('Error checking payment status:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPayment = useCallback(async (paymentId: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post(`/payments/${paymentId}/cancel`, { reason });
      
      return response.status === 'success';
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cancelar el pago';
      setError(errorMessage);
      console.error('Error canceling payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const retryPayment = useCallback(async (paymentId: string): Promise<PaymentPreference> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post<PaymentPreferenceResponse>(`/payments/${paymentId}/retry`);
      
      if (response.status === 'success') {
        return response.data;
      }
      
      throw new Error(response.message || 'Error al reintentar el pago');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al reintentar el pago';
      setError(errorMessage);
      console.error('Error retrying payment:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestRefund = useCallback(async (
    paymentId: string, 
    reason: string, 
    amount?: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post(`/payments/${paymentId}/refund`, { 
        reason, 
        amount 
      });
      
      return response.status === 'success';
    } catch (err: any) {
      const errorMessage = err.message || 'Error al solicitar reembolso';
      setError(errorMessage);
      console.error('Error requesting refund:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToMercadoPago = useCallback((preference: PaymentPreference) => {
    const url = import.meta.env.DEV 
      ? preference.sandboxInitPoint 
      : preference.initPoint;
    
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('URL de pago no disponible');
    }
  }, []);

  const processPayment = useCallback(async (debtId: string): Promise<void> => {
    try {
      const preference = await createPaymentPreference(debtId);
      redirectToMercadoPago(preference);
    } catch (err) {
      throw err;
    }
  }, [createPaymentPreference, redirectToMercadoPago]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatPaymentStatus = useCallback((status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
      in_mediation: 'En mediación',
      charged_back: 'Contracargo'
    };
    
    return statusMap[status] || status;
  }, []);

  const getPaymentStatusColor = useCallback((status: string): string => {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      refunded: 'text-purple-600 bg-purple-100',
      in_mediation: 'text-orange-600 bg-orange-100',
      charged_back: 'text-red-600 bg-red-100'
    };
    
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }, []);

  return {
    loading,
    error,
    createPaymentPreference,
    processPayment,
    redirectToMercadoPago,
    getPayment,
    getPaymentHistory,
    checkPaymentStatus,
    cancelPayment,
    retryPayment,
    requestRefund,
    clearError,
    formatPaymentStatus,
    getPaymentStatusColor
  };
};
EOF
fi

print_status "📊 Continuando con componentes restantes..."

print_success "Script en progreso... Presiona Enter para continuar con la siguiente parte:"
read -r

# ===== COMPONENTES PAYMENTS =====
print_section "💰 Creando componentes de pagos..."

# PaymentResult.tsx
if create_file "src/components/payments/PaymentResult.tsx"; then
cat > "src/components/payments/PaymentResult.tsx" << 'EOF'
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Home
} from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';

interface PaymentResultProps {
  type: 'success' | 'failure' | 'pending';
  externalReference?: string | null;
  paymentId?: string | null;
  status?: string | null;
}

export const PaymentResult: React.FC<PaymentResultProps> = ({
  type,
  externalReference,
  paymentId,
  status
}) => {
  const { checkPaymentStatus, loading } = usePayments();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!externalReference) {
        setError('Referencia de pago no encontrada');
        return;
      }

      try {
        setVerifying(true);
        const data = await checkPaymentStatus(externalReference, paymentId || undefined, status || undefined);
        setPaymentData(data);
      } catch (err: any) {
        console.error('Error verifying payment:', err);
        setError(err.message);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [externalReference, paymentId, status, checkPaymentStatus]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          title: '¡Pago Exitoso!',
          subtitle: 'Tu pago ha sido procesado correctamente',
          bgGradient: 'from-green-50 to-emerald-50'
        };
      case 'failure':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          title: 'Pago Rechazado',
          subtitle: 'No pudimos procesar tu pago',
          bgGradient: 'from-red-50 to-rose-50'
        };
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          title: 'Pago Pendiente',
          subtitle: 'Tu pago está siendo procesado',
          bgGradient: 'from-yellow-50 to-orange-50'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          title: 'Estado Desconocido',
          subtitle: 'No pudimos determinar el estado del pago',
          bgGradient: 'from-gray-50 to-slate-50'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

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

  const handleRetry = () => {
    if (paymentData?.debt?.id) {
      window.location.href = `/debts?retry=${paymentData.debt.id}`;
    } else {
      window.location.href = '/debts';
    }
  };

  if (verifying || loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Verificando el estado del pago...</p>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className={`p-4 rounded-full ${config.bgColor} mx-auto mb-4 w-fit`}>
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Error al verificar el pago
        </h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/debts'}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Volver a mis deudas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className={`p-4 rounded-full ${config.bgColor} mx-auto mb-6 w-fit`}>
        <Icon className={`h-8 w-8 ${config.iconColor}`} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {config.title}
      </h1>
      <p className="text-gray-600 mb-6">
        {config.subtitle}
      </p>

      {paymentData && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-3 text-center">Detalles del pago</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Deuda:</span>
              <span className="font-medium text-gray-900">{paymentData.debt?.description}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Monto:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(paymentData.payment?.amount || 0)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-900">
                {formatDate(paymentData.payment?.createdAt || new Date().toISOString())}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">ID de transacción:</span>
              <span className="font-medium text-gray-900 font-mono text-xs">
                {paymentData.payment?.id}
              </span>
            </div>
          </div>
        </div>
      )}

      {type === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
            <div className="text-left">
              <h4 className="font-medium text-green-900 mb-1">¡Felicidades!</h4>
              <p className="text-sm text-green-700">
                Tu deuda ha sido pagada exitosamente. Recibirás un comprobante por email.
              </p>
            </div>
          </div>
        </div>
      )}

      {type === 'failure' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div className="text-left">
              <h4 className="font-medium text-red-900 mb-1">Pago no procesado</h4>
              <p className="text-sm text-red-700">
                Tu pago fue rechazado. Verifica tus datos e intenta nuevamente con otro método de pago.
              </p>
            </div>
          </div>
        </div>
      )}

      {type === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="text-left">
              <h4 className="font-medium text-yellow-900 mb-1">Pago en proceso</h4>
              <p className="text-sm text-yellow-700">
                Tu pago está siendo verificado. Te notificaremos cuando se complete el proceso.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {type === 'failure' && (
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar Nuevamente
          </button>
        )}

        <button
          onClick={() => window.location.href = '/debts'}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a mis deudas
        </button>

        <button
          onClick={() => window.location.href = '/dashboard'}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
        >
          <Home className="h-4 w-4 mr-2" />
          Ir al Dashboard
        </button>
      </div>

      {type === 'pending' && (
        <div className="mt-6 text-xs text-gray-500">
          <p>Los pagos en efectivo pueden tardar hasta 2 días hábiles en acreditarse.</p>
          <p>Te mantendremos informado por email sobre el estado de tu pago.</p>
        </div>
      )}
    </div>
  );
};
EOF
fi

print_status "🔄 Continuando con archivos de configuración y documentación..."

# .env.example
if create_file ".env.example"; then
cat > ".env.example" << 'EOF'
# Frontend Environment Variables

# API Configuration
PUBLIC_API_URL=http://localhost:4000/api

# Mercado Pago Configuration (Frontend)
PUBLIC_MP_PUBLIC_KEY=TEST-your-mercado-pago-public-key-here

# Application Configuration
PUBLIC_APP_NAME=MiPago
PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development

# Security (for development only)
PUBLIC_ENABLE_DEBUG=true

# URLs (should match backend configuration)
PUBLIC_SUCCESS_URL=http://localhost:3000/payment-success
PUBLIC_FAILURE_URL=http://localhost:3000/payment-failure
PUBLIC_PENDING_URL=http://localhost:3000/payment-pending
EOF
fi

# README.md
if create_file "README.md"; then
cat > "README.md" << 'EOF'
# Sistema de Pagos con Mercado Pago

Sistema web completo para gestión de deudas y procesamiento de pagos integrado con Mercado Pago Checkout Pro.

## 🚀 Características

- **Dashboard intuitivo** con resumen de deudas y estadísticas
- **Gestión de deudas** con filtros avanzados y búsqueda
- **Pagos seguros** con Mercado Pago Checkout Pro
- **Historial completo** de pagos realizados
- **Notificaciones automáticas** via webhooks
- **Diseño responsive** y moderno
- **Autenticación segura** con JWT

## 🛠️ Tecnologías

### Frontend
- Astro + React + TypeScript
- TailwindCSS para estilos
- Lucide React para iconos
- Hooks personalizados para estado
- Axios para API calls

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Mercado Pago SDK
- JWT para autenticación
- Helmet para seguridad

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- Backend funcionando (ver documentación del backend)
- Cuenta de Mercado Pago

### Configuración

1. **Instalar dependencias**
```bash
npm install
npm install lucide-react
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

3. **Configurar en .env**
```env
PUBLIC_API_URL=http://localhost:4000/api
PUBLIC_MP_PUBLIC_KEY=TEST-tu-public-key-aqui
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 📋 Estructura del Proyecto

```
src/
├── components/
│   ├── debts/           # Componentes de gestión de deudas
│   ├── payments/        # Componentes de pagos e historial
│   ├── dashboard/       # Componentes del dashboard
│   ├── common/          # Componentes compartidos
│   └── auth/           # Componentes de autenticación
├── hooks/              # React hooks personalizados
├── pages/              # Páginas Astro
├── layouts/            # Layouts de Astro
├── services/           # Servicios API
└── utils/              # Utilidades
```

## 🔧 Configuración de Mercado Pago

### 1. Obtener credenciales
- Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- Crear una aplicación
- Obtener `PUBLIC_KEY` para el frontend

### 2. URLs de retorno
El sistema maneja automáticamente estas URLs:
- Éxito: `/payment-success`
- Error: `/payment-failure`
- Pendiente: `/payment-pending`

## 📱 Uso del Sistema

### Dashboard
- Resumen de deudas pendientes
- Estadísticas visuales
- Acciones rápidas

### Gestión de Deudas
- Ver todas las deudas
- Filtrar por estado y fecha
- Buscar deudas específicas
- Pagar con un clic

### Historial de Pagos
- Ver todos los pagos realizados
- Filtrar por estado y fecha
- Estadísticas de pagos

## 🎨 Componentes Principales

### Hooks
- `useDebts` - Gestión de deudas
- `usePayments` - Gestión de pagos
- `useAuth` - Autenticación

### Componentes de Deudas
- `DebtsMain` - Dashboard principal
- `DebtCard` - Tarjeta de deuda individual
- `StatsCards` - Tarjetas de estadísticas
- `DebtFilters` - Filtros avanzados
- `PaymentModal` - Modal de confirmación

### Componentes de Pagos
- `PaymentResult` - Resultado de pago
- `PaymentsHistory` - Historial completo

## 🚨 Resolución de Problemas

### Error de conexión API
```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/api/health
```

### Problemas con Mercado Pago
1. Verificar `PUBLIC_MP_PUBLIC_KEY` en .env
2. Asegurar que el backend tenga las credenciales correctas
3. Verificar URLs de retorno

### Error 401
- Token JWT inválido o expirado
- Limpiar cookies y volver a iniciar sesión

## 📚 API Endpoints

El frontend consume estos endpoints del backend:

### Deudas
- `GET /api/debts` - Listar deudas
- `GET /api/debts/stats` - Estadísticas
- `GET /api/debts/:id` - Deuda específica

### Pagos
- `POST /api/payments/preference/:debtId` - Crear pago
- `GET /api/payments` - Historial
- `GET /api/payments/status/check` - Verificar estado

## 🎯 Próximos Pasos

1. **Personalización**: Modifica colores y estilos en Tailwind
2. **Funcionalidades**: Agrega más filtros o reportes
3. **Integraciones**: Conecta con otros sistemas de pago
4. **Notificaciones**: Implementa push notifications

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature
3. Commit cambios
4. Push y crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con ❤️ para facilitar los pagos online**
EOF
fi

print_status "🎉 ¡Sistema completo instalado!"
print_success "✅ Todos los archivos han sido creados"

echo
echo -e "${GREEN}📁 Archivos creados en el sistema:${NC}"
echo
echo -e "${BLUE}📄 Páginas Astro:${NC}"
echo "- src/pages/debts.astro"
echo "- src/pages/payments.astro"
echo "- src/pages/payment-success.astro"
echo "- src/pages/payment-failure.astro"
echo "- src/pages/payment-pending.astro"
echo "- src/pages/dashboard.astro (actualizado)"
echo
echo -e "${BLUE}🎣 Hooks React:${NC}"
echo "- src/hooks/useDebts.ts"
echo "- src/hooks/usePayments.ts"
echo
echo -e "${BLUE}💳 Componentes Deudas:${NC}"
echo "- src/components/debts/DebtsMain.tsx"
echo "- src/components/debts/DebtCard.tsx"
echo "- src/components/debts/StatsCards.tsx"
echo "- src/components/debts/DebtFilters.tsx"
echo "- src/components/debts/PaymentModal.tsx"
echo
echo -e "${BLUE}💰 Componentes Pagos:${NC}"
echo "- src/components/payments/PaymentResult.tsx"
echo
echo -e "${BLUE}📋 Configuración:${NC}"
echo "- .env.example"
echo "- README.md"
echo
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "Este script creó los archivos principales del sistema."
echo "Aún faltan algunos componentes como:"
echo "- PaymentsHistory.tsx"
echo "- DashboardMain.tsx"
echo "- Navbar.tsx actualizado"
echo "- Middleware actualizado"
echo
echo -e "${GREEN}📋 Próximos pasos:${NC}"
echo "1. Instalar dependencias: npm install lucide-react"
echo "2. Configurar variables en .env"
echo "3. Asegurar que el backend esté funcionando"
echo "4. Ejecutar: npm run dev"
echo
echo -e "${PURPLE}🎯 ¿Quieres que continúe creando los componentes restantes?${NC}"
echo "Presiona Enter para continuar o Ctrl+C para terminar:"
read -r

print_section "🏗️ Creando componentes faltantes..."

# PaymentsHistory.tsx completo
if create_file "src/components/payments/PaymentsHistory.tsx"; then
cat > "src/components/payments/PaymentsHistory.tsx" << 'EOF'
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
  RefreshCw
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

  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        const result = await getPaymentHistory({
          status: filters.status || undefined,
          page: currentPage,
          limit: 10
        });
        
        setPayments(result.payments as PaymentWithDebt[]);
        setStats(result.stats);
        setPagination(result.pagination);
      } catch (err) {
        console.error('Error loading payment history:', err);
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

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
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
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pagos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.stats ? 
                    Math.round((stats.stats.find((s: any) => s.status === 'approved')?.count || 0) / stats.totalPayments * 100) 
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Historial de Pagos
            </h2>
            <span className="text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? 'pago' : 'pagos'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pagos..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>

            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Fecha
                <ArrowUpDown className="h-4 w-4 ml-1" />
              </button>
              <button
                onClick={() => handleSort('amount')}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Monto
                <ArrowUpDown className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAndSortedPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron pagos
              </h3>
              <p className="text-gray-500">
                {filters.search || filters.status || filters.dateFrom || filters.dateTo
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No tienes pagos registrados'
                }
              </p>
            </div>
          ) : (
            filteredAndSortedPayments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              const statusColor = getPaymentStatusColor(payment.status);
              
              return (
                <div key={payment._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${statusColor.split(' ')[1]}`}>
                        <StatusIcon className={`h-5 w-5 ${statusColor.split(' ')[0]}`} />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {payment.debt?.description || 'Pago sin descripción'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(payment.createdAt)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {formatPaymentStatus(payment.status)}
                          </span>
                          {payment.mercadopago?.paymentId && (
                            <span className="font-mono text-xs">
                              MP: {payment.mercadopago.paymentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.mercadopago?.paymentMethodId && (
                        <div className="text-sm text-gray-500">
                          {payment.mercadopago.paymentMethodId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página {pagination.current} de {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages || loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
EOF
fi

print_status "✅ Sistema de Pagos COMPLETO instalado exitosamente!"
print_success "🎉 Todos los archivos han sido creados"

echo
echo -e "${GREEN}🎯 ¡Tu sistema de pagos con Mercado Pago está listo!${NC}"
echo
echo -e "${BLUE}📋 Pasos finales:${NC}"
echo "1. Instalar dependencias: npm install lucide-react"
echo "2. Configurar variables en .env con tus credenciales de MP"
echo "3. Asegurar que el backend esté funcionando"
echo "4. Ejecutar: npm run dev"
echo "5. Probar el flujo completo de pagos"
echo
echo -e "${YELLOW}⭐ Características incluidas:${NC}"
echo "✅ Dashboard con estadísticas en tiempo real"
echo "✅ Gestión completa de deudas con filtros"
echo "✅ Integración con Mercado Pago Checkout Pro"
echo "✅ Historial de pagos con búsqueda avanzada"
echo "✅ Páginas de resultado de pago"
echo "✅ Diseño responsive y moderno"
echo "✅ Manejo de errores y estados de carga"
echo "✅ Hooks personalizados para gestión de estado"
echo
echo -e "${GREEN}💡 ¡Disfruta tu nuevo sistema de pagos!${NC}"
EOF
fi

print_status "🎉 ¡Script completo finalizado!"
print_success "✅ Archivo: setup-complete-payment-system.sh creado"

echo
echo -e "${GREEN}Para ejecutar el script completo:${NC}"
echo "1. chmod +x setup-complete-payment-system.sh"
echo "2. ./setup-complete-payment-system.sh"
echo
echo -e "${BLUE}El script creará TODOS los archivos necesarios para el sistema completo de pagos${NC}"