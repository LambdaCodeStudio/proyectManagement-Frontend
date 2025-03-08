import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Cliente {
  _id: string;
  nombre: string;
  email: string;
  razonSocial?: string;
  ruc?: string;
  direccion?: string;
}

interface Proyecto {
  _id: string;
  nombre: string;
  monto: number;
  idCliente: string;
}

interface Concepto {
  _id?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  impuesto: number;
}

interface Factura {
  _id?: string;
  numeroFactura?: string;
  idCliente: string;
  idProyecto?: string;
  conceptos: Concepto[];
  subtotal?: number;
  impuestos?: number;
  total?: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  metodoPago?: string;
  notas?: string;
  razonSocialEmisor?: string;
  rucEmisor?: string;
  direccionEmisor?: string;
  razonSocialCliente?: string;
  rucCliente?: string;
  direccionCliente?: string;
}

// Updated props interface to only require IDs
interface InvoiceFormProps {
  id?: string;
  projectId?: string;
}

export const InvoiceForm = ({ id, projectId }: InvoiceFormProps) => {
  const isEditing = !!id;
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formValues, setFormValues] = useState<Factura>({
    idCliente: '',
    idProyecto: projectId || '',
    conceptos: [{
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      impuesto: 0
    }],
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'pendiente',
    metodoPago: '',
    notas: '',
    razonSocialEmisor: '',
    rucEmisor: '',
    direccionEmisor: '',
    razonSocialCliente: '',
    rucCliente: '',
    direccionCliente: ''
  });
  
  // Direct navigation functions
  const handleCancel = () => {
    window.location.href = '/facturas';
  };
  
  const handleSaveSuccess = () => {
    window.location.href = '/facturas';
  };
  
  // Calcular totales
  const calcularTotales = (conceptos: Concepto[]) => {
    let subtotal = 0;
    let impuestos = 0;
    
    conceptos.forEach(concepto => {
      const monto = concepto.cantidad * concepto.precioUnitario;
      subtotal += monto;
      impuestos += monto * (concepto.impuesto / 100);
    });
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      impuestos: parseFloat(impuestos.toFixed(2)),
      total: parseFloat((subtotal + impuestos).toFixed(2))
    };
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar clientes
        const clientesData = await apiService.get<Cliente[]>('/cliente');
        setClientes(clientesData);
        
        // Cargar proyectos
        const proyectosData = await apiService.get<Proyecto[]>('/proyectos');
        setProyectos(proyectosData);
        
        // Si hay proyecto específico, preseleccionar cliente
        if (projectId) {
          const proyecto = proyectosData.find(p => p._id === projectId);
          if (proyecto) {
            setFormValues(prev => ({
              ...prev,
              idCliente: proyecto.idCliente,
              idProyecto: projectId,
              conceptos: [{
                descripcion: `Pago por proyecto: ${proyecto.nombre}`,
                cantidad: 1,
                precioUnitario: proyecto.monto,
                impuesto: 0
              }]
            }));
            
            // Filtrar proyectos por cliente
            setProyectosFiltrados(proyectosData.filter(p => p.idCliente === proyecto.idCliente));
          }
        } else if (clientesData.length > 0) {
          // Si no hay proyecto específico, seleccionar primer cliente
          setFormValues(prev => ({
            ...prev,
            idCliente: clientesData[0]._id
          }));
          
          // Filtrar proyectos por primer cliente
          setProyectosFiltrados(proyectosData.filter(p => p.idCliente === clientesData[0]._id));
        }
        
        // Si estamos editando, cargar datos de la factura
        if (isEditing) {
          const facturaData = await apiService.get<Factura>(`/facturas/${id}`);
          
          setFormValues({
            ...facturaData,
            fechaEmision: new Date(facturaData.fechaEmision).toISOString().split('T')[0],
            fechaVencimiento: new Date(facturaData.fechaVencimiento).toISOString().split('T')[0],
            idCliente: typeof facturaData.idCliente === 'object' ? facturaData.idCliente._id : facturaData.idCliente,
            idProyecto: facturaData.idProyecto ? (typeof facturaData.idProyecto === 'object' ? facturaData.idProyecto._id : facturaData.idProyecto) : undefined
          });
          
          // Filtrar proyectos por cliente
          setProyectosFiltrados(proyectosData.filter(p => p.idCliente === (typeof facturaData.idCliente === 'object' ? facturaData.idCliente._id : facturaData.idCliente)));
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar datos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing, projectId]);
  
  // Manejar cambio de cliente
  const handleClienteChange = (clienteId: string) => {
    // Actualizar id de cliente
    setFormValues(prev => ({
      ...prev,
      idCliente: clienteId,
      idProyecto: '' // Resetear proyecto al cambiar cliente
    }));
    
    // Filtrar proyectos por cliente
    setProyectosFiltrados(proyectos.filter(p => p.idCliente === clienteId));
    
    // Actualizar datos fiscales del cliente
    const cliente = clientes.find(c => c._id === clienteId);
    if (cliente) {
      setFormValues(prev => ({
        ...prev,
        razonSocialCliente: cliente.razonSocial || cliente.nombre,
        rucCliente: cliente.ruc || '',
        direccionCliente: cliente.direccion || ''
      }));
    }
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambios en conceptos
  const handleConceptoChange = (index: number, field: keyof Concepto, value: string | number) => {
    setFormValues(prev => {
      const updatedConceptos = [...prev.conceptos];
      updatedConceptos[index] = {
        ...updatedConceptos[index],
        [field]: field === 'descripcion' ? value : Number(value)
      };
      
      // Recalcular totales
      const { subtotal, impuestos, total } = calcularTotales(updatedConceptos);
      
      return {
        ...prev,
        conceptos: updatedConceptos,
        subtotal,
        impuestos,
        total
      };
    });
  };
  
  // Agregar concepto
  const addConcepto = () => {
    setFormValues(prev => ({
      ...prev,
      conceptos: [
        ...prev.conceptos,
        {
          descripcion: '',
          cantidad: 1,
          precioUnitario: 0,
          impuesto: 0
        }
      ]
    }));
  };
  
  // Eliminar concepto
  const removeConcepto = (index: number) => {
    if (formValues.conceptos.length === 1) {
      return; // Debe haber al menos un concepto
    }
    
    setFormValues(prev => {
      const updatedConceptos = prev.conceptos.filter((_, i) => i !== index);
      
      // Recalcular totales
      const { subtotal, impuestos, total } = calcularTotales(updatedConceptos);
      
      return {
        ...prev,
        conceptos: updatedConceptos,
        subtotal,
        impuestos,
        total
      };
    });
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya al menos un concepto válido
    const hasValidConceptos = formValues.conceptos.some(
      c => c.descripcion.trim() !== '' && c.cantidad > 0 && c.precioUnitario > 0
    );
    
    if (!hasValidConceptos) {
      setError('Debe ingresar al menos un concepto válido');
      return;
    }
    
    try {
      setSaving(true);
      
      // Recalcular totales antes de enviar
      const { subtotal, impuestos, total } = calcularTotales(formValues.conceptos);
      const dataToSend = {
        ...formValues,
        subtotal,
        impuestos,
        total
      };
      
      if (isEditing) {
        await apiService.put(`/facturas/${id}`, dataToSend);
      } else {
        await apiService.post('/facturas', dataToSend);
      }
      
      handleSaveSuccess();
    } catch (err: any) {
      console.error('Error al guardar factura:', err);
      setError(err.message || 'Error al guardar factura');
      setSaving(false);
    }
  };
  
  const { subtotal, impuestos, total } = calcularTotales(formValues.conceptos);
  
  if (loading) {
    return <div className="flex justify-center p-6">Cargando...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Factura' : 'Nueva Factura'}
      </h1>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Form content remains the same */}
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              name="idCliente"
              value={formValues.idCliente}
              onChange={(e) => handleClienteChange(e.target.value)}
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
              Proyecto (opcional)
            </label>
            <select
              name="idProyecto"
              value={formValues.idProyecto || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Sin proyecto asociado</option>
              {proyectosFiltrados.map(proyecto => (
                <option key={proyecto._id} value={proyecto._id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Emisión
            </label>
            <input
              type="date"
              name="fechaEmision"
              value={formValues.fechaEmision}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="fechaVencimiento"
              value={formValues.fechaVencimiento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        
        {/* Conceptos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-gray-900">Conceptos</h2>
            <button
              type="button"
              onClick={addConcepto}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Agregar Concepto
            </button>
          </div>
          
          <div className="space-y-4">
            {formValues.conceptos.map((concepto, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={concepto.descripcion}
                      onChange={(e) => handleConceptoChange(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={concepto.cantidad}
                      onChange={(e) => handleConceptoChange(index, 'cantidad', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      value={concepto.precioUnitario}
                      onChange={(e) => handleConceptoChange(index, 'precioUnitario', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      % IVA
                    </label>
                    <input
                      type="number"
                      value={concepto.impuesto}
                      onChange={(e) => handleConceptoChange(index, 'impuesto', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeConcepto(index)}
                      className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-800"
                      disabled={formValues.conceptos.length === 1}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Totales */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-end">
            <div className="w-1/2 md:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impuestos:</span>
                <span className="font-medium">${impuestos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago (opcional)
            </label>
            <input
              type="text"
              name="metodoPago"
              value={formValues.metodoPago || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: Transferencia Bancaria, Efectivo, etc."
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
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              name="notas"
              value={formValues.notas || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Información adicional para el cliente..."
            />
          </div>
        </div>
        
        {/* Botones */}
        <div className="flex justify-end space-x-4 mt-8">
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
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Factura' : 'Crear Factura'}
          </button>
        </div>
      </form>
    </div>
  );
};