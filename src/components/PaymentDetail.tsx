import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Calendar, CreditCard, DollarSign, Tag, Edit, Trash2, User, FileText, Check } from 'lucide-react';

interface Pago {
  _id: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
  monto: number;
  fechaPago: string;
  periodoFacturado: {
    inicio: string;
    fin: string;
  };
  metodoPago: 'transferencia' | 'tarjeta' | 'efectivo' | 'deposito' | 'otro';
  comprobantePago?: string;
  comentarios?: string;
  registradoPor?: {
    _id: string;
    email: string;
  };
  facturado: boolean;
  numeroFactura?: string;
  fechaFactura?: string;
}

interface PaymentDetailProps {
  id: string;
}

export const PaymentDetail = ({ id }: PaymentDetailProps) => {
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marcarComoFacturado, setMarcarComoFacturado] = useState(false);
  const [numeroFactura, setNumeroFactura] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    // Skip API call if the ID is "nuevo" - this is a special route, not an actual payment ID
    if (id === "nuevo") {
      setLoading(false);
      // Redirect to the form instead
      window.location.href = '/pagos/nuevo';
      return;
    }
    
    fetchPago();
  }, [id]);

  const fetchPago = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Pago>(`/pagos/${id}`);
      setPago(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar pago:', err);
      setError(err.message || 'Error al cargar pago');
      setLoading(false);
    }
  };

  // Direct navigation functions
  const handleBack = () => {
    window.location.href = '/pagos';
  };
  
  const handleEdit = (pagoId: string) => {
    window.location.href = `/pagos/nuevo?id=${pagoId}`;
  };
  
  const handleNavigateToClient = (clientId: string) => {
    window.location.href = `/clientes/${clientId}`;
  };
  
  const handleCreateInvoice = (clientId: string, pagoId: string) => {
    window.location.href = `/facturas/nuevo?clientId=${clientId}&pagoId=${pagoId}`;
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de eliminar este pago? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setProcessingAction(true);
      await apiService.delete(`/pagos/${id}`);
      handleBack();
    } catch (err: any) {
      console.error('Error al eliminar pago:', err);
      setError(err.message || 'Error al eliminar pago');
      setProcessingAction(false);
    }
  };

  const handleFacturarPago = async () => {
    if (!numeroFactura.trim()) {
      setError('Por favor ingrese un número de factura válido');
      return;
    }
    
    try {
      setProcessingAction(true);
      const updatedPago = await apiService.put(`/pagos/${id}/facturar`, {
        numeroFactura,
        fechaFactura: new Date().toISOString()
      });
      
      setPago(updatedPago);
      setMarcarComoFacturado(false);
      setProcessingAction(false);
    } catch (err: any) {
      console.error('Error al facturar pago:', err);
      setError(err.message || 'Error al facturar pago');
      setProcessingAction(false);
    }
  };

  const getMetodoPagoLabel = (metodo: string) => {
    switch (metodo) {
      case 'transferencia':
        return 'Transferencia Bancaria';
      case 'tarjeta':
        return 'Tarjeta de Crédito/Débito';
      case 'efectivo':
        return 'Efectivo';
      case 'deposito':
        return 'Depósito Bancario';
      case 'otro':
        return 'Otro Método';
      default:
        return metodo;
    }
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'transferencia':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'tarjeta':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'efectivo':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'deposito':
        return <DollarSign className="h-5 w-5 text-amber-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando pago...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a Pagos
        </button>
      </div>
    );
  }

  if (!pago) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
        <h3 className="font-bold">Pago no encontrado</h3>
        <button 
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a Pagos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pago #{pago._id.substring(pago._id.length - 6)}</h1>
          <p className="text-gray-500">
            Cliente: {pago.idCliente?.nombre || 'No disponible'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => handleEdit(pago._id)}
            className="p-2 text-blue-500 hover:text-blue-700"
            title="Editar"
            disabled={processingAction}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:text-red-700"
            title="Eliminar"
            disabled={processingAction}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Detalles del pago */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row mb-6">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Pago</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Monto</p>
                    <p className="font-bold text-lg">${pago.monto.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Pago</p>
                    <p>{new Date(pago.fechaPago).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3">
                    {getMetodoPagoIcon(pago.metodoPago)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de Pago</p>
                    <p>{getMetodoPagoLabel(pago.metodoPago)}</p>
                  </div>
                </div>
                
                {pago.registradoPor && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Registrado por</p>
                      <p>{pago.registradoPor.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-8 md:border-l md:border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Periodo Facturado</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Desde</p>
                    <p>{new Date(pago.periodoFacturado.inicio).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Hasta</p>
                    <p>{new Date(pago.periodoFacturado.fin).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {pago.facturado ? (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Factura</p>
                      <p className="font-medium">{pago.numeroFactura}</p>
                      {pago.fechaFactura && (
                        <p className="text-sm text-gray-500">
                          Emitida el {new Date(pago.fechaFactura).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Estado de Facturación</p>
                      <p className="font-medium text-yellow-600">Pendiente de Facturar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Comentarios */}
          {pago.comentarios && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Comentarios</h3>
              <p className="text-gray-700">{pago.comentarios}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Acciones */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleNavigateToClient(pago.idCliente._id)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={processingAction}
          >
            <User className="h-5 w-5 mr-2" />
            Ver Cliente
          </button>
          
          {!pago.facturado ? (
            marcarComoFacturado ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Número de factura"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleFacturarPago}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={processingAction}
                >
                  <Check className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMarcarComoFacturado(true)}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={processingAction}
              >
                <FileText className="h-5 w-5 mr-2" />
                Marcar como Facturado
              </button>
            )
          ) : (
            <button
              onClick={() => handleCreateInvoice(pago.idCliente._id, pago._id)}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={processingAction}
            >
              <FileText className="h-5 w-5 mr-2" />
              Ver Factura
            </button>
          )}
        </div>
      </div>
      
      {/* Botón volver */}
      <div className="flex justify-start mb-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Volver a Pagos
        </button>
      </div>
    </div>
  );
};