// src/utils/constants.ts

// Estados de deuda
export const DEBT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue'
} as const;

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  IN_MEDIATION: 'in_mediation',
  CHARGED_BACK: 'charged_back'
} as const;

// Categorías de deuda
export const DEBT_CATEGORIES = {
  SERVICE: 'service',
  PRODUCT: 'product',
  SUBSCRIPTION: 'subscription',
  FINE: 'fine',
  OTHER: 'other'
} as const;

// Monedas soportadas
export const CURRENCIES = {
  ARS: 'ARS',
  USD: 'USD'
} as const;

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  ADMINISTRATOR: 'administrator',
  CLIENT: 'client',
  USER: 'user'
} as const;

// Colores para estados
export const STATUS_COLORS = {
  // Deudas
  [DEBT_STATUS.PAID]: 'text-green-400 bg-green-400/20',
  [DEBT_STATUS.OVERDUE]: 'text-red-400 bg-red-400/20',
  [DEBT_STATUS.PROCESSING]: 'text-blue-400 bg-blue-400/20',
  [DEBT_STATUS.CANCELLED]: 'text-gray-400 bg-gray-400/20',
  [DEBT_STATUS.PENDING]: 'text-yellow-400 bg-yellow-400/20',
  
  // Pagos
  [PAYMENT_STATUS.APPROVED]: 'text-green-400 bg-green-400/20',
  [PAYMENT_STATUS.REJECTED]: 'text-red-400 bg-red-400/20',
  [PAYMENT_STATUS.CANCELLED]: 'text-gray-400 bg-gray-400/20',
  [PAYMENT_STATUS.REFUNDED]: 'text-purple-400 bg-purple-400/20',
  [PAYMENT_STATUS.PROCESSING]: 'text-blue-400 bg-blue-400/20',
  [PAYMENT_STATUS.PENDING]: 'text-yellow-400 bg-yellow-400/20',
  [PAYMENT_STATUS.IN_MEDIATION]: 'text-orange-400 bg-orange-400/20',
  [PAYMENT_STATUS.CHARGED_BACK]: 'text-red-400 bg-red-400/20'
} as const;

// Textos para estados
export const STATUS_LABELS = {
  // Deudas
  [DEBT_STATUS.PAID]: 'Pagada',
  [DEBT_STATUS.OVERDUE]: 'Vencida',
  [DEBT_STATUS.PROCESSING]: 'Procesando',
  [DEBT_STATUS.CANCELLED]: 'Cancelada',
  [DEBT_STATUS.PENDING]: 'Pendiente',
  
  // Pagos
  [PAYMENT_STATUS.APPROVED]: 'Aprobado',
  [PAYMENT_STATUS.REJECTED]: 'Rechazado',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelado',
  [PAYMENT_STATUS.REFUNDED]: 'Reembolsado',
  [PAYMENT_STATUS.PROCESSING]: 'Procesando',
  [PAYMENT_STATUS.PENDING]: 'Pendiente',
  [PAYMENT_STATUS.IN_MEDIATION]: 'En Mediación',
  [PAYMENT_STATUS.CHARGED_BACK]: 'Contracargo'
} as const;

// Endpoints de la API
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Deudas
  DEBTS: '/debts',
  DEBT_STATS: '/debts/stats',
  DEBT_REMINDER: (id: string) => `/debts/${id}/reminder`,
  DEBT_CANCEL: (id: string) => `/debts/${id}/cancel`,
  
  // Pagos
  PAYMENTS: '/payments',
  PAYMENT_PREFERENCE: (debtId: string) => `/payments/preference/${debtId}`,
  PAYMENT_STATUS: '/payments/status/check',
  PAYMENT_CANCEL: (id: string) => `/payments/${id}/cancel`,
  PAYMENT_RETRY: (id: string) => `/payments/${id}/retry`,
  PAYMENT_REFUND: (id: string) => `/payments/${id}/refund`,
  
  // MercadoPago
  MP_WEBHOOK: '/mercadopago/webhook',
  MP_WEBHOOK_LOGS: '/mercadopago/webhook/logs',
  
  // Sistema
  HEALTH: '/health',
  CSRF_TOKEN: '/csrf-token'
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMITS: [10, 25, 50, 100]
} as const;

// Configuración de fechas
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd/MM/yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'dd MMM yyyy'
} as const;

// Claves de localStorage
export const STORAGE_KEYS = {
  REMEMBERED_USER: 'rememberedUser',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'userPreferences'
} as const;

// Nombres de cookies
export const COOKIE_NAMES = {
  TOKEN: 'token',
  CSRF: 'XSRF-TOKEN',
  SESSION_EXPIRED: 'session_expired',
  ERROR_MESSAGE: 'errorMessage',
  LAST_ACTIVITY: 'last_activity'
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
  },
  POSITION: 'top-right' as const,
  MAX_NOTIFICATIONS: 5
} as const;

// Límites y validaciones
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  DEBT: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999999,
    DESCRIPTION_MAX_LENGTH: 500
  },
  PAYMENT: {
    MAX_RETRIES: 3,
    TIMEOUT: 30000
  }
} as const;

// Configuración de gradientes para el tema
export const GRADIENTS = {
  PRIMARY: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  SECONDARY: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  SUCCESS: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  WARNING: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ERROR: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  BACKGROUND: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
} as const;

// Iconos por categoría
export const CATEGORY_ICONS = {
  [DEBT_CATEGORIES.SERVICE]: '🔧',
  [DEBT_CATEGORIES.PRODUCT]: '📦',
  [DEBT_CATEGORIES.SUBSCRIPTION]: '📱',
  [DEBT_CATEGORIES.FINE]: '⚠️',
  [DEBT_CATEGORIES.OTHER]: '📄'
} as const;

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'Lambda Code Studio - Pagos',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de gestión de pagos y deudas',
  COMPANY: 'Lambda Code Studio',
  SUPPORT_EMAIL: 'soporte@lambdacodestudio.com.ar',
  SUPPORT_PHONE: '+54 9 11 1234-5678',
  WEBSITE: 'https://lambdacodestudio.com.ar'
} as const;

// Configuración de intervalos
export const INTERVALS = {
  AUTH_CHECK: 5 * 60 * 1000, // 5 minutos
  DATA_REFRESH: 30 * 1000, // 30 segundos
  HEALTH_CHECK: 60 * 1000, // 1 minuto
  SESSION_WARNING: 5 * 60 * 1000, // 5 minutos antes de expirar
  IDLE_TIMEOUT: 30 * 60 * 1000 // 30 minutos
} as const;

// Configuración de animaciones
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// Configuración de breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Tipos derivados
export type DebtStatus = typeof DEBT_STATUS[keyof typeof DEBT_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type DebtCategory = typeof DEBT_CATEGORIES[keyof typeof DEBT_CATEGORIES];
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export default {
  DEBT_STATUS,
  PAYMENT_STATUS,
  DEBT_CATEGORIES,
  CURRENCIES,
  USER_ROLES,
  STATUS_COLORS,
  STATUS_LABELS,
  API_ENDPOINTS,
  PAGINATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  COOKIE_NAMES,
  VALIDATION,
  GRADIENTS,
  CATEGORY_ICONS,
  APP_CONFIG,
  INTERVALS,
  ANIMATIONS,
  BREAKPOINTS
};