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
