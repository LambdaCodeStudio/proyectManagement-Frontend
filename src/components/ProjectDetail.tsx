import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Tarea {
  _id: string;
  descripcion: string;
  completada: boolean;
  fechaCreacion: string;
  fechaLimite?: string;
}

interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
  fechaInicio: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado';
  monto: number;
  tareas: Tarea[];
}

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onNavigateToEdit: (projectId: string) => void;
  onNavigateToClient: (clientId: string) => void;
  onNavigateToCreateInvoice: (projectId: string) => void;
  onNavigateToCreatePayment: (projectId: string) => void;
}

export const ProjectDetail = ({
  projectId,
  onBack,
  onNavigateToEdit,
  onNavigateToClient,
  onNavigateToCreateInvoice,
  onNavigateToCreatePayment
}: ProjectDetailProps) => {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [nuevaTarea, setNuevaTarea] = useState({
    descripcion: '',
    fechaLimite: ''
  });
  
  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true);
        const data = await apiService.get<Proyecto>(`/proyectos/${projectId}`);
        setProyecto(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar proyecto:', err);
        setError(err.message || 'Error al cargar proyecto');
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProyecto();
    }
  }, [projectId]);
  
  const handleDeleteProject = async () => {
    if (!window.confirm('¿Está seguro de eliminar este proyecto?')) return;
    
    try {
      await apiService.delete(`/proyectos/${projectId}`);
      onBack();
    } catch (err: any) {
      console.error('Error al eliminar proyecto:', err);
      setError(err.message || 'Error al eliminar proyecto');
    }
  };
  
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevaTarea.descripcion.trim()) return;
    
    try {
      const taskData = {
        descripcion: nuevaTarea.descripcion,
        completada: false,
        fechaCreacion: new Date().toISOString(),
        ...(nuevaTarea.fechaLimite ? { fechaLimite: nuevaTarea.fechaLimite } : {})
      };
      
      const updatedProyecto = await apiService.post<Proyecto>(
        `/proyectos/${projectId}/tareas`,
        taskData
      );
      
      setProyecto(updatedProyecto);
      setNuevaTarea({ descripcion: '', fechaLimite: '' });
    } catch (err: any) {
      console.error('Error al agregar tarea:', err);
      setError(err.message || 'Error al agregar tarea');
    }
  };
  
  const handleToggleTask = async (taskId: string, completada: boolean) => {
    try {
      const taskData = {
        completada: !completada
      };
      
      const updatedProyecto = await apiService.put<Proyecto>(
        `/proyectos/${projectId}/tareas/${taskId}`,
        taskData
      );
      
      setProyecto(updatedProyecto);
    } catch (err: any) {
      console.error('Error al actualizar tarea:', err);
      setError(err.message || 'Error al actualizar tarea');
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const updatedProyecto = await apiService.delete<Proyecto>(
        `/proyectos/${projectId}/tareas/${taskId}`
      );
      
      setProyecto(updatedProyecto);
    } catch (err: any) {
      console.error('Error al eliminar tarea:', err);
      setError(err.message || 'Error al eliminar tarea');
    }
  };
  
  const calcularProgreso = (tareas: Tarea[]) => {
    if (!tareas || tareas.length === 0) return 0;
    const completadas = tareas.filter(t => t.completada).length;
    return Math.round((completadas / tareas.length) * 100);
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
  
  if (loading) {
    return <div className="flex justify-center p-6">Cargando proyecto...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={onBack}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }
  
  if (!proyecto) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
        <h3 className="font-bold">Proyecto no encontrado</h3>
        <button 
          onClick={onBack}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Encabezado */}
      <div className="lg:col-span-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{proyecto.nombre}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => onNavigateToEdit(proyecto._id)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Editar
          </button>
          <button 
            onClick={handleDeleteProject}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      {/* Información general */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">Información del Proyecto</h2>
            <span className={`px-3 py-1 text-sm rounded-full ${getBadgeClass(proyecto.estado)}`}>
              {getEstadoLabel(proyecto.estado)}
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{proyecto.descripcion || 'Sin descripción'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
              <p className="text-lg">{proyecto.idCliente?.nombre || 'N/A'}</p>
              <p className="text-sm text-gray-500">{proyecto.idCliente?.email || 'N/A'}</p>
              <p className="text-sm text-gray-500">{proyecto.idCliente?.telefono || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Detalles</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monto:</span>
                  <span className="font-medium">${proyecto.monto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fecha Inicio:</span>
                  <span>{new Date(proyecto.fechaInicio).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fecha Entrega:</span>
                  <span>
                    {proyecto.fechaEntrega 
                      ? new Date(proyecto.fechaEntrega).toLocaleDateString()
                      : 'No definida'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-700">Progreso</span>
              <span className="text-sm text-gray-700">{calcularProgreso(proyecto.tareas)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calcularProgreso(proyecto.tareas)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Información del cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => onNavigateToClient(proyecto.idCliente._id)}
            className="block w-full text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ver Cliente
          </button>
          
          <button 
            onClick={() => onNavigateToCreateInvoice(proyecto._id)}
            className="block w-full text-center py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Generar Factura
          </button>
          
          <button 
            onClick={() => onNavigateToCreatePayment(proyecto._id)}
            className="block w-full text-center py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Registrar Pago
          </button>
        </div>
      </div>
      
      {/* Lista de tareas */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tareas</h2>
          
          {/* Formulario para agregar nueva tarea */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={nuevaTarea.descripcion}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                placeholder="Descripción de la tarea"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="date"
                value={nuevaTarea.fechaLimite}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaLimite: e.target.value })}
                className="md:w-48 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Agregar Tarea
              </button>
            </div>
          </form>
          
          {/* Lista de tareas */}
          {proyecto.tareas.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No hay tareas para este proyecto
            </div>
          ) : (
            <ul className="space-y-3">
              {proyecto.tareas.map(tarea => (
                <li 
                  key={tarea._id} 
                  className="p-4 border border-gray-200 rounded-lg flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => handleToggleTask(tarea._id, tarea.completada)}
                    className="h-5 w-5 text-blue-600 rounded mr-3"
                  />
                  <div className="flex-grow">
                    <p className={`${tarea.completada ? 'line-through text-gray-500' : ''}`}>
                      {tarea.descripcion}
                    </p>
                    <div className="flex text-xs text-gray-500 mt-1">
                      <span>Creada: {new Date(tarea.fechaCreacion).toLocaleDateString()}</span>
                      {tarea.fechaLimite && (
                        <span className="ml-4">
                          Límite: {new Date(tarea.fechaLimite).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(tarea._id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};