import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Interfaces para mejor tipado
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
  requestId?: string;
}

interface CsrfTokenResponse {
  csrfToken?: string;
  token?: string;
}

interface ErrorResponse {
  message: string;
  status?: string;
  errors?: Array<{ field: string; message: string }>;
}

// Utilidades para cookies
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      if (cookieValue) {
        console.log(`🍪 Cookie ${name} encontrada:`, cookieValue.substring(0, 20) + '...');
        return cookieValue;
      }
    }
  } catch (error) {
    console.error(`Error al leer cookie ${name}:`, error);
  }
  
  console.log(`🍪 Cookie ${name} no encontrada`);
  return undefined;
};

const setCookie = (name: string, value: string, maxAge: number = 86400): void => {
  if (typeof document === 'undefined') return;
  
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}${isLocal ? '' : '; secure'}; samesite=strict`;
  console.log(`🍪 Cookie ${name} guardada:`, value.substring(0, 20) + '...');
};

// Crear instancia API
const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token',
});

// Variable para almacenar token CSRF en memoria
let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

// Función para obtener token CSRF
const getCsrfToken = async (): Promise<string | null> => {
  // Si ya hay una petición en curso, esperar a que termine
  if (csrfTokenPromise) {
    console.log('🔄 Esperando token CSRF en progreso...');
    return csrfTokenPromise;
  }
  
  // Si ya tenemos token en caché, usarlo
  if (csrfTokenCache) {
    console.log('✅ Usando token CSRF de caché');
    return csrfTokenCache;
  }
  
  // Si hay token en cookie, usarlo
  const cookieToken = getCookie('XSRF-TOKEN');
  if (cookieToken && cookieToken.trim() !== '') {
    console.log('✅ Usando token CSRF de cookie');
    csrfTokenCache = cookieToken;
    return cookieToken;
  }
  
  console.log('🔍 Obteniendo nuevo token CSRF del servidor...');
  
  // Crear promesa para obtener token
  csrfTokenPromise = (async () => {
    try {
      const response = await axios.get(`${api.defaults.baseURL}/csrf-token`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const token = response.data?.csrfToken;
      if (token) {
        console.log('✅ Token CSRF obtenido del servidor');
        csrfTokenCache = token;
        setCookie('XSRF-TOKEN', token);
        return token;
      }
      
      throw new Error('No se recibió token CSRF válido');
    } catch (error) {
      console.error('❌ Error obteniendo token CSRF:', error);
      return null;
    } finally {
      csrfTokenPromise = null;
    }
  })();
  
  return csrfTokenPromise;
};

// Request interceptor MEJORADO
api.interceptors.request.use(async (config) => {
  console.log(`🚀 Enviando ${config.method?.toUpperCase()} ${config.url}`);
  
  // Agregar token de autenticación (solo si no es login/register)
  if (typeof document !== 'undefined') {
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register') ||
                          config.url?.includes('/auth/forgot-password');
    
    if (!isAuthEndpoint) {
      const token = getCookie('token');
      if (token && token.trim() !== '') {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🔑 Token agregado a petición`);
        }
      }
    } else {
      console.log('🔓 Endpoint de autenticación - no se requiere token previo');
    }
  }
  
  // Headers básicos
  if (config.headers) {
    config.headers.Accept = 'application/json';
    config.headers['X-Client-ID'] = 'plantilla-frontend';
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  
  // CSRF para métodos que modifican datos
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    console.log('🔐 Método requiere CSRF - obteniendo token...');
    
    try {
      const csrfToken = await getCsrfToken();
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
        console.log('✅ Token CSRF agregado a petición');
      } else {
        console.warn('⚠️ No se pudo obtener token CSRF');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token CSRF para petición:', error);
    }
  }
  
  // Agregar parámetro anti-caché para GET
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  
  return config;
}, (error) => {
  console.error('❌ Error en request interceptor:', error.message);
  return Promise.reject(error);
});

// Response interceptor MEJORADO
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    
    // Manejar token JWT en respuestas exitosas
    const newToken = response.headers['authorization'] || response.headers['new-authorization'];
    if (newToken && typeof document !== 'undefined') {
      const tokenValue = newToken.replace('Bearer ', '');
      setCookie('token', tokenValue);
      console.log('🔄 Token JWT recibido y guardado');
    }
    
    // Manejar nuevo token CSRF si viene en headers
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken && typeof document !== 'undefined') {
      csrfTokenCache = newCsrfToken;
      setCookie('XSRF-TOKEN', newCsrfToken);
      console.log('🔄 Token CSRF actualizado');
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
    
    // Log detallado del error
    console.log('📊 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Manejar errores de red
    if (!error.response) {
      console.error('🌐 Error de red:', error.message);
      return Promise.reject(new Error('Error de conexión. Compruebe su conexión a internet.'));
    }
    
    switch (error.response?.status) {
      case 401: // No autorizado
        console.error('🚫 Error 401 - Token inválido o expirado');
        
        // Solo limpiar cookies si NO es un endpoint de auth
        if (!error.config?.url?.includes('/auth/')) {
          if (typeof document !== 'undefined') {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            console.log('🗑️ Token eliminado por error 401');
          }
          
          // Redirigir solo si no estamos en login
          if (typeof window !== 'undefined' && 
              !window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            console.log('🔄 Redirigiendo a login...');
            window.location.href = '/login?session_expired=true';
          }
        }
        
        return Promise.reject(new Error('Credenciales inválidas o sesión expirada.'));
        
      case 403: // Prohibido
        console.error('🚫 Error 403 - Acceso prohibido');
        
        // Si es error de CSRF y no hemos reintentado
        const errorMessage = error.response?.data?.message || '';
        const isCsrfError = errorMessage.toLowerCase().includes('csrf');
        
        if (isCsrfError && !originalRequest._retry) {
          console.log('🔄 Error CSRF detectado - renovando token...');
          originalRequest._retry = true;
          
          try {
            // Limpiar caché y obtener nuevo token
            csrfTokenCache = null;
            if (typeof document !== 'undefined') {
              document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            }
            
            const newCsrfToken = await getCsrfToken();
            if (newCsrfToken && originalRequest.headers) {
              originalRequest.headers['X-CSRF-Token'] = newCsrfToken;
              console.log('🔄 Reintentando con nuevo token CSRF...');
              return api(originalRequest);
            }
          } catch (csrfError) {
            console.error('❌ Error renovando CSRF token:', csrfError);
          }
        }
        
        // Mensaje específico para errores de login
        if (error.config?.url?.includes('/auth/login')) {
          return Promise.reject(new Error('Credenciales incorrectas o error de seguridad.'));
        }
        
        return Promise.reject(new Error('No tiene permiso para realizar esta acción.'));
        
      case 404: // No encontrado
        console.error('🔍 Error 404 - Recurso no encontrado');
        if (error.config?.url?.includes('/auth/login')) {
          return Promise.reject(new Error('Servicio de autenticación no disponible.'));
        }
        return Promise.reject(new Error('El recurso solicitado no existe.'));
        
      case 422: // Error de validación
        const data = error.response?.data as ErrorResponse;
        if (data?.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
          return Promise.reject(new Error(`Errores de validación: ${errorMessages}`));
        }
        return Promise.reject(new Error(data?.message || 'Los datos proporcionados no son válidos.'));
      
      case 500: // Error del servidor
      case 502:
      case 503:
      case 504:
        console.error('🔥 Error del servidor:', error.response?.data);
        return Promise.reject(new Error('Error del servidor. Por favor, inténtelo de nuevo más tarde.'));
        
      default:
        console.error('❓ Error no manejado:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
  }
);

// Métodos de API
const apiService = {
  get: async <T = any>(url: string, params?: object): Promise<T> => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  post: async <T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  put: async <T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  patch: async <T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Método manual para obtener CSRF (para debugging)
  getCsrfToken,
  
  // Limpiar caché de CSRF
  clearCsrfCache: () => {
    csrfTokenCache = null;
    if (typeof document !== 'undefined') {
      document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    console.log('🗑️ Caché de CSRF limpiado');
  },
  
  // Debugging
  debugAuth: () => {
    console.log('🔧 === DEBUG AUTENTICACIÓN ===');
    console.log('🍪 Token cookie:', getCookie('token')?.substring(0, 20) + '...');
    console.log('🍪 CSRF cookie:', getCookie('XSRF-TOKEN')?.substring(0, 20) + '...');
    console.log('💾 CSRF cache:', csrfTokenCache?.substring(0, 20) + '...');
    console.log('🌐 Base URL:', api.defaults.baseURL);
    console.log('🔧 === FIN DEBUG ===');
  },
  
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('💔 Health check falló:', error);
      return false;
    }
  }
};

export default apiService;