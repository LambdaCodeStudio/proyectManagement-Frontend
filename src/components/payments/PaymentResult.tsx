import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Home,
  Download,
  Eye,
  CreditCard,
  Calendar,
  Hash,
  DollarSign,
  Sparkles
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
  const [showDetails, setShowDetails] = useState(false);

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
        console.log('✅ Payment data loaded:', data);
      } catch (err: any) {
        console.error('❌ Error verifying payment:', err);
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
          gradientFrom: 'from-green-500',
          gradientTo: 'to-emerald-600',
          title: '¡Pago Exitoso!',
          subtitle: 'Tu pago ha sido procesado correctamente',
          bgGradient: 'from-green-50 to-emerald-50',
          cardBorder: 'border-green-200',
          accentColor: 'green'
        };
      case 'failure':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          gradientFrom: 'from-red-500',
          gradientTo: 'to-rose-600',
          title: 'Pago Rechazado',
          subtitle: 'No pudimos procesar tu pago',
          bgGradient: 'from-red-50 to-rose-50',
          cardBorder: 'border-red-200',
          accentColor: 'red'
        };
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          gradientFrom: 'from-yellow-500',
          gradientTo: 'to-orange-600',
          title: 'Pago Pendiente',
          subtitle: 'Tu pago está siendo procesado',
          bgGradient: 'from-yellow-50 to-orange-50',
          cardBorder: 'border-yellow-200',
          accentColor: 'yellow'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          gradientFrom: 'from-gray-500',
          gradientTo: 'to-slate-600',
          title: 'Estado Desconocido',
          subtitle: 'No pudimos determinar el estado del pago',
          bgGradient: 'from-gray-50 to-slate-50',
          cardBorder: 'border-gray-200',
          accentColor: 'gray'
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
      month: 'long',
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

  const handleDownloadReceipt = () => {
    // Simular descarga de comprobante
    console.log('📄 Descargando comprobante...');
    // Aquí iría la lógica real para generar y descargar el PDF
  };

  // Loading state mejorado
  if (verifying || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="gradient-card rounded-2xl p-8 text-center card-hover">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full gradient-purple animate-pulse mx-auto flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">
              Verificando tu pago...
            </h1>
            <p className="text-gray-300 text-sm">
              Estamos confirmando el estado de tu transacción
            </p>
            
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white/30 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state mejorado
  if (error && !paymentData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="gradient-card rounded-2xl p-8 text-center card-hover">
            <div className="w-20 h-20 rounded-full bg-red-500/20 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">
              Error al verificar el pago
            </h1>
            <p className="text-gray-300 mb-6 text-sm">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </button>
              <button
                onClick={() => window.location.href = '/debts'}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-medium border border-white/20"
              >
                Volver a mis deudas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main success/failure/pending UI
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="gradient-card rounded-2xl overflow-hidden card-hover">
          {/* Header con gradiente */}
          <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-8 text-center`}>
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-10 h-10 text-white" />
              </div>
              {type === 'success' && (
                <div className="absolute -top-2 -right-8">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {config.title}
            </h1>
            <p className="text-white/80">
              {config.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status Message */}
            {type === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">¡Felicidades!</h4>
                    <p className="text-sm text-green-700">
                      Tu deuda ha sido pagada exitosamente. Ya puedes descargar tu comprobante y recibirás confirmación por email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {type === 'failure' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Pago no procesado</h4>
                    <p className="text-sm text-red-700">
                      Tu pago fue rechazado. Verifica tus datos de tarjeta o intenta con otro método de pago.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {type === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Pago en proceso</h4>
                    <p className="text-sm text-yellow-700">
                      Tu pago está siendo verificado. Te notificaremos por email cuando se complete el proceso.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            {paymentData && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                    Detalles del pago
                  </h3>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showDetails ? 'Ocultar' : 'Ver más'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 text-sm flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Concepto:
                    </span>
                    <span className="font-medium text-gray-900 text-right">
                      {paymentData.debt?.description || 'Pago de deuda'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 text-sm flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Monto:
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(paymentData.payment?.amount || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha:
                    </span>
                    <span className="font-medium text-gray-900 text-right">
                      {formatDate(paymentData.payment?.createdAt || new Date().toISOString())}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 text-sm">
                      Estado:
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      type === 'success' ? 'bg-green-100 text-green-800' :
                      type === 'failure' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {type === 'success' ? 'Aprobado' : 
                       type === 'failure' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>ID de transacción:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {paymentData.payment?.id || 'N/A'}
                        </span>
                      </div>
                      {externalReference && (
                        <div className="flex justify-between">
                          <span>Referencia externa:</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {externalReference}
                          </span>
                        </div>
                      )}
                      {paymentId && (
                        <div className="flex justify-between">
                          <span>ID MercadoPago:</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {paymentId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {type === 'success' && (
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-center transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Descargar Comprobante
                </button>
              )}

              {type === 'failure' && (
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-center transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Intentar Nuevamente
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => window.location.href = '/debts'}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Mis Deudas
                </button>

                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
              </div>
            </div>

            {/* Additional Info */}
            {type === 'pending' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">Información importante:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Los pagos en efectivo pueden tardar hasta 2 días hábiles</li>
                  <li>• Te notificaremos por email sobre cualquier cambio</li>
                  <li>• Puedes consultar el estado en tu historial de pagos</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">
            ¿Necesitas ayuda? Contacta nuestro soporte en soporte@ejemplo.com
          </p>
        </div>
      </div>
    </div>
  );
};