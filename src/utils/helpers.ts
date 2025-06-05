// src/utils/helpers.ts
import { 
  DEBT_STATUS, 
  PAYMENT_STATUS, 
  STATUS_LABELS, 
  STATUS_COLORS,
  CURRENCIES,
  DATE_FORMATS 
} from './constants';

/**
 * Formateo de números y monedas
 */
export const formatCurrency = (
  amount: number, 
  currency: keyof typeof CURRENCIES = 'ARS',
  locale: string = 'es-AR'
): string => {
  const currencySymbols = {
    ARS: '$',
    USD: 'US$'
  };

  const symbol = currencySymbols[currency] || '$';
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return `${symbol}${formatted}`;
  } catch (error) {
    // Fallback si Intl no está disponible
    return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  try {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch (error) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Formateo de fechas
 */
export const formatDate = (
  date: string | Date, 
  format: keyof typeof DATE_FORMATS = 'SHORT'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const formats = {
    SHORT: { day: '2-digit', month: '2-digit', year: 'numeric' },
    LONG: { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    ISO: null, // Manejado especialmente
    DISPLAY: { day: '2-digit', month: 'short', year: 'numeric' }
  } as const;

  if (format === 'ISO') {
    return dateObj.toISOString().split('T')[0];
  }

  try {
    return new Intl.DateTimeFormat('es-AR', formats[format] as any).format(dateObj);
  } catch (error) {
    // Fallback
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    if (format === 'LONG') {
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    return `${day}/${month}/${year}`;
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Ahora mismo';
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj, 'DISPLAY');
  }
};

export const getDaysUntilDue = (dueDate: string | Date): number => {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate: string | Date): boolean => {
  return getDaysUntilDue(dueDate) < 0;
};

/**
 * Estados y etiquetas
 */
export const getStatusLabel = (
  status: string, 
  type: 'debt' | 'payment' = 'debt'
): string => {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
};

export const getStatusColor = (
  status: string, 
  type: 'debt' | 'payment' = 'debt'
): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'text-gray-400 bg-gray-400/20';
};

export const getStatusIcon = (status: string, type: 'debt' | 'payment' = 'debt'): string => {
  const icons = {
    // Deudas
    [DEBT_STATUS.PAID]: '✅',
    [DEBT_STATUS.OVERDUE]: '🔴',
    [DEBT_STATUS.PROCESSING]: '🔄',
    [DEBT_STATUS.CANCELLED]: '❌',
    [DEBT_STATUS.PENDING]: '⏳',
    
    // Pagos
    [PAYMENT_STATUS.APPROVED]: '✅',
    [PAYMENT_STATUS.REJECTED]: '❌',
    [PAYMENT_STATUS.CANCELLED]: '🚫',
    [PAYMENT_STATUS.REFUNDED]: '💰',
    [PAYMENT_STATUS.PROCESSING]: '🔄',
    [PAYMENT_STATUS.PENDING]: '⏳',
    [PAYMENT_STATUS.IN_MEDIATION]: '⚖️',
    [PAYMENT_STATUS.CHARGED_BACK]: '🔄'
  };
  
  return icons[status as keyof typeof icons] || '❓';
};

/**
 * Validaciones
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && Number.isFinite(amount);
};

/**
 * Utilidades de texto
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Utilidades de arrays y objetos
 */
export const groupBy = <T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], keyFn: (item: T) => any, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Utilidades de URL y navegación
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const parseQueryString = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

/**
 * Utilidades de almacenamiento
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return defaultValue || null;
    }
  },
  
  set: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
      return false;
    }
  }
};

/**
 * Utilidades de debounce y throttle
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Utilidades de error
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.msg) return error.response.data.msg;
  return 'Ha ocurrido un error inesperado';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

export const getStatusCodeMessage = (statusCode: number): string => {
  const messages: Record<number, string> = {
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso prohibido',
    404: 'Recurso no encontrado',
    409: 'Conflicto con el estado actual',
    422: 'Datos de entrada inválidos',
    429: 'Demasiadas solicitudes',
    500: 'Error interno del servidor',
    502: 'Error de puerta de enlace',
    503: 'Servicio no disponible',
    504: 'Tiempo de espera agotado'
  };
  
  return messages[statusCode] || `Error ${statusCode}`;
};

/**
 * Utilidades de desarrollo
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};

export const log = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log('[Lambda Code Studio]', ...args);
  }
};

export const logError = (...args: any[]): void => {
  if (isDevelopment()) {
    console.error('[Lambda Code Studio Error]', ...args);
  }
};

export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  getDaysUntilDue,
  isOverdue,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  validateEmail,
  validatePassword,
  validateAmount,
  truncateText,
  capitalizeFirst,
  slugify,
  groupBy,
  sortBy,
  uniqBy,
  buildQueryString,
  parseQueryString,
  storage,
  debounce,
  throttle,
  getErrorMessage,
  isNetworkError,
  getStatusCodeMessage,
  isDevelopment,
  isProduction,
  log,
  logError
};