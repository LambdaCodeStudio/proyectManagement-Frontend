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
