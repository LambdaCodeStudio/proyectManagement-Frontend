import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string;
}

interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onRowClick,
  emptyMessage = "No hay datos disponibles",
  className = ""
}: DataTableProps<T>) {
  
  const renderCell = (column: TableColumn<T>, item: T, index: number) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item, index);
    }
    
    const value = item[column.key as keyof T];
    if (value === null || value === undefined) {
      return <span className="text-gray-500">-</span>;
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className={`gradient-card rounded-xl overflow-hidden ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex space-x-4 mb-4">
              {columns.map((_, index) => (
                <div key={index} className="h-4 bg-white/20 rounded flex-1"></div>
              ))}
            </div>
            {/* Rows skeleton */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4 mb-3">
                {columns.map((_, colIndex) => (
                  <div key={colIndex} className="h-8 bg-white/10 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`gradient-card rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm text-white ${column.className || ''}`}
                      style={{ width: column.width }}
                    >
                      {renderCell(column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {((pagination.current - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.current * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange?.(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let page;
                  if (pagination.pages <= 5) {
                    page = i + 1;
                  } else if (pagination.current <= 3) {
                    page = i + 1;
                  } else if (pagination.current >= pagination.pages - 2) {
                    page = pagination.pages - 4 + i;
                  } else {
                    page = pagination.current - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange?.(page)}
                      className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                        page === pagination.current
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {pagination.pages > 5 && pagination.current < pagination.pages - 2 && (
                  <>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => onPageChange?.(pagination.pages)}
                      className="w-8 h-8 rounded-lg text-sm hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      {pagination.pages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => onPageChange?.(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
