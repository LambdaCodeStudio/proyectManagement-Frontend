import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Calendar, CreditCard, DollarSign, User, FileText, ChevronRight, Check, X } from 'lucide-react';

interface Pago {
  _id: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
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
  facturado: boolean;
  numeroFactura?: string;
  fechaFactura?: string;
}

export const PaymentList = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<Pago[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set default date range for current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const [fechaInicio, setFechaInicio] = useState(firstDay.toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(lastDay.toISOString().split('T')[0]);

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      
      // Pass query parameters correctly - this is the key fix
      const response = await apiService.get('/pagos/reporte', {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      });
      
      // Handle the response format from the report endpoint
      let data: Pago[] = [];
      
      if (response && response.pagos && Array.isArray(response.pagos)) {
        data = response.pagos;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        console.warn('Formato de respuesta inesperado:', response);
      }
      
      setPagos(data);
      setPagosFiltrados(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar pagos:', err);
      setError(err.message || 'Error al cargar pagos');
      setLoading(false);
    }
  };

  // Direct navigation functions
  const handleSelectPayment = (paymentId: string) => {
    window.location.href = `/pagos/${paymentId}`;
  };

  const handleCreatePayment = () => {
    window.location.href = '/pagos/nuevo';
  };
  
  const handleGenerateReport = () => {
    window.location.href = '/pagos/reporte';
  };

  const filtrarPagos = (filtroTipo: string) => {
    setFiltro(filtroTipo);
    
    if (filtroTipo === 'todos') {
      setPagosFiltrados(pagos);
      return;
    }
    
    if (filtroTipo === 'facturados') {
      setPagosFiltrados(pagos.filter(p => p.facturado));
      return;
    }
    
    if (filtroTipo === 'no-facturados') {
      setPagosFiltrados(pagos.filter(p => !p.facturado));
      return;
    }
    
    // Filter by payment method
    setPagosFiltrados(pagos.filter(p => p.metodoPago === filtroTipo));
  };

  const getMetodoPagoLabel = (metodo: string) => {
    switch (metodo) {
      case 'transferencia':
        return 'Transferencia';
      case 'tarjeta':
        return 'Tarjeta';
      case 'efectivo':
        return 'Efectivo';
      case 'deposito':
        return 'Depósito';
      case 'otro':
        return 'Otro';
      default:
        return metodo;
    }
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'transferencia':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'tarjeta':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'efectivo':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'deposito':
        return <DollarSign className="h-4 w-4 text-amber-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleApplyDateFilter = () => {
    fetchPagos();
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando pagos...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchPagos}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Calculate total for displayed payments
  const totalMonto = pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Generar Reporte
          </button>
          <button 
            onClick={handleCreatePayment}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Date filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button 
            onClick={handleApplyDateFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => filtrarPagos('todos')}
            className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => filtrarPagos('facturados')}
            className={`px-4 py-2 rounded ${filtro === 'facturados' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Facturados
          </button>
          <button 
            onClick={() => filtrarPagos('no-facturados')}
            className={`px-4 py-2 rounded ${filtro === 'no-facturados' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Sin Facturar
          </button>
          <button 
            onClick={() => filtrarPagos('transferencia')}
            className={`px-4 py-2 rounded ${filtro === 'transferencia' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Transferencias
          </button>
          <button 
            onClick={() => filtrarPagos('tarjeta')}
            className={`px-4 py-2 rounded ${filtro === 'tarjeta' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            Tarjetas
          </button>
          <button 
            onClick={() => filtrarPagos('efectivo')}
            className={`px-4 py-2 rounded ${filtro === 'efectivo' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Efectivo
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-sm">Total mostrado:</span>
            <p className="text-2xl font-bold">${totalMonto.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Cantidad de pagos:</span>
            <p className="text-2xl font-bold">{pagosFiltrados.length}</p>
          </div>
        </div>
      </div>

      {/* Lista de pagos */}
      {pagosFiltrados.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay pagos con los filtros seleccionados</p>
          <button 
            onClick={() => filtrarPagos('todos')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ver Todos los Pagos
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {pagosFiltrados.map(pago => (
              <li key={pago._id} className="hover:bg-gray-50">
                <button 
                  onClick={() => handleSelectPayment(pago._id)} 
                  className="block w-full text-left p-0"
                >
                  <div className="p-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getMetodoPagoIcon(pago.metodoPago)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h2 className="text-lg font-medium text-gray-900">${pago.monto.toFixed(2)}</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getMetodoPagoLabel(pago.metodoPago)}
                            </span>
                            {pago.facturado ? (
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Facturado
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                                <X className="h-3 w-3 mr-1" />
                                Sin Facturar
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>
                              Periodo: {new Date(pago.periodoFacturado.inicio).toLocaleDateString()} - {new Date(pago.periodoFacturado.fin).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          <span>{pago.idCliente?.nombre || 'Cliente no disponible'}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Pagado: {new Date(pago.fechaPago).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm">
                      {pago.facturado && pago.numeroFactura && (
                        <div className="flex items-center text-blue-600">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>Factura: {pago.numeroFactura}</span>
                        </div>
                      )}
                      
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};