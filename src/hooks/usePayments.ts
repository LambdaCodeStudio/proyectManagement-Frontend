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
      console.log('💳 === CREANDO PREFERENCIA DE PAGO ===', debtId);
      setLoading(true);
      setError(null);

      const response = await apiService.post<PaymentPreferenceResponse>(`/payments/preference/${debtId}`);
      console.log('📊 Respuesta preferencia completa:', response);
      
      // Manejar diferentes estructuras de respuesta
      if (response.status === 'success' && response.data) {
        console.log('✅ Preferencia creada exitosamente');
        return response.data;
      } else if (response.status === 'success' && !response.data && response.preferenceId) {
        // Si la respuesta tiene la preferencia directamente
        console.log('✅ Preferencia en respuesta directa');
        return response as any;
      } else {
        throw new Error(response.message || 'Error al crear preferencia de pago');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear preferencia de pago';
      console.error('❌ Error creando preferencia:', errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPayment = useCallback(async (paymentId: string): Promise<Payment> => {
    try {
      console.log('🔍 === OBTENIENDO PAGO ===', paymentId);
      setLoading(true);
      setError(null);

      const response = await apiService.get<PaymentResponse>(`/payments/${paymentId}`);
      console.log('📊 Respuesta pago completa:', response);
      
      if (response.status === 'success' && response.data) {
        console.log('✅ Pago obtenido exitosamente');
        return response.data;
      } else if (response._id || response.id) {
        // Si la respuesta tiene el pago directamente
        console.log('✅ Pago en respuesta directa');
        return response as any;
      } else {
        throw new Error('Error al obtener información del pago');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener el pago';
      console.error('❌ Error obteniendo pago:', errorMessage, err);
      setError(errorMessage);
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
      console.log('📋 === OBTENIENDO HISTORIAL DE PAGOS ===', options);
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
      
      console.log('📊 Respuesta historial completa:', response);
      
      // Manejar diferentes estructuras de respuesta
      if (response.status === 'success' && response.data) {
        console.log('✅ Historial obtenido exitosamente (estructura con data)');
        return response.data;
      } else if (response.payments && Array.isArray(response.payments)) {
        // Si la respuesta tiene los pagos directamente
        console.log('✅ Historial obtenido exitosamente (estructura directa)');
        return {
          payments: response.payments,
          pagination: response.pagination || {
            current: 1,
            pages: 1,
            total: response.payments.length,
            limit: options.limit || 10
          },
          stats: response.stats || {
            totalPayments: response.payments.length,
            totalAmount: response.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
            stats: []
          }
        };
      } else {
        throw new Error('Error al obtener historial de pagos');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener historial de pagos';
      console.error('❌ Error obteniendo historial:', errorMessage, err);
      setError(errorMessage);
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
      console.log('🔍 === VERIFICANDO ESTADO DE PAGO ===', { externalReference, paymentId, status });
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ external_reference: externalReference });
      if (paymentId) params.append('payment_id', paymentId);
      if (status) params.append('status', status);

      const response = await apiService.get<PaymentStatusResponse>(
        `/payments/status/check?${params.toString()}`
      );
      
      console.log('📊 Respuesta estado completa:', response);
      
      if (response.status === 'success' && response.data) {
        console.log('✅ Estado verificado exitosamente');
        return response.data;
      } else if (response.payment && response.debt) {
        // Si la respuesta tiene los datos directamente
        console.log('✅ Estado en respuesta directa');
        return {
          payment: response.payment,
          debt: response.debt
        };
      } else {
        throw new Error('Error al verificar estado del pago');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al verificar el pago';
      console.error('❌ Error verificando estado:', errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPayment = useCallback(async (paymentId: string, reason?: string): Promise<boolean> => {
    try {
      console.log('❌ === CANCELANDO PAGO ===', paymentId, reason);
      setLoading(true);
      setError(null);

      const response = await apiService.post(`/payments/${paymentId}/cancel`, { reason });
      console.log('📊 Respuesta cancelación:', response);
      
      const success = response.status === 'success';
      console.log(success ? '✅ Pago cancelado' : '❌ Error cancelando pago');
      return success;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cancelar el pago';
      console.error('❌ Error cancelando pago:', errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const retryPayment = useCallback(async (paymentId: string): Promise<PaymentPreference> => {
    try {
      console.log('🔄 === REINTENTANDO PAGO ===', paymentId);
      setLoading(true);
      setError(null);

      const response = await apiService.post<PaymentPreferenceResponse>(`/payments/${paymentId}/retry`);
      console.log('📊 Respuesta reintento:', response);
      
      if (response.status === 'success' && response.data) {
        console.log('✅ Reintento exitoso');
        return response.data;
      } else if (response.preferenceId) {
        // Si la respuesta tiene la preferencia directamente
        return response as any;
      } else {
        throw new Error(response.message || 'Error al reintentar el pago');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al reintentar el pago';
      console.error('❌ Error reintentando pago:', errorMessage, err);
      setError(errorMessage);
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
      console.log('💰 === SOLICITANDO REEMBOLSO ===', { paymentId, reason, amount });
      setLoading(true);
      setError(null);

      const response = await apiService.post(`/payments/${paymentId}/refund`, { 
        reason, 
        amount 
      });
      
      console.log('📊 Respuesta reembolso:', response);
      const success = response.status === 'success';
      console.log(success ? '✅ Reembolso solicitado' : '❌ Error solicitando reembolso');
      return success;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al solicitar reembolso';
      console.error('❌ Error solicitando reembolso:', errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToMercadoPago = useCallback((preference: PaymentPreference) => {
    const url = import.meta.env.DEV 
      ? preference.sandboxInitPoint 
      : preference.initPoint;
    
    console.log('🔄 === REDIRIGIENDO A MERCADOPAGO ===');
    console.log('🌐 URL:', url);
    console.log('🏷️ Preference ID:', preference.preferenceId);
    
    if (url) {
      // Agregar parámetros adicionales para tracking
      const urlWithParams = new URL(url);
      urlWithParams.searchParams.append('source', 'webapp');
      urlWithParams.searchParams.append('timestamp', Date.now().toString());
      
      console.log('✅ Redirigiendo a:', urlWithParams.toString());
      window.location.href = urlWithParams.toString();
    } else {
      const error = 'URL de pago no disponible';
      console.error('❌', error);
      setError(error);
      throw new Error(error);
    }
  }, []);

  const processPayment = useCallback(async (debtId: string): Promise<void> => {
    try {
      console.log('💳 === PROCESANDO PAGO COMPLETO ===', debtId);
      const preference = await createPaymentPreference(debtId);
      redirectToMercadoPago(preference);
    } catch (err) {
      console.error('❌ Error procesando pago:', err);
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

  // Función para exportar datos a CSV
  const exportToCSV = useCallback(async (filters: any = {}) => {
    try {
      console.log('📥 === EXPORTANDO A CSV ===', filters);
      setLoading(true);
      
      // Obtener todos los pagos sin paginación
      const allPayments = await getPaymentHistory({
        ...filters,
        limit: 1000 // Obtener hasta 1000 registros
      });
      
      // Generar CSV
      const headers = ['Fecha', 'Concepto', 'Monto', 'Estado', 'Método de Pago', 'ID Transacción'];
      const csvContent = [
        headers.join(','),
        ...allPayments.payments.map(payment => [
          new Date(payment.createdAt).toLocaleDateString('es-AR'),
          `"${payment.debt?.description || 'N/A'}"`,
          payment.amount,
          formatPaymentStatus(payment.status),
          payment.mercadopago?.paymentMethodId || 'N/A',
          payment._id
        ].join(','))
      ].join('\n');
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historial-pagos-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      console.log('✅ Archivo CSV descargado exitosamente');
    } catch (err: any) {
      console.error('❌ Error exportando CSV:', err);
      setError('Error al exportar datos');
    } finally {
      setLoading(false);
    }
  }, [getPaymentHistory, formatPaymentStatus]);

  // Función de debugging
  const debugPayments = useCallback(() => {
    console.log('🔧 === DEBUG usePayments ===');
    console.log('⏳ Loading:', loading);
    console.log('❌ Error:', error);
    console.log('🔧 === FIN DEBUG ===');
  }, [loading, error]);

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
    getPaymentStatusColor,
    exportToCSV,
    debugPayments
  };
};