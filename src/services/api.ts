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
  return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
};

// Crear instancia API con configuración avanzada
const api = axios.create({
  // Si no está definida la variable de entorno, usar localhost:4000 por defecto
  baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api',
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
    // MODO DESARROLLO: Deshabilitar CSRF completamente
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('🛠️ Modo desarrollo detectado - CSRF deshabilitado');
      if (config.headers) {
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        // NO agregar token CSRF en desarrollo local
      }
      return config;
    }
    
    // MODO PRODUCCIÓN: Usar CSRF normal
    const useRequestedWith = getCookie('USE_REQUESTED_WITH');
    
    if (useRequestedWith === 'true' && config.headers) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      console.log('🔄 Usando X-Requested-With en lugar de token CSRF');
    } else {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken && csrfToken.trim() !== '' && config.headers) {
        // Usar el token CSRF de la cookie
        config.headers['X-CSRF-Token'] = csrfToken;
        console.log('🔐 Usando token CSRF de cookie:', csrfToken.substring(0, 10) + '...');
      } else if (config.headers) {
        console.warn('⚠️ No se encontró token CSRF en cookies, continuando sin él...');
      }
    }
  }
  
  // Agregar cabeceras adicionales
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

// Función auxiliar para verificar si es error CSRF
const isCsrfError = (error: AxiosError): boolean => {
  if (error.response?.status !== 403) return false;
  
  const data = error.response.data as any;
  if (!data || typeof data !== 'object') return false;
  
  const message = data.message;
  if (typeof message !== 'string') return false;
  
  return message.includes('CSRF') || 
         message.includes('csrf') || 
         message.includes('Token CSRF');
};

// Response interceptor mejorado
api.interceptors.response.use(
  (response: AxiosResponse) => {
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
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
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
        if (originalRequest && !originalRequest._retry && typeof document !== 'undefined') {
          // Limpiar credenciales en errores de autenticación
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          
          // Actualizar CSRF token si es necesario
          try {
            await apiService.refreshCsrfToken();
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
        if (isCsrfError(error)) {
          console.error('Error CSRF detectado:', error.response?.data);
          
          // Intentar renovar token CSRF y reintentar la solicitud
          if (originalRequest && !originalRequest._retry && typeof document !== 'undefined') {
            originalRequest._retry = true;
            
            try {
              // Obtener un nuevo token CSRF del servidor
              console.log('Obteniendo nuevo token CSRF del servidor...');
              const newToken = await apiService.refreshCsrfToken();
              
              console.log('Reintentando solicitud con nuevo token CSRF');
              // Actualizar token en la solicitud original
              if (originalRequest.headers) {
                originalRequest.headers['X-CSRF-Token'] = newToken;
              }
              
              // Reintentar la solicitud con el nuevo token
              return api(originalRequest);
            } catch (retryError) {
              console.error('Error al reintentar con nuevo token CSRF:', retryError);
            }
          }
          
          return Promise.reject(new Error('Error de seguridad CSRF. Por favor, recargue la página e intente nuevamente.'));
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
        const data = error.response?.data as ErrorResponse;
        if (data?.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err) => `${err.field}: ${err.message}`).join(', ');
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

// Función auxiliar para manejar reintentos CSRF
const handleCsrfRetry = async <T>(
  method: 'post' | 'put' | 'delete' | 'patch',
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> => {
  // MODO DESARROLLO: Deshabilitar lógica CSRF completamente
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.log('🛠️ Modo desarrollo - enviando solicitud directamente sin verificaciones CSRF');
    
    try {
      let response: AxiosResponse;
      switch (method) {
        case 'post':
          response = await api.post(url, data, config);
          break;
        case 'put':
          response = await api.put(url, data, config);
          break;
        case 'delete':
          response = await api.delete(url, config);
          break;
        case 'patch':
          response = await api.patch(url, data, config);
          break;
      }
      
      console.log(`✅ ${method.toUpperCase()} ${url} exitoso en modo desarrollo`);
      return response.data;
      
    } catch (error: any) {
      console.error(`❌ Error en ${method.toUpperCase()} ${url}:`, error.response?.status, error.response?.data);
      throw error;
    }
  }
  
  // MODO PRODUCCIÓN: Lógica CSRF completa
  let attempt = 0;
  const maxAttempts = 3;
  
  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`🔄 Intento ${attempt}/${maxAttempts} para ${method.toUpperCase()} ${url}`);
      
      // Solo asegurar token CSRF en el primer intento
      if (attempt === 1) {
        await apiService.ensureCsrfToken();
      }
      
      let response: AxiosResponse;
      switch (method) {
        case 'post':
          response = await api.post(url, data, config);
          break;
        case 'put':
          response = await api.put(url, data, config);
          break;
        case 'delete':
          response = await api.delete(url, config);
          break;
        case 'patch':
          response = await api.patch(url, data, config);
          break;
      }
      
      console.log(`✅ ${method.toUpperCase()} ${url} exitoso en intento ${attempt}`);
      return response.data;
      
    } catch (error: any) {
      console.log(`❌ Intento ${attempt} falló:`, error.response?.status, error.response?.data?.message);
      
      // Si es el último intento, lanzar el error
      if (attempt >= maxAttempts) {
        console.error(`🚫 Todos los intentos fallaron para ${method.toUpperCase()} ${url}`);
        throw error;
      }
      
      // Si el error es de CSRF, intentar diferentes estrategias
      if (isCsrfError(error)) {
        console.log(`🔧 Error CSRF en intento ${attempt}, probando estrategias...`);
        
        if (attempt === 1) {
          // Primer reintento: obtener nuevo token del servidor
          console.log('🔄 Estrategia 1: Renovar token CSRF del servidor');
          try {
            await apiService.refreshCsrfToken();
          } catch (refreshError) {
            console.warn('⚠️ No se pudo renovar token del servidor, continuando...');
          }
          
        } else if (attempt === 2) {
          // Segundo reintento: eliminar token CSRF por completo
          console.log('🧪 Estrategia 2: Eliminar token CSRF (backend puede no requerirlo)');
          if (typeof document !== 'undefined') {
            document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          }
        }
        
        // Esperar un poco antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      
      // Si no es error CSRF, lanzar inmediatamente
      throw error;
    }
  }
  
  // Esto nunca debería ejecutarse, pero TypeScript lo requiere
  throw new Error('Error inesperado en handleCsrfRetry');
};

// Métodos extendidos para operaciones comunes
const apiService = {
  // Método base para realizar solicitudes
  request: async <T = any>(config: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET con caché opcional
  get: async <T = any>(url: string, params?: object, useCache: boolean = false): Promise<T> => {
    try {
      const config: AxiosRequestConfig = { 
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
  
  // POST con manejo de errores mejorado y reintento con token CSRF
  post: async <T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> => {
    return handleCsrfRetry<T>('post', url, data, config);
  },
  
  // PUT con manejo de errores mejorado y reintento con token CSRF
  put: async <T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> => {
    return handleCsrfRetry<T>('put', url, data, config);
  },
  
  // DELETE con manejo de errores mejorado y reintento con token CSRF
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return handleCsrfRetry<T>('delete', url, undefined, config);
  },
  
  // PATCH con manejo de errores mejorado y reintento con token CSRF
  patch: async <T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> => {
    return handleCsrfRetry<T>('patch', url, data, config);
  },
  
  // Método para obtener un nuevo token CSRF
  refreshCsrfToken: async (): Promise<string> => {
    try {
      // PRIMERO: Intentar hacer una solicitud GET simple que debería devolver el token CSRF
      console.log('🔍 Intentando obtener token CSRF desde cualquier endpoint GET...');
      
      // Intentar con el endpoint de health para obtener headers CSRF (sin /api/ porque baseURL ya lo incluye)
      const healthResponse = await api.get('/health');
      const csrfFromHeaders = healthResponse.headers['x-csrf-token'] || healthResponse.headers['csrf-token'];
      
      if (csrfFromHeaders) {
        console.log('✅ Token CSRF obtenido desde headers de /api/health');
        if (typeof document !== 'undefined') {
          document.cookie = `XSRF-TOKEN=${csrfFromHeaders}; path=/; max-age=86400; secure; samesite=strict`;
        }
        return csrfFromHeaders;
      }
      
      // Intentar obtener el token CSRF del endpoint principal (sin /api/ porque baseURL ya lo incluye)
      const response = await api.get<CsrfTokenResponse>('/csrf-token');
      
      // Guardar el token en cookie
      if (typeof document !== 'undefined' && response.data.csrfToken) {
        document.cookie = `XSRF-TOKEN=${response.data.csrfToken}; path=/; max-age=86400; secure; samesite=strict`;
        return response.data.csrfToken;
      }
      
      throw new Error('No se recibió token CSRF válido');
    } catch (error: any) {
      console.error('❌ Error al renovar token CSRF:', error.response?.status, error.response?.data);
      
      // Mostrar información de debugging más detallada
      console.log('🔧 DEBUG: Información del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Intentar con diferentes endpoints conocidos (sin /api/ porque baseURL ya lo incluye)
      const possibleEndpoints = [
        '/auth/csrf-token',
        '/auth/csrf',
        '/security/csrf-token',
        '/csrf',
        '/auth/token',
        '/token'
      ];
      
      // Intentar cada endpoint alternativo
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔄 Intentando obtener token CSRF desde: ${endpoint}`);
          const fallbackResponse = await api.get<CsrfTokenResponse>(endpoint);
          
          console.log(`📊 Respuesta de ${endpoint}:`, fallbackResponse.data);
          
          // Si la respuesta tiene un token CSRF
          if (fallbackResponse.data) {
            const token = fallbackResponse.data.csrfToken || fallbackResponse.data.token;
            
            // Solo proceder si encontramos un token
            if (token) {
              // Guardar en cookie
              if (typeof document !== 'undefined') {
                document.cookie = `XSRF-TOKEN=${token}; path=/; max-age=86400; secure; samesite=strict`;
              }
              
              console.log('✅ Token CSRF obtenido correctamente del servidor desde:', endpoint);
              return token;
            }
          }
        } catch (fallbackError: any) {
          console.error(`❌ Error al intentar con endpoint ${endpoint}:`, fallbackError.response?.status);
        }
      }
      
      // NUEVA ESTRATEGIA: Intentar deshabilitar CSRF temporalmente para debug
      console.warn('⚠️ No se pudo obtener token CSRF del servidor. Intentando estrategias alternativas...');
      
      // Estrategia 1: Intentar sin token CSRF (para backends que no lo requieren en desarrollo)
      console.log('🧪 Estrategia 1: Intentar eliminar token CSRF y hacer solicitud de prueba...');
      if (typeof document !== 'undefined') {
        // Eliminar token existente
        document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        console.log('🗑️ Token CSRF eliminado para prueba');
        
        // Devolver string vacío para indicar que no hay token
        return '';
      }
      
      // Si está en servidor, devolver string vacío
      return '';
    }
  },
  
  // Asegurar que tenemos un token CSRF válido antes de hacer solicitudes
  ensureCsrfToken: async (): Promise<void> => {
    if (typeof document === 'undefined') return;
    
    // Verificar si ya tenemos un token CSRF
    const currentToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
      
    if (!currentToken) {
      console.log('No se encontró token CSRF, obteniendo uno nuevo...');
      await apiService.refreshCsrfToken();
    }
  },
  
  // Verificar conexión con el backend
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get<{status: string}>('/health'); // Sin /api/ porque baseURL ya lo incluye
      // Verificar que el status en la respuesta sea 'success' o 'ok'
      return response.data.status === 'success' || response.data.status === 'ok';
    } catch (error) {
      console.error('Error en health check:', error);
      return false;
    }
  },

  // Método de debugging para probar diferentes configuraciones CSRF
  debugCsrfConfig: async (): Promise<void> => {
    console.log('🔧 === DEBUGGING CSRF CONFIGURATION ===');
    
    // 1. Mostrar configuración actual
    const currentToken = getCookie('XSRF-TOKEN');
    console.log('📋 Token CSRF actual:', currentToken ? currentToken.substring(0, 20) + '...' : 'No encontrado');
    
    // 2. Probar endpoints comunes para obtener información del backend (sin /api/ porque baseURL ya lo incluye)
    const testEndpoints = [
      '/health',
      '/status', 
      '/auth/status',
      '/user/profile',
      '/csrf-token'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🧪 Probando endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(`📊 Headers disponibles:`, Object.keys(response.headers));
        
        // Buscar tokens CSRF en headers
        const csrfHeaders = Object.keys(response.headers).filter(h => 
          h.toLowerCase().includes('csrf') || h.toLowerCase().includes('token')
        );
        if (csrfHeaders.length > 0) {
          console.log(`🔑 Headers relacionados con CSRF/tokens encontrados:`, csrfHeaders);
        }
        
      } catch (error: any) {
        console.log(`❌ ${endpoint} - Error: ${error.response?.status} ${error.response?.statusText}`);
      }
    }
    
    // 3. Probar solicitud POST simple sin token CSRF
    try {
      console.log('🧪 Probando POST sin token CSRF...');
      // Eliminar temporalmente el token
      const originalToken = getCookie('XSRF-TOKEN');
      if (typeof document !== 'undefined') {
        document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
      
      // Hacer una solicitud POST de prueba (esto debería fallar pero nos dará info)
      await api.post('/test-endpoint', { test: true }); // Sin /api/ porque baseURL ya lo incluye
      console.log('✅ POST sin CSRF funcionó - el backend no requiere CSRF');
      
    } catch (error: any) {
      console.log(`📊 POST sin CSRF falló - Status: ${error.response?.status}`);
      console.log(`📋 Respuesta del backend:`, error.response?.data);
      console.log(`📋 Headers de respuesta:`, error.response?.headers);
      
      // Restaurar token si había uno
      const originalToken = currentToken;
      if (originalToken && typeof document !== 'undefined') {
        document.cookie = `XSRF-TOKEN=${originalToken}; path=/; max-age=86400; secure; samesite=strict`;
      }
    }
    
    console.log('🔧 === FIN DEBUGGING CSRF ===');
  },

  // Método para intentar diferentes estrategias de autenticación
  tryDifferentCsrfStrategies: async (): Promise<string | null> => {
    console.log('🔄 Probando diferentes estrategias para CSRF...');
    
    // Estrategia 1: Probar con diferentes nombres de headers
    const headerVariations = [
      'X-CSRF-Token',
      'X-CSRF-TOKEN', 
      'csrf-token',
      'CSRF-Token',
      'X-Requested-With',
      'X-XSRF-TOKEN'
    ];
    
    for (const headerName of headerVariations) {
      try {
        console.log(`🧪 Probando con header: ${headerName}`);
        const testConfig = {
          headers: {
            [headerName]: 'test-token-' + Date.now()
          }
        };
        
        await api.post('/test', { test: true }, testConfig); // Sin /api/ porque baseURL ya lo incluye
        console.log(`✅ Funcionó con header: ${headerName}`);
        return headerName;
        
      } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message || '';
        
        if (status === 404) {
          console.log(`ℹ️ ${headerName} - Endpoint no existe, pero header podría ser correcto`);
        } else if (status === 403 && !message.includes('CSRF')) {
          console.log(`✅ ${headerName} - Posible header correcto (error no relacionado con CSRF)`);
          return headerName;
        } else {
          console.log(`❌ ${headerName} - Status: ${status}, Message: ${message}`);
        }
      }
    }
    
    return null;
  }
};

export default apiService;