import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { CheckCircle, XCircle, Pause, Tag, Calendar, ChevronRight } from 'lucide-react';

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
}

export const ClientList = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Cliente[]>('/cliente');
      setClientes(data);
      setClientesFiltrados(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      setError(err.message || 'Error al cargar clientes');
      setLoading(false);
    }
  };

  // Direct navigation functions
  const handleSelectClient = (clientId: string) => {
    window.location.href = `/clientes/${clientId}`;
  };

  const handleCreateClient = () => {
    window.location.href = '/clientes/nuevo';
  };

  const filtrarClientes = (filtroEstado: string) => {
    setFiltro(filtroEstado);
    
    if (filtroEstado === 'todos') {
      setClientesFiltrados(clientes);
      return;
    }
    
    if (filtroEstado === 'pendientes') {
      const hoy = new Date();
      const pendientes = clientes.filter(c => {
        if (!c.fechaProximoPago) return false;
        return new Date(c.fechaProximoPago) < hoy && c.estado === 'activo';
      });
      setClientesFiltrados(pendientes);
      return;
    }
    
    setClientesFiltrados(clientes.filter(c => c.estado === filtroEstado));
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activo
          </span>
        );
      case 'inactivo':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Pause className="w-3 h-3 mr-1" />
            Inactivo
          </span>
        );
      case 'suspendido':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Suspendido
          </span>
        );
      default:
        return null;
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

  const isPagoVencido = (cliente: Cliente) => {
    if (!cliente.fechaProximoPago) return false;
    
    const hoy = new Date();
    const fechaLimite = new Date(cliente.fechaProximoPago);
    fechaLimite.setDate(fechaLimite.getDate() + cliente.diasGracia);
    
    return hoy > fechaLimite;
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando clientes...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchClientes}
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
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button 
          onClick={handleCreateClient}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => filtrarClientes('todos')}
            className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => filtrarClientes('activo')}
            className={`px-4 py-2 rounded ${filtro === 'activo' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Activos
          </button>
          <button 
            onClick={() => filtrarClientes('suspendido')}
            className={`px-4 py-2 rounded ${filtro === 'suspendido' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Suspendidos
          </button>
          <button 
            onClick={() => filtrarClientes('inactivo')}
            className={`px-4 py-2 rounded ${filtro === 'inactivo' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
          >
            Inactivos
          </button>
          <button 
            onClick={() => filtrarClientes('pendientes')}
            className={`px-4 py-2 rounded ${filtro === 'pendientes' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
          >
            Pagos Pendientes
          </button>
        </div>
      </div>

      {/* Lista de clientes */}
      {clientesFiltrados.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay clientes con los filtros seleccionados</p>
          <button 
            onClick={() => filtrarClientes('todos')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ver Todos los Clientes
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {clientesFiltrados.map(cliente => (
              <li key={cliente._id} className="hover:bg-gray-50">
                <button 
                  onClick={() => handleSelectClient(cliente._id)} 
                  className="block w-full text-left p-0"
                >
                  <div className="p-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h2 className="text-lg font-medium text-gray-900">{cliente.nombre}</h2>
                            <div className="ml-2">
                              {getEstadoBadge(cliente.estado)}
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <p>{cliente.email} • {cliente.telefono}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-base font-medium">${cliente.montoEstablecido.toFixed(2)}/mes</span>
                        <div className="mt-1 flex items-center text-sm">
                          <Tag className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="text-blue-600">{getPrograma(cliente.programaAdquirido)}</span>
                          <span className="mx-1">•</span>
                          <span>{getPlan(cliente.plan)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Inicio: {new Date(cliente.fechaInicio).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className={isPagoVencido(cliente) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {cliente.fechaProximoPago 
                            ? `Próximo pago: ${new Date(cliente.fechaProximoPago).toLocaleDateString()}`
                            : 'Sin fecha de pago'}
                        </span>
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