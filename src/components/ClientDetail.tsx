import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Calendar, Mail, Phone, Tag, Edit, Trash2, AlertTriangle, CreditCard, FileText } from 'lucide-react';

interface Cliente {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  programaAdquirido: 'odontoCare' | 'cleanOrg' | 'distributionAdmin';
  fechaInicio: string;
  plan: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  estado: 'activo' | 'inactivo' | 'suspendido';
  montoEstablecido: number;
  gastoRealMensual: number;
  fechaProximoPago?: string;
  fechaUltimoPago?: string;
  diasGracia: number;
  recordatorioEnviado?: boolean;
  avisoSuspensionEnviado?: boolean;
  tokenAcceso?: string;
  tokenActivo?: boolean;
  cobrosExtraordinarios?: string[];
  historialPagos?: string[];
}

interface CobroExtraordinario {
  _id: string;
  idCliente: string;
  monto: number;
  fecha: string;
  descripcion: string;
  cobrado: boolean;
}

interface Pago {
  _id: string;
  idCliente: string;
  monto: number;
  fecha: string;
  periodoPagado: {
    inicio: string;
    fin: string;
  };
  metodoPago: string;
  comprobante?: string;
  notas?: string;
}

interface ClientDetailProps {
  id: string;
}

export const ClientDetail = ({ id }: ClientDetailProps) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cobrosExtraordinarios, setCobrosExtraordinarios] = useState<CobroExtraordinario[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Skip API call if the ID is "nuevo" - this is a special route, not an actual client ID
    if (id === "nuevo") {
      setLoading(false);
      // Redirect to the form instead
      window.location.href = '/clientes/nuevo';
      return;
    }
    
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del cliente
      const clienteData = await apiService.get<Cliente>(`/cliente/${id}`);
      setCliente(clienteData);
      
      // Intentar cargar cobros extraordinarios si están disponibles
      try {
        const cobrosData = await apiService.get<CobroExtraordinario[]>(`/cobrosExtraOrdinarios/cliente/${id}`);
        setCobrosExtraordinarios(cobrosData);
      } catch (err) {
        console.warn('No se pudieron cargar los cobros extraordinarios', err);
        setCobrosExtraordinarios([]);
      }
      
      // Intentar cargar pagos si están disponibles
      try {
        const pagosData = await apiService.get<Pago[]>(`/pagos/cliente/${id}`);
        setPagos(pagosData);
      } catch (err) {
        console.warn('No se pudieron cargar los pagos', err);
        setPagos([]);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar datos del cliente:', err);
      setError(err.message || 'Error al cargar datos del cliente');
      setLoading(false);
    }
  };

  // Direct navigation functions
  const handleBack = () => {
    window.location.href = '/clientes';
  };
  
  const handleEdit = (clientId: string) => {
    window.location.href = `/clientes/nuevo?id=${clientId}`;
  };
  
  const handleCreateInvoice = (clientId: string) => {
    window.location.href = `/facturas/nuevo?clientId=${clientId}`;
  };
  
  const handleRegisterPayment = (clientId: string) => {
    window.location.href = `/pagos/nuevo?clientId=${clientId}`;
  };
  
  const handleAddExtraCharge = (clientId: string) => {
    window.location.href = `/cobros/nuevo?clientId=${clientId}`;
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await apiService.delete(`/cliente/${id}`);
      handleBack();
    } catch (err: any) {
      console.error('Error al eliminar cliente:', err);
      setError(err.message || 'Error al eliminar cliente');
    }
  };

  const updateEstado = async (nuevoEstado: string) => {
    try {
      const updatedCliente = await apiService.put<Cliente>(`/cliente/${id}`, {
        estado: nuevoEstado
      });
      
      setCliente(updatedCliente);
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      setError(err.message || 'Error al actualizar estado');
    }
  };

  const getPrograma = (programa: string) => {
    switch (programa) {
      case 'odontoCare':
        return 'OdontoCare';
      case 'cleanOrg':
        return 'CleanOrg';
      case 'distributionAdmin':
        return 'DistributionAdmin';
      default:
        return programa;
    }
  };

  const getPlan = (plan: string) => {
    switch (plan) {
      case 'mensual':
        return 'Mensual';
      case 'trimestral':
        return 'Trimestral';
      case 'semestral':
        return 'Semestral';
      case 'anual':
        return 'Anual';
      default:
        return plan;
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'suspendido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPagoVencido = () => {
    if (!cliente || !cliente.fechaProximoPago) return false;
    
    const hoy = new Date();
    const fechaLimite = new Date(cliente.fechaProximoPago);
    fechaLimite.setDate(fechaLimite.getDate() + cliente.diasGracia);
    
    return hoy > fechaLimite;
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando cliente...</div>;
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
          Volver a Clientes
        </button>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
        <h3 className="font-bold">Cliente no encontrado</h3>
        <button 
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{cliente.nombre}</h1>
            <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeClass(cliente.estado)}`}>
              {cliente.estado.charAt(0).toUpperCase() + cliente.estado.slice(1)}
            </span>
            {isPagoVencido() && (
              <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Pago vencido</span>
              </div>
            )}
          </div>
          <p className="text-gray-500">
            {getPrograma(cliente.programaAdquirido)} - Plan {getPlan(cliente.plan)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => handleEdit(cliente._id)}
            className="p-2 text-blue-500 hover:text-blue-700"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Información del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Información básica */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{cliente.email}</span>
              </div>
              <div className="flex items-center mb-2">
                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{cliente.telefono}</span>
              </div>
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  Cliente desde: {new Date(cliente.fechaInicio).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div>
              <div className="mb-2">
                <span className="text-gray-500 block text-sm">Programa:</span>
                <span className="text-gray-900">{getPrograma(cliente.programaAdquirido)}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500 block text-sm">Plan de Pago:</span>
                <span className="text-gray-900">{getPlan(cliente.plan)}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500 block text-sm">Monto Mensual:</span>
                <span className="text-gray-900 font-bold">${cliente.montoEstablecido.toFixed(2)}</span>
              </div>
              {cliente.gastoRealMensual > 0 && (
                <div className="mb-2">
                  <span className="text-gray-500 block text-sm">Gasto Real Mensual:</span>
                  <span className="text-gray-900">${cliente.gastoRealMensual.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Estado de pagos */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-md font-bold text-gray-900 mb-3">Estado de Pagos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <span className="text-gray-500 block text-sm">Próximo Pago:</span>
                  <span className={`${isPagoVencido() ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                    {cliente.fechaProximoPago 
                      ? new Date(cliente.fechaProximoPago).toLocaleDateString() 
                      : 'No establecido'}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-500 block text-sm">Último Pago:</span>
                  <span className="text-gray-900">
                    {cliente.fechaUltimoPago 
                      ? new Date(cliente.fechaUltimoPago).toLocaleDateString() 
                      : 'No registrado'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="mb-2">
                  <span className="text-gray-500 block text-sm">Días de gracia:</span>
                  <span className="text-gray-900">{cliente.diasGracia} días</span>
                </div>
                {cliente.tokenAcceso && (
                  <div className="mb-2">
                    <span className="text-gray-500 block text-sm">Token de acceso:</span>
                    <span className={`${cliente.tokenActivo ? 'text-green-600' : 'text-red-600'}`}>
                      {cliente.tokenActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => handleRegisterPayment(cliente._id)}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Registrar Pago
            </button>
            
            <button
              onClick={() => handleCreateInvoice(cliente._id)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FileText className="h-5 w-5 mr-2" />
              Crear Factura
            </button>
            
            <button
              onClick={() => handleAddExtraCharge(cliente._id)}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <Tag className="h-5 w-5 mr-2" />
              Agregar Cobro Extra
            </button>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Cambiar Estado</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateEstado('activo')}
                  className={`flex-1 px-3 py-1 rounded ${cliente.estado === 'activo' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                >
                  Activo
                </button>
                <button
                  onClick={() => updateEstado('suspendido')}
                  className={`flex-1 px-3 py-1 rounded ${cliente.estado === 'suspendido' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                >
                  Suspendido
                </button>
                <button
                  onClick={() => updateEstado('inactivo')}
                  className={`flex-1 px-3 py-1 rounded ${cliente.estado === 'inactivo' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Inactivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cobros extraordinarios */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Cobros Extraordinarios</h2>
        
        {cobrosExtraordinarios.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No hay cobros extraordinarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cobrosExtraordinarios.map(cobro => (
                  <tr key={cobro._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cobro.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {cobro.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${cobro.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${cobro.cobrado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {cobro.cobrado ? 'Cobrado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Historial de pagos */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Historial de Pagos</h2>
        
        {pagos.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No hay pagos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagos.map(pago => (
                  <tr key={pago._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pago.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.periodoPagado ? 
                        `${new Date(pago.periodoPagado.inicio).toLocaleDateString()} - ${new Date(pago.periodoPagado.fin).toLocaleDateString()}` : 
                        'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.metodoPago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${pago.monto.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};