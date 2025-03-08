import axios from 'axios';

// Definir tipos localmente para evitar problemas de compatibilidad
type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
};

type ApiError = {
  response?: {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
  };
  request?: any;
  message: string;
  config?: any;
};

// Utilidades para cookies
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
};

// Crear instancia API con configuración avanzada
const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para cookies
  timeout: 10000, // 10 segundos timeout
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token', // Compatible con el backend
});

// Request interceptor mejorado
api.interceptors.request.use((config) => {
  // Agregar token de autenticación
  if (typeof document !== 'undefined') {
    const token = getCookie('token');
      
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Agregar parámetro anti-caché para GET
  if (config.method?.toLowerCase() === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    };
  }
  
  // Agregar token CSRF para métodos que modifican datos
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  // Agregar cabecera preferida para JSON
  if (config.headers) {
    config.headers.Accept = 'application/json';
    
    // Indicar prefijo de cliente para ayudar en debugging
    config.headers['X-Client-ID'] = 'plantilla-frontend';
  }
  
  return config;
}, (error) => {
  console.error('Error en solicitud:', error.message);
  return Promise.reject(error);
});

// Response interceptor mejorado
api.interceptors.response.use(
  (response) => {
    // Verificar token JWT renovado
    const newToken = response.headers['new-authorization'];
    if (newToken && typeof document !== 'undefined') {
      const tokenValue = newToken.replace('Bearer ', '');
      document.cookie = `token=${tokenValue}; path=/; max-age=86400; secure; samesite=strict`;
      
      // Guardar para uso inmediato en siguientes solicitudes
      api.defaults.headers['Authorization'] = newToken;
    }
    
    // Verificar CSRF token actualizado
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken && typeof document !== 'undefined') {
      document.cookie = `XSRF-TOKEN=${newCsrfToken}; path=/; max-age=86400; secure; samesite=strict`;
    }
    
    // Extraer y guardar Request-ID para correlación de errores
    const requestId = response.headers['x-request-id'];
    if (requestId) {
      response.data.requestId = requestId;
    }
    
    return response;
  },
  async (error: ApiError) => {
    // Si no hay configuración o no tiene _retry, inicializar
    const originalRequest = error.config || {};
    const _retry = (originalRequest as any)._retry;
    
    // Manejar errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
      return Promise.reject(new Error('Error de conexión. Compruebe su conexión a internet y vuelva a intentarlo.'));
    }
    
    // Extraer Request-ID para reportes de errores
    const requestId = error.response?.headers?.['x-request-id'];
    if (requestId) {
      console.error(`Error en solicitud [${requestId}]:`, error.message);
    }
    
    // Manejar códigos de error específicos
    switch (error.response?.status) {
      case 401: // No autorizado
        // Solo intentar renovar token una vez
        if (originalRequest && !_retry && typeof document !== 'undefined') {
          // Marcar que ya intentamos con esta solicitud
          (originalRequest as any)._retry = true;
          
          // Limpiar credenciales en errores de autenticación
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          
          // Actualizar CSRF token si es necesario
          try {
            await api.get('/csrf-token');
          } catch (e) {
            console.error('Error al obtener nuevo CSRF token:', e);
          }
          
          // Si estamos en ruta protegida, redirigir a login
          if (typeof window !== 'undefined' && 
              !window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login?session_expired=true';
            return Promise.reject(new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
          }
        }
        break;
        
      case 403: // Prohibido
        // Verificar si es error de CSRF
        if (error.response?.data?.message?.includes('CSRF')) {
          console.error('Error CSRF:', error.response?.data);
          
          // Intentar obtener nuevo token CSRF
          try {
            await api.get('/csrf-token');
            
            // Volver a intentar la solicitud original con el nuevo token
            if (originalRequest && !_retry) {
              (originalRequest as any)._retry = true;
              const csrfToken = getCookie('XSRF-TOKEN');
              if (csrfToken && originalRequest.headers) {
                originalRequest.headers['X-CSRF-Token'] = csrfToken;
                return api(originalRequest);
              }
            }
          } catch (e) {
            console.error('Error al renovar token CSRF:', e);
          }
          
          return Promise.reject(new Error('Error de seguridad. Recargue la página e intente nuevamente.'));
        }
        
        console.error('Acceso prohibido:', error.response?.data);
        return Promise.reject(new Error('No tiene permiso para realizar esta acción.'));
        
      case 429: // Demasiadas solicitudes
        console.error('Límite de solicitudes excedido:', error.response?.data);
        return Promise.reject(new Error('Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.'));
        
      case 413: // Payload demasiado grande
        console.error('Payload demasiado grande:', error.response?.data);
        return Promise.reject(new Error('Los datos enviados exceden el tamaño permitido.'));
        
      case 422: // Error de validación
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          return Promise.reject(new Error(`Errores de validación: ${errorMessages}`));
        }
        return Promise.reject(new Error('Los datos proporcionados no son válidos.'));
      
      case 500: // Error del servidor
      case 502: // Bad Gateway
      case 503: // Servicio no disponible
      case 504: // Gateway Timeout
        console.error('Error del servidor:', error.response?.data);
        return Promise.reject(new Error(`Error del servidor [${requestId || 'unknown'}]. Por favor, inténtelo de nuevo más tarde o contacte con soporte.`));
    }
    
    // Errores no manejados específicamente
    return Promise.reject(error);
  }
);

// Métodos extendidos para operaciones comunes
const apiService = {
  // Método base para realizar solicitudes
  request: async <T>(config: any): Promise<T> => {
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET con caché opcional
  get: async <T>(url: string, params?: any, useCache: boolean = false): Promise<T> => {
    try {
      const config: any = { 
        url, 
        method: 'GET',
        params
      };
      
      // Si useCache es true, no añadimos el parámetro anti-caché
      if (useCache) {
        // Crear un interceptor temporal que elimina el parámetro _t para esta solicitud
        const interceptorId = api.interceptors.request.use((config) => {
          if (config.url === url && config.params) {
            const { _t, ...otherParams } = config.params;
            config.params = otherParams;
          }
          return config;
        });
        
        try {
          const response = await api(config);
          // Eliminar el interceptor temporal
          api.interceptors.request.eject(interceptorId);
          return response.data;
        } catch (error) {
          // Asegurarse de eliminar el interceptor en caso de error
          api.interceptors.request.eject(interceptorId);
          throw error;
        }
      }
      
      // Caso normal sin caché
      const response = await api(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // POST con manejo de errores mejorado
  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PUT
  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // DELETE
  delete: async <T>(url: string, config?: any): Promise<T> => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PATCH
  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Método para obtener un nuevo token CSRF
  refreshCsrfToken: async (): Promise<string> => {
    try {
      const response = await api.get('/csrf-token');
      return response.data.csrfToken;
    } catch (error) {
      console.error('Error al obtener token CSRF:', error);
      throw error;
    }
  },
  
  // Verificar conexión con el backend
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health', {}, true);
      return response.status === 'success';
    } catch (error) {
      console.error('Error en health check:', error);
      return false;
    }
  }
};

export default apiService;