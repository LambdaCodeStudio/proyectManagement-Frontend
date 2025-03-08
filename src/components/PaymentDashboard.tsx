import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Cliente {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  programaAdquirido: string;
  fechaInicio: string;
  plan: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  montoEstablecido: number;
  fechaProximoPago?: string;
  fechaUltimoPago?: string;
  diasGracia: number;
}

interface Pago {
  _id: string;
  idCliente: string;
  monto: number;
  fechaPago: string;
  periodoFacturado: {
    inicio: string;
    fin: string;
  };
  metodoPago: string;
  facturado: boolean;
}

interface EstadisticasPagos {
  totalClientes: number;
  clientesActivos: number;
  clientesSuspendidos: number;
  pagosUltimoMes: number;
  montoRecaudadoMes: number;
  pagosPendientes: number;
  montoPendiente: number;
}

export const PaymentDashboard: React.FC = () => {
  console.log("Renderizando PaymentDashboard");
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [pagosRecientes, setPagosRecientes] = useState<Pago[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPagos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  console.log("Estado de autenticación:", isAuthenticated);
  console.log("Información de usuario:", user);

  // Cargar datos al iniciar
  useEffect(() => {
    console.log("useEffect ejecutado, isAuthenticated:", isAuthenticated);
    
    if (isAuthenticated) {
      console.log("Usuario autenticado, llamando a fetchDatos");
      fetchDatos();
    } else {
      console.log("Usuario no autenticado, no se cargan datos");
    }
  }, [isAuthenticated]);

  // Función para cargar todos los datos
  const fetchDatos = async () => {
    console.log("====== INICIO DE FETCH DATOS ======");
    setLoading(true);
    setError('');

    try {
      // Cargar clientes
      console.log("Iniciando petición de clientes");
      let clientesData = [];
      try {
        const response = await apiService.get('/cliente');
        console.log("Respuesta cruda de clientes:", response);
        
        // Verificar estructura de respuesta
        if (Array.isArray(response)) {
          clientesData = response;
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) {
            clientesData = response.data;
          } else {
            clientesData = [];
            console.error("La respuesta no contiene un array de clientes:", response);
          }
        } else {
          clientesData = [];
          console.error("Formato de respuesta inesperado:", response);
        }
        
        console.log("Clientes procesados:", clientesData);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
        throw new Error("Error al cargar lista de clientes: " + (err.message || "Error desconocido"));
      }
      
      setClientes(clientesData);
      setClientesFiltrados(clientesData);
      console.log("Estado de clientes actualizado:", clientesData.length, "clientes");
      
      // Preparar fechas para reporte de pagos
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      const fechaFin = new Date();
      
      console.log("Rango de fechas para pagos:", {
        inicio: fechaInicio.toISOString().split('T')[0],
        fin: fechaFin.toISOString().split('T')[0]
      });
      
      // Cargar pagos recientes con manejo de errores independiente
      console.log("Iniciando petición de pagos");
      let pagosData = { pagos: [], totalRecaudado: 0 };
      
      try {
        const response = await apiService.get('/pagos/reporte', {
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0]
        });
        
        console.log("Respuesta cruda de pagos:", response);
        
        // Verificar estructura de respuesta
        if (response && response.pagos) {
          pagosData = response;
        } else if (Array.isArray(response)) {
          pagosData = { pagos: response, totalRecaudado: 0 };
        } else {
          console.warn("Formato de pagos inesperado, usando valores por defecto:", response);
        }
      } catch (err) {
        console.warn("Error al cargar pagos (continuando):", err);
        // Continuamos con el array vacío de pagos
      }
      
      console.log("Pagos procesados:", pagosData);
      
      // Actualizar pagos recientes
      const pagosSlice = (pagosData.pagos || []).slice(0, 10);
      console.log("Actualizando pagos recientes:", pagosSlice.length, "pagos");
      setPagosRecientes(pagosSlice);
      
      // Calcular estadísticas
      console.log("Calculando estadísticas con:", { 
        clientes: clientesData.length, 
        pagos: (pagosData.pagos || []).length 
      });
      
      calcularEstadisticas(clientesData, pagosData);
      
    } catch (err: any) {
      console.error("ERROR GENERAL EN FETCH DATOS:", err);
      console.error("Detalles del error:", {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      setError(err.message || 'Error al cargar datos');
    } finally {
      console.log("Finalizando fetchDatos, estableciendo loading=false");
      setLoading(false);
      console.log("====== FIN DE FETCH DATOS ======");
    }
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = (clientesData: Cliente[], pagosData: any) => {
    console.log("Iniciando cálculo de estadísticas");
    
    try {
      const clientesActivos = clientesData.filter(c => c.estado === 'activo').length;
      const clientesSuspendidos = clientesData.filter(c => c.estado === 'suspendido').length;
      
      console.log("Conteos por estado:", {
        activos: clientesActivos,
        suspendidos: clientesSuspendidos,
        total: clientesData.length
      });
      
      // Clientes con pagos pendientes (fecha próximo pago anterior a hoy)
      const hoy = new Date();
      console.log("Fecha actual para cálculo de pendientes:", hoy.toISOString());
      
      const clientesPendientes = clientesData.filter(c => {
        if (!c.fechaProximoPago) return false;
        return new Date(c.fechaProximoPago) < hoy && c.estado === 'activo';
      });
      
      console.log("Clientes con pagos pendientes:", clientesPendientes.length);
      
      // Sumar montos
      const montoPendiente = clientesPendientes.reduce((total, cliente) => 
        total + cliente.montoEstablecido, 0);
      
      console.log("Monto pendiente calculado:", montoPendiente);
      
      // Verificar estructura de pagosData
      const pagosLength = pagosData && pagosData.pagos ? pagosData.pagos.length : 0;
      const totalRecaudado = pagosData && pagosData.totalRecaudado ? pagosData.totalRecaudado : 0;
      
      console.log("Datos de pagos para estadísticas:", {
        cantidadPagos: pagosLength,
        totalRecaudado
      });
      
      const estadisticasCalculadas = {
        totalClientes: clientesData.length,
        clientesActivos,
        clientesSuspendidos,
        pagosUltimoMes: pagosLength,
        montoRecaudadoMes: totalRecaudado,
        pagosPendientes: clientesPendientes.length,
        montoPendiente
      };
      
      console.log("Estadísticas calculadas:", estadisticasCalculadas);
      setEstadisticas(estadisticasCalculadas);
      
    } catch (err) {
      console.error("Error al calcular estadísticas:", err);
      // Si falla el cálculo de estadísticas, creamos unas básicas
      setEstadisticas({
        totalClientes: clientesData.length,
        clientesActivos: 0,
        clientesSuspendidos: 0,
        pagosUltimoMes: 0,
        montoRecaudadoMes: 0,
        pagosPendientes: 0,
        montoPendiente: 0
      });
    }
  };

  // Filtrar clientes
  const filtrarClientes = (filtroEstado: string) => {
    console.log("Aplicando filtro:", filtroEstado);
    setFiltro(filtroEstado);
    
    if (filtroEstado === 'todos') {
      console.log("Mostrando todos los clientes:", clientes.length);
      setClientesFiltrados(clientes);
      return;
    }
    
    if (filtroEstado === 'pendientes') {
      const hoy = new Date();
      const pendientes = clientes.filter(c => {
        if (!c.fechaProximoPago) return false;
        return new Date(c.fechaProximoPago) < hoy && c.estado === 'activo';
      });
      console.log("Clientes con pagos pendientes:", pendientes.length);
      setClientesFiltrados(pendientes);
      return;
    }
    
    // Filtrar por estado
    const filtrados = clientes.filter(c => c.estado === filtroEstado);
    console.log(`Clientes con estado ${filtroEstado}:`, filtrados.length);
    setClientesFiltrados(filtrados);
  };

  // Registrar un nuevo pago
  const registrarPago = async (idCliente: string) => {
    console.log(`Registrar pago para cliente: ${idCliente}`);
    // Aquí podrías abrir un modal o navegar a una página de registro de pago
  };

  // Generar token de acceso
  const generarToken = async (idCliente: string) => {
    console.log(`Generando token para cliente: ${idCliente}`);
    try {
      await apiService.post(`/token/generar/${idCliente}`);
      alert('Token generado correctamente');
      // Recargar datos
      fetchDatos();
    } catch (err: any) {
      console.error("Error al generar token:", err);
      setError(err.message || 'Error al generar token');
    }
  };

  console.log("Estado actual:", {
    loading,
    error,
    clientesCount: clientes.length,
    clientesFiltradosCount: clientesFiltrados.length,
    pagosRecientesCount: pagosRecientes.length,
    hayEstadisticas: !!estadisticas
  });

  if (loading) {
    console.log("Renderizando estado de carga");
    return <div className="flex justify-center p-6">Cargando datos...</div>;
  }

  if (error) {
    console.log("Renderizando estado de error:", error);
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchDatos}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  console.log("Renderizando dashboard completo");
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Tarjetas de estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
            <p className="text-3xl font-bold">{estadisticas.totalClientes}</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-green-600">{estadisticas.clientesActivos} activos</span>
              <span className="text-red-600">{estadisticas.clientesSuspendidos} suspendidos</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Pagos Mensuales</h3>
            <p className="text-3xl font-bold">${estadisticas.montoRecaudadoMes.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{estadisticas.pagosUltimoMes} pagos este mes</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Pendientes</h3>
            <p className="text-3xl font-bold">{estadisticas.pagosPendientes}</p>
            <p className="text-sm text-red-600 mt-2">${estadisticas.montoPendiente.toFixed(2)} por cobrar</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Acciones</h3>
            <div className="mt-2 space-y-2">
              <button 
                onClick={() => filtrarClientes('pendientes')}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Ver Pendientes
              </button>
              <button 
                onClick={() => window.location.href = '/pagos/generar-reporte'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtros de clientes */}
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
            Pendientes
          </button>
        </div>
      </div>
      
      {/* Tabla de clientes */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes ({clientesFiltrados.length})</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próximo Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No hay clientes con los filtros seleccionados
                </td>
              </tr>
            ) : (
              clientesFiltrados.map(cliente => (
                <tr key={cliente._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                        <div className="text-sm text-gray-500">{cliente.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.programaAdquirido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${cliente.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                        cliente.estado === 'suspendido' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.fechaProximoPago ? 
                      new Date(cliente.fechaProximoPago).toLocaleDateString() : 
                      'No establecido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cliente.montoEstablecido.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => registrarPago(cliente._id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Registrar Pago
                      </button>
                      <button
                        onClick={() => generarToken(cliente._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Generar Token
                      </button>
                      <a
                        href={`/cliente/${cliente._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagos recientes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pagos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagosRecientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay pagos recientes
                  </td>
                </tr>
              ) : (
                pagosRecientes.map(pago => (
                  <tr key={pago._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pago.fechaPago).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clientes.find(c => c._id === pago.idCliente)?.nombre || pago.idCliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${pago.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.metodoPago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${pago.facturado ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {pago.facturado ? 'Sí' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};