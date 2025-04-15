import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Cliente {
  _id?: string;
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

interface ClientFormProps {
  id?: string;
}

export const ClientForm = ({ id }: ClientFormProps) => {
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formValues, setFormValues] = useState<Cliente>({
    nombre: '',
    email: '',
    telefono: '',
    programaAdquirido: 'odontoCare',
    fechaInicio: new Date().toISOString().split('T')[0],
    plan: 'mensual',
    estado: 'activo',
    montoEstablecido: 0,
    gastoRealMensual: 0,
    diasGracia: 5
  });
  
  useEffect(() => {
    const fetchCliente = async () => {
      if (!isEditing) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await apiService.get<Cliente>(`/cliente/${id}`);
        
        // Format dates for form inputs
        setFormValues({
          ...data,
          fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          fechaProximoPago: data.fechaProximoPago ? new Date(data.fechaProximoPago).toISOString().split('T')[0] : undefined,
          fechaUltimoPago: data.fechaUltimoPago ? new Date(data.fechaUltimoPago).toISOString().split('T')[0] : undefined
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar cliente:', err);
        setError(err.message || 'Error al cargar cliente');
        setLoading(false);
      }
    };
    
    fetchCliente();
  }, [id, isEditing]);
  
  // Direct navigation functions
  const handleCancel = () => {
    window.location.href = '/clientes';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Obtener token CSRF de la cookie
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      console.log("Token CSRF usado:", csrfToken);
      
      // Opciones con el token explícito
      const options = {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      };
      
      if (isEditing) {
        await apiService.put(`/cliente/${id}`, formValues, options);
      } else {
        await apiService.post('/cliente', formValues, options);
      }
      
      window.location.href = '/clientes';
    } catch (err: any) {
      console.error('Error al guardar cliente:', err);
      setError(err.message || 'Error al guardar cliente');
      setSaving(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === 'number') {
      setFormValues(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-6">Cargando...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h1>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={formValues.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
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
          </div>
        </div>
        
        {/* Información de servicios */}
        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Servicio Contratado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programa
              </label>
              <select
                name="programaAdquirido"
                value={formValues.programaAdquirido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="odontoCare">OdontoCare</option>
                <option value="cleanOrg">CleanOrg</option>
                <option value="distributionAdmin">DistributionAdmin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                name="plan"
                value={formValues.plan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Establecido ($)
              </label>
              <input
                type="number"
                name="montoEstablecido"
                value={formValues.montoEstablecido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gasto Real Mensual ($)
              </label>
              <input
                type="number"
                name="gastoRealMensual"
                value={formValues.gastoRealMensual}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Información de pagos */}
        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Información de Pagos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Próximo Pago
              </label>
              <input
                type="date"
                name="fechaProximoPago"
                value={formValues.fechaProximoPago || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Último Pago
              </label>
              <input
                type="date"
                name="fechaUltimoPago"
                value={formValues.fechaUltimoPago || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días de Gracia
              </label>
              <input
                type="number"
                name="diasGracia"
                value={formValues.diasGracia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
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
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
};