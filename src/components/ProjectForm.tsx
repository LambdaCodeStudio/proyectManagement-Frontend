import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Cliente {
  _id: string;
  nombre: string;
  email: string;
}

interface Proyecto {
  _id?: string;
  nombre: string;
  descripcion: string;
  idCliente: string;
  fechaInicio: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado';
  monto: number;
  tareas: Array<{
    descripcion: string;
    completada: boolean;
    fechaCreacion: string;
    fechaLimite?: string;
  }>;
}

// Updated props interface to only require project ID
interface ProjectFormProps {
  id?: string;
}

export const ProjectForm = ({ id }: ProjectFormProps) => {
  const isEditing = !!id;
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formValues, setFormValues] = useState<Proyecto>({
    nombre: '',
    descripcion: '',
    idCliente: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaEntrega: '',
    estado: 'pendiente',
    monto: 0,
    tareas: []
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar clientes
        const clientesData = await apiService.get<Cliente[]>('/cliente');
        setClientes(clientesData);
        
        // Si estamos editando, cargar datos del proyecto
        if (isEditing) {
          const proyectoData = await apiService.get<Proyecto>(`/proyectos/${id}`);
          
          setFormValues({
            ...proyectoData,
            fechaInicio: new Date(proyectoData.fechaInicio).toISOString().split('T')[0],
            fechaEntrega: proyectoData.fechaEntrega 
              ? new Date(proyectoData.fechaEntrega).toISOString().split('T')[0]
              : '',
            idCliente: proyectoData.idCliente._id || proyectoData.idCliente
          });
        } else if (clientesData.length > 0) {
          // Si no estamos editando y hay clientes, seleccionar el primero por defecto
          setFormValues(prev => ({
            ...prev,
            idCliente: clientesData[0]._id
          }));
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar datos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Direct navigation functions
  const handleBack = () => {
    window.location.href = '/proyectos';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (isEditing) {
        await apiService.put(`/proyectos/${id}`, formValues);
      } else {
        await apiService.post('/proyectos', formValues);
      }
      
      // Navigate back to the projects list after saving
      handleBack();
    } catch (err: any) {
      console.error('Error al guardar proyecto:', err);
      setError(err.message || 'Error al guardar proyecto');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-6">Cargando...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      </h1>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              name="nombre"
              value={formValues.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formValues.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              name="idCliente"
              value={formValues.idCliente}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map(cliente => (
                <option key={cliente._id} value={cliente._id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formValues.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="pausado">Pausado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={formValues.fechaInicio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Entrega
            </label>
            <input
              type="date"
              name="fechaEntrega"
              value={formValues.fechaEntrega}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto ($)
            </label>
            <input
              type="number"
              name="monto"
              value={formValues.monto}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Proyecto' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
};