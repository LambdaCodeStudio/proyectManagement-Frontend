import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface Cliente {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  programaAdquirido: string;
  plan: string;
  montoEstablecido: number;
}

interface Pago {
  idCliente: string;
  monto: number;
  fechaPago: string;
  periodoFacturado: {
    inicio: string;
    fin: string;
  };
  metodoPago: 'transferencia' | 'tarjeta' | 'efectivo' | 'deposito' | 'otro';
  comprobantePago?: string;
  comentarios?: string;
}

interface Factura {
  _id: string;
  numeroFactura: string;
  idCliente: string;
  total: number;
}

interface PaymentFormProps {
  id?: string;
  clientId?: string;
  invoiceId?: string;
}

export const PaymentForm = ({ id, clientId, invoiceId }: PaymentFormProps) => {
  const isEditing = !!id;
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formValues, setFormValues] = useState<Pago>({
    idCliente: clientId || '',
    monto: 0,
    fechaPago: new Date().toISOString().split('T')[0],
    periodoFacturado: {
      inicio: new Date().toISOString().split('T')[0],
      fin: new Date().toISOString().split('T')[0]
    },
    metodoPago: 'transferencia',
    comentarios: ''
  });
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar clientes
        const clientesData = await apiService.get<Cliente[]>('/cliente');
        setClientes(clientesData);
        
        // Si estamos editando, cargar datos del pago
        if (isEditing) {
          const pagoData = await apiService.get(`/pagos/${id}`);
          
          // Format dates
          setFormValues({
            ...pagoData,
            fechaPago: new Date(pagoData.fechaPago).toISOString().split('T')[0],
            periodoFacturado: {
              inicio: new Date(pagoData.periodoFacturado.inicio).toISOString().split('T')[0],
              fin: new Date(pagoData.periodoFacturado.fin).toISOString().split('T')[0]
            },
            idCliente: typeof pagoData.idCliente === 'object' ? pagoData.idCliente._id : pagoData.idCliente
          });
        }
        
        // Si viene de una factura, preseleccionar datos
        if (invoiceId) {
          const facturaData = await apiService.get<Factura>(`/facturas/${invoiceId}`);
          
          setFormValues(prev => ({
            ...prev,
            idCliente: facturaData.idCliente._id || facturaData.idCliente,
            monto: facturaData.total
          }));
        }
        
        // Si hay cliente preseleccionado, cargar sus datos
        if (clientId) {
          const cliente = clientesData.find(c => c._id === clientId);
          if (cliente) {
            setSelectedCliente(cliente);
            
            // Calcular fechas de periodo según el plan
            const hoy = new Date();
            let fechaInicio = new Date(hoy);
            let fechaFin = new Date(hoy);
            
            // Ajustar al primer día del mes actual
            fechaInicio.setDate(1);
            
            // Calcular fin del periodo según plan
            switch(cliente.plan) {
              case 'mensual':
                fechaFin.setMonth(fechaFin.getMonth() + 1);
                fechaFin.setDate(0); // Último día del mes
                break;
              case 'trimestral':
                fechaFin.setMonth(fechaFin.getMonth() + 3);
                fechaFin.setDate(0);
                break;
              case 'semestral':
                fechaFin.setMonth(fechaFin.getMonth() + 6);
                fechaFin.setDate(0);
                break;
              case 'anual':
                fechaFin.setFullYear(fechaFin.getFullYear() + 1);
                fechaFin.setDate(fechaFin.getDate() - 1);
                break;
            }
            
            // Actualizar formulario con monto del cliente y periodo
            setFormValues(prev => ({
              ...prev,
              monto: cliente.montoEstablecido,
              periodoFacturado: {
                inicio: fechaInicio.toISOString().split('T')[0],
                fin: fechaFin.toISOString().split('T')[0]
              }
            }));
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar datos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, clientId, invoiceId, isEditing]);
  
  // Direct navigation functions
  const handleCancel = () => {
    window.location.href = '/pagos';
  };
  
  const handleClienteChange = (clienteId: string) => {
    setFormValues(prev => ({
      ...prev,
      idCliente: clienteId
    }));
    
    const cliente = clientes.find(c => c._id === clienteId);
    setSelectedCliente(cliente || null);
    
    if (cliente) {
      // Actualizar monto con el establecido para el cliente
      setFormValues(prev => ({
        ...prev,
        monto: cliente.montoEstablecido
      }));
      
      // Calcular fechas de periodo según el plan
      const hoy = new Date();
      let fechaInicio = new Date(hoy);
      let fechaFin = new Date(hoy);
      
      // Ajustar al primer día del mes actual
      fechaInicio.setDate(1);
      
      // Calcular fin del periodo según plan
      switch(cliente.plan) {
        case 'mensual':
          fechaFin.setMonth(fechaFin.getMonth() + 1);
          fechaFin.setDate(0); // Último día del mes
          break;
        case 'trimestral':
          fechaFin.setMonth(fechaFin.getMonth() + 3);
          fechaFin.setDate(0);
          break;
        case 'semestral':
          fechaFin.setMonth(fechaFin.getMonth() + 6);
          fechaFin.setDate(0);
          break;
        case 'anual':
          fechaFin.setFullYear(fechaFin.getFullYear() + 1);
          fechaFin.setDate(fechaFin.getDate() - 1);
          break;
      }
      
      // Actualizar fechas
      setFormValues(prev => ({
        ...prev,
        periodoFacturado: {
          inicio: fechaInicio.toISOString().split('T')[0],
          fin: fechaFin.toISOString().split('T')[0]
        }
      }));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (periodoFacturado.inicio, periodoFacturado.fin)
      const [parent, child] = name.split('.');
      setFormValues(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: name === 'monto' ? parseFloat(value) : value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEditing) {
        await apiService.put(`/pagos/${id}`, formValues);
      } else {
        await apiService.post('/pagos', formValues);
      }
      
      // Navigate back to payments list
      window.location.href = '/pagos';
    } catch (err: any) {
      console.error('Error al guardar pago:', err);
      setError(err.message || 'Error al guardar pago');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-6">Cargando...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Pago' : 'Registrar Pago'}
      </h1>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente y monto */}
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
              disabled={!!clientId || !!invoiceId} // Deshabilitar si viene preseleccionado
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
            {selectedCliente && (
              <p className="mt-1 text-sm text-gray-500">
                Monto establecido: ${selectedCliente.montoEstablecido.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        
        {/* Fecha y método de pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Pago
            </label>
            <input
              type="date"
              name="fechaPago"
              value={formValues.fechaPago}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              name="metodoPago"
              value={formValues.metodoPago}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
              <option value="deposito">Depósito</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
        
        {/* Periodo facturado */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Periodo Facturado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="periodoFacturado.inicio"
                value={formValues.periodoFacturado.inicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="periodoFacturado.fin"
                value={formValues.periodoFacturado.fin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Comentarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios (opcional)
          </label>
          <textarea
            name="comentarios"
            value={formValues.comentarios || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Información adicional sobre el pago..."
          />
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
            {saving ? 'Guardando...' : isEditing ? 'Actualizar Pago' : 'Registrar Pago'}
          </button>
        </div>
      </form>
    </div>
  );
};