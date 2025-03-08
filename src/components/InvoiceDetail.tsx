import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Calendar, Download, Printer, Mail, CreditCard, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Concepto {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  impuesto: number;
}

interface Factura {
  _id: string;
  numeroFactura: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
  idProyecto?: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  conceptos: Concepto[];
  subtotal: number;
  impuestos: number;
  total: number;
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

// Updated to only require the invoice ID
interface InvoiceDetailProps {
  id: string;
}

export const InvoiceDetail = ({ id }: InvoiceDetailProps) => {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchFactura = async () => {
      try {
        setLoading(true);
        const data = await apiService.get<Factura>(`/facturas/${id}`);
        setFactura(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar factura:', err);
        setError(err.message || 'Error al cargar factura');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchFactura();
    }
  }, [id]);
  
  // Direct navigation functions
  const handleBack = () => {
    window.location.href = '/facturas';
  };
  
  const handleNavigateToEdit = (invoiceId: string) => {
    window.location.href = `/facturas/nuevo?id=${invoiceId}`;
  };
  
  const handleNavigateToClient = (clientId: string) => {
    window.location.href = `/clientes/${clientId}`;
  };
  
  const handleNavigateToProject = (projectId: string) => {
    window.location.href = `/proyectos/${projectId}`;
  };
  
  const handleRegisterPayment = (invoiceId: string) => {
    window.location.href = `/pagos/nuevo?invoiceId=${invoiceId}`;
  };
  
  const handleDeleteInvoice = async () => {
    if (!window.confirm('¿Está seguro de eliminar esta factura?')) return;
    
    try {
      await apiService.delete(`/facturas/${id}`);
      handleBack();
    } catch (err: any) {
      console.error('Error al eliminar factura:', err);
      setError(err.message || 'Error al eliminar factura');
    }
  };
  
  const handleUpdateStatus = async (estado: string) => {
    try {
      const updatedFactura = await apiService.patch<Factura>(`/facturas/${id}/estado`, { estado });
      setFactura(updatedFactura);
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      setError(err.message || 'Error al actualizar estado');
    }
  };
  
  const handlePrintInvoice = () => {
    window.print();
  };
  
  const handleDownloadInvoice = () => {
    // Esta función normalmente llamaría a un endpoint del backend que genera un PDF
    alert('Función de descarga no implementada');
  };
  
  const handleSendEmail = () => {
    // Esta función normalmente llamaría a un endpoint del backend que envía la factura por email
    alert('Función de envío por email no implementada');
  };
  
  const isFacturaVencida = () => {
    if (!factura) return false;
    return new Date(factura.fechaVencimiento) < new Date() && factura.estado === 'pendiente';
  };
  
  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return isFacturaVencida() ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
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
    if (estado === 'pendiente' && isFacturaVencida()) {
      return 'Vencida';
    }
    
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
  
  if (loading) {
    return <div className="flex justify-center p-6">Cargando factura...</div>;
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
          Volver a Facturas
        </button>
      </div>
    );
  }
  
  if (!factura) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
        <h3 className="font-bold">Factura no encontrada</h3>
        <button 
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a Facturas
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
            <h1 className="text-2xl font-bold text-gray-900">Factura #{factura.numeroFactura}</h1>
            {isFacturaVencida() && (
              <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Vencida</span>
              </div>
            )}
          </div>
          <p className="text-gray-500">
            {factura.idProyecto?.nombre 
              ? `Proyecto: ${factura.idProyecto.nombre}` 
              : 'Sin proyecto asociado'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={handlePrintInvoice}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Imprimir"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Descargar PDF"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={handleSendEmail}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Enviar por Email"
          >
            <Mail className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleNavigateToEdit(factura._id)}
            className="p-2 text-blue-500 hover:text-blue-700"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDeleteInvoice}
            className="p-2 text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Main content remains the same as before */}
      {/* Factura */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* Encabezado */}
        <div className="p-6">
          <div className="flex justify-between flex-col md:flex-row mb-8">
            <div>
              <h3 className="text-lg font-bold mb-2">Facturado a:</h3>
              <p className="font-medium">{factura.idCliente.nombre}</p>
              <p>{factura.idCliente.email}</p>
              <p>{factura.idCliente.telefono}</p>
              {factura.razonSocialCliente && <p>{factura.razonSocialCliente}</p>}
              {factura.rucCliente && <p>RUC: {factura.rucCliente}</p>}
              {factura.direccionCliente && <p>{factura.direccionCliente}</p>}
            </div>
            
            <div className="mt-4 md:mt-0 md:text-right">
              <h3 className="text-lg font-bold mb-2">Datos de la factura:</h3>
              <div className="flex flex-col gap-1">
                <div className="flex md:justify-end items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <p>Emisión: {new Date(factura.fechaEmision).toLocaleDateString()}</p>
                </div>
                <div className="flex md:justify-end items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <p className={isFacturaVencida() ? 'text-red-600 font-medium' : ''}>
                    Vencimiento: {new Date(factura.fechaVencimiento).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex md:justify-end items-center gap-1 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeClass(factura.estado)}`}>
                    {getEstadoLabel(factura.estado)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conceptos */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Conceptos:</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left">Descripción</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                    <th className="px-4 py-2 text-right">IVA</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {factura.conceptos.map((concepto, index) => {
                    const montoConcepto = concepto.cantidad * concepto.precioUnitario;
                    const impuestoConcepto = montoConcepto * (concepto.impuesto / 100);
                    const totalConcepto = montoConcepto + impuestoConcepto;
                    
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-3">{concepto.descripcion}</td>
                        <td className="px-4 py-3 text-right">{concepto.cantidad}</td>
                        <td className="px-4 py-3 text-right">${concepto.precioUnitario.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{concepto.impuesto}%</td>
                        <td className="px-4 py-3 text-right font-medium">${totalConcepto.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Totales */}
          <div className="mt-8 flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${factura.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Impuestos:</span>
                <span>${factura.impuestos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>Total:</span>
                <span>${factura.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Notas */}
          {factura.notas && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-2">Notas:</h3>
              <p className="text-gray-700">{factura.notas}</p>
            </div>
          )}
          
          {/* Método de pago */}
          {factura.metodoPago && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Método de pago:</h3>
              <p className="text-gray-700">{factura.metodoPago}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Acciones */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Acciones:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Actualizar estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cambiar estado
            </label>
            <div className="flex space-x-2">
              <select 
                value={factura.estado}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          
          {/* Registrar pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registrar pago
            </label>
            <button 
              onClick={() => handleRegisterPayment(factura._id)}
              className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Registrar Pago
            </button>
          </div>
        </div>
      </div>
      
      {/* Enlaces relacionados */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button 
          onClick={() => handleNavigateToClient(factura.idCliente._id)}
          className="flex-1 bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50"
        >
          <p className="text-gray-500 mb-1">Ver Cliente</p>
          <p className="font-medium">{factura.idCliente.nombre}</p>
        </button>
        
        {factura.idProyecto && (
          <button 
            onClick={() => handleNavigateToProject(factura.idProyecto!._id)}
            className="flex-1 bg-white rounded-lg shadow p-4 text-center hover:bg-gray-50"
          >
            <p className="text-gray-500 mb-1">Ver Proyecto</p>
            <p className="font-medium">{factura.idProyecto.nombre}</p>
          </button>
        )}
      </div>
    </div>
  );
};