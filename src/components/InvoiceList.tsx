import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { FileText, Calendar, User, ChevronRight, AlertTriangle } from 'lucide-react';

interface Factura {
  _id: string;
  numeroFactura: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
  };
  idProyecto?: {
    _id: string;
    nombre: string;
  };
  subtotal: number;
  impuestos: number;
  total: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
}

// Removed props interface since we'll handle navigation internally
export const InvoiceList = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState<Factura[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Factura[]>('/facturas');
      setFacturas(data);
      setFacturasFiltradas(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar facturas:', err);
      setError(err.message || 'Error al cargar facturas');
      setLoading(false);
    }
  };

  // Direct navigation functions
  const handleSelectInvoice = (invoiceId: string) => {
    window.location.href = `/facturas/${invoiceId}`;
  };

  const handleCreateInvoice = () => {
    window.location.href = '/facturas/nuevo';
  };

  const filtrarFacturas = (filtroEstado: string) => {
    setFiltro(filtroEstado);
    
    if (filtroEstado === 'todas') {
      setFacturasFiltradas(facturas);
      return;
    }
    
    if (filtroEstado === 'vencidas') {
      const hoy = new Date();
      const vencidas = facturas.filter(f => 
        new Date(f.fechaVencimiento) < hoy && f.estado === 'pendiente'
      );
      setFacturasFiltradas(vencidas);
      return;
    }
    
    setFacturasFiltradas(facturas.filter(f => f.estado === filtroEstado));
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'pagada':
        return 'Pagada';
      case 'vencida':
        return 'Vencida';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  // Verificar si una factura está vencida
  const isFacturaVencida = (factura: Factura) => {
    return new Date(factura.fechaVencimiento) < new Date() && factura.estado === 'pendiente';
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando facturas...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchFacturas}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
        <button 
          onClick={handleCreateInvoice}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nueva Factura
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => filtrarFacturas('todas')}
            className={`px-4 py-2 rounded ${filtro === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => filtrarFacturas('pendiente')}
            className={`px-4 py-2 rounded ${filtro === 'pendiente' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => filtrarFacturas('pagada')}
            className={`px-4 py-2 rounded ${filtro === 'pagada' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Pagadas
          </button>
          <button 
            onClick={() => filtrarFacturas('vencidas')}
            className={`px-4 py-2 rounded ${filtro === 'vencidas' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Vencidas
          </button>
          <button 
            onClick={() => filtrarFacturas('cancelada')}
            className={`px-4 py-2 rounded ${filtro === 'cancelada' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* Lista de facturas */}
      {facturasFiltradas.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay facturas con los filtros seleccionados</p>
          <button 
            onClick={() => filtrarFacturas('todas')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ver Todas las Facturas
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {facturasFiltradas.map(factura => (
              <li key={factura._id} className="hover:bg-gray-50">
                <button 
                  onClick={() => handleSelectInvoice(factura._id)} 
                  className="block w-full text-left p-0"
                >
                  <div className="p-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h2 className="text-lg font-medium text-blue-600">{factura.numeroFactura}</h2>
                            {isFacturaVencida(factura) && (
                              <span className="ml-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <p>
                              {factura.idProyecto?.nombre 
                                ? `Proyecto: ${factura.idProyecto.nombre}` 
                                : 'Sin proyecto asociado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs rounded-full ${getBadgeClass(factura.estado)}`}>
                          {getEstadoLabel(factura.estado)}
                        </span>
                        <p className="mt-1 text-xl font-bold">${factura.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{factura.idCliente?.nombre || 'Cliente no disponible'}</span>
                      </div>
                      
                      <div className="flex space-x-4 text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Emisión: {new Date(factura.fechaEmision).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className={isFacturaVencida(factura) ? 'text-red-600 font-medium' : ''}>
                            Vencimiento: {new Date(factura.fechaVencimiento).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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