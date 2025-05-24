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
