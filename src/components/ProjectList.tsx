import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
  };
  fechaInicio: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado';
  monto: number;
  tareas: Array<{
    _id: string;
    descripcion: string;
    completada: boolean;
    fechaCreacion: string;
    fechaLimite?: string;
  }>;
}

// Remove the props interface since we'll handle navigation internally
export const ProjectList = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState<Proyecto[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProyectos();
    }
  }, [isAuthenticated]);

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Proyecto[]>('/proyectos');
      console.log('Proyectos cargados:', data);
      setProyectos(data);
      setProyectosFiltrados(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar proyectos:', err);
      setError(err.message || 'Error al cargar proyectos');
      setLoading(false);
    }
  };

  // Direct navigation functions
  const handleSelectProject = (projectId: string) => {
    window.location.href = `/proyectos/${projectId}`;
  };

  const handleCreateProject = () => {
    window.location.href = '/proyectos/nuevo';
  };

  // Rest of your code remains the same...
  const filtrarProyectos = (filtroEstado: string) => {
    setFiltro(filtroEstado);
    
    if (filtroEstado === 'todos') {
      setProyectosFiltrados(proyectos);
      return;
    }
    
    if (filtroEstado === 'atrasados') {
      const hoy = new Date();
      const atrasados = proyectos.filter(p => {
        if (!p.fechaEntrega) return false;
        return new Date(p.fechaEntrega) < hoy && p.estado !== 'completado' && p.estado !== 'cancelado';
      });
      setProyectosFiltrados(atrasados);
      return;
    }
    
    setProyectosFiltrados(proyectos.filter(p => p.estado === filtroEstado));
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'pausado':
        return 'bg-gray-100 text-gray-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En Progreso';
      case 'pausado':
        return 'Pausado';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const calcularProgreso = (tareas: any[]) => {
    if (!tareas || tareas.length === 0) return 0;
    const completadas = tareas.filter(t => t.completada).length;
    return Math.round((completadas / tareas.length) * 100);
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando proyectos...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchProyectos}
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
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <button 
          onClick={handleCreateProject} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => filtrarProyectos('todos')}
            className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => filtrarProyectos('pendiente')}
            className={`px-4 py-2 rounded ${filtro === 'pendiente' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => filtrarProyectos('en_progreso')}
            className={`px-4 py-2 rounded ${filtro === 'en_progreso' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            En Progreso
          </button>
          <button 
            onClick={() => filtrarProyectos('pausado')}
            className={`px-4 py-2 rounded ${filtro === 'pausado' ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
          >
            Pausados
          </button>
          <button 
            onClick={() => filtrarProyectos('completado')}
            className={`px-4 py-2 rounded ${filtro === 'completado' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Completados
          </button>
          <button 
            onClick={() => filtrarProyectos('atrasados')}
            className={`px-4 py-2 rounded ${filtro === 'atrasados' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Atrasados
          </button>
        </div>
      </div>

      {/* Lista de proyectos */}
      {proyectosFiltrados.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay proyectos con los filtros seleccionados</p>
          <button 
            onClick={() => filtrarProyectos('todos')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ver Todos los Proyectos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectosFiltrados.map(proyecto => (
            <div key={proyecto._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{proyecto.nombre}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getBadgeClass(proyecto.estado)}`}>
                    {getEstadoLabel(proyecto.estado)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {proyecto.descripcion || 'Sin descripción'}
                </p>
              </div>
              
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm font-medium">{proyecto.idCliente?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monto</p>
                  <p className="text-sm font-medium">${proyecto.monto.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="px-4 py-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-700">Progreso</span>
                  <span className="text-xs text-gray-700">{calcularProgreso(proyecto.tareas)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${calcularProgreso(proyecto.tareas)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 flex justify-between">
                <div>
                  <p className="text-xs text-gray-500">Fecha Inicio</p>
                  <p className="text-sm">
                    {new Date(proyecto.fechaInicio).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha Entrega</p>
                  <p className="text-sm">
                    {proyecto.fechaEntrega 
                      ? new Date(proyecto.fechaEntrega).toLocaleDateString()
                      : 'No definida'}
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 border-t">
                <button 
                  onClick={() => handleSelectProject(proyecto._id)}
                  className="w-full block text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};