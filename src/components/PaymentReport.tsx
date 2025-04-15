import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Calendar, CreditCard, DollarSign, User, FileText, BarChart3, Download, Printer } from 'lucide-react';

interface Pago {
  _id: string;
  idCliente: {
    _id: string;
    nombre: string;
    email: string;
    programaAdquirido: string;
  };
  monto: number;
  fechaPago: string;
  periodoFacturado: {
    inicio: string;
    fin: string;
  };
  metodoPago: 'transferencia' | 'tarjeta' | 'efectivo' | 'deposito' | 'otro';
  facturado: boolean;
  numeroFactura?: string;
}

interface ReporteData {
  pagos: Pago[];
  totalRecaudado: number;
  pagosPorPrograma: {
    [key: string]: number;
  };
  periodo: {
    inicio: string;
    fin: string;
  };
}

export const PaymentReport = () => {
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Valores por defecto: mes actual
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fechaInicio, setFechaInicio] = useState(inicioMes);
  const [fechaFin, setFechaFin] = useState(finMes);
  
  useEffect(() => {
    fetchReporte();
  }, []);
  
  const fetchReporte = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<ReporteData>(`/pagos/reporte?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      setReporte(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar reporte de pagos:', err);
      setError(err.message || 'Error al cargar reporte de pagos');
      setLoading(false);
    }
  };
  
  // Direct navigation functions
  const handleBack = () => {
    window.location.href = '/pagos';
  };
  
  const calcularPorcentaje = (monto: number) => {
    if (!reporte?.totalRecaudado) return 0;
    return Math.round((monto / reporte.totalRecaudado) * 100);
  };
  
  const getMetodoPagoLabel = (metodo: string) => {
    switch (metodo) {
      case 'transferencia':
        return 'Transferencia';
      case 'tarjeta':
        return 'Tarjeta';
      case 'efectivo':
        return 'Efectivo';
      case 'deposito':
        return 'Depósito';
      case 'otro':
        return 'Otro';
      default:
        return metodo;
    }
  };
  
  const calcularPagosPorMetodo = () => {
    if (!reporte?.pagos) return {};
    
    return reporte.pagos.reduce((acc, pago) => {
      acc[pago.metodoPago] = (acc[pago.metodoPago] || 0) + pago.monto;
      return acc;
    }, {} as { [key: string]: number });
  };
  
  const calcularPagosPorFacturacion = () => {
    if (!reporte?.pagos) return { facturado: 0, pendiente: 0 };
    
    return reporte.pagos.reduce((acc, pago) => {
      if (pago.facturado) {
        acc.facturado += pago.monto;
      } else {
        acc.pendiente += pago.monto;
      }
      return acc;
    }, { facturado: 0, pendiente: 0 });
  };
  
  const handleRefresh = () => {
    fetchReporte();
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const downloadCSV = () => {
    if (!reporte?.pagos) return;
    
    // Crear contenido CSV
    const headers = ['Fecha', 'Cliente', 'Programa', 'Monto', 'Método', 'Facturado', 'Factura'];
    
    const rows = reporte.pagos.map(pago => [
      new Date(pago.fechaPago).toLocaleDateString(),
      pago.idCliente?.nombre || 'N/A',
      pago.idCliente?.programaAdquirido || 'N/A',
      pago.monto.toFixed(2),
      getMetodoPagoLabel(pago.metodoPago),
      pago.facturado ? 'Sí' : 'No',
      pago.numeroFactura || 'N/A'
    ]);
    
    // Agregar fila de totales
    rows.push([
      '',
      '',
      'TOTAL',
      reporte.totalRecaudado.toFixed(2),
      '',
      '',
      ''
    ]);
    
    // Convertir a string CSV
    const csvContent = 
      headers.join(',') + 
      '\n' + 
      rows.map(row => row.join(',')).join('\n');
    
    // Crear elemento para descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_pagos_${fechaInicio}_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center p-6">Cargando reporte...</div>;
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
          Volver a Pagos
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reporte de Pagos</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-5 w-5 mr-2" />
            Imprimir
          </button>
          <button 
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white p-4 rounded-lg shadow print:hidden">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      {reporte && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Total Recaudado</h3>
              <p className="text-3xl font-bold text-green-600">${reporte.totalRecaudado.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Periodo: {new Date(fechaInicio).toLocaleDateString()} - {new Date(fechaFin).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cantidad de Pagos</h3>
              <p className="text-3xl font-bold text-blue-600">{reporte.pagos.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                Promedio: ${(reporte.totalRecaudado / (reporte.pagos.length || 1)).toFixed(2)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Facturación</h3>
              
              {(() => {
                const facturacion = calcularPagosPorFacturacion();
                return (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Facturado:</span>
                      <span className="text-sm font-bold text-green-600">${facturacion.facturado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pendiente:</span>
                      <span className="text-sm font-bold text-yellow-600">${facturacion.pendiente.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Desglose por programa */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Programa</h3>
            
            <div className="space-y-4">
              {Object.entries(reporte.pagosPorPrograma).map(([programa, monto]) => (
                <div key={programa} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{programa}</span>
                    <span className="font-bold">${monto.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calcularPorcentaje(monto)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-right">{calcularPorcentaje(monto)}% del total</p>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose por método de pago */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Método de Pago</h3>
            
            <div className="space-y-4">
              {Object.entries(calcularPagosPorMetodo()).map(([metodo, monto]) => (
                <div key={metodo} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{getMetodoPagoLabel(metodo)}</span>
                    <span className="font-bold">${monto.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${calcularPorcentaje(monto)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-right">{calcularPorcentaje(monto)}% del total</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className="bg-white p-6 rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lista de Pagos</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Programa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facturado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reporte.pagos.map(pago => (
                    <tr key={pago._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pago.fechaPago).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pago.idCliente?.nombre || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.idCliente?.programaAdquirido || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getMetodoPagoLabel(pago.metodoPago)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pago.facturado ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" />
                            <span>{pago.numeroFactura || 'Sí'}</span>
                          </div>
                        ) : (
                          <span className="text-yellow-600">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                        ${pago.monto.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Fila de total */}
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ${reporte.totalRecaudado.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Botón volver */}
      <div className="flex justify-start mb-6 print:hidden">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Volver a Pagos
        </button>
      </div>
    </div>
  );
};