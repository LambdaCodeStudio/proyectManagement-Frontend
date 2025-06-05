import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface User {
  userId?: string;
  id?: string; // Algunos backends usan 'id' en lugar de 'userId'
  email: string;
  name?: string;
  role?: string; // Singular
  roles?: string[]; // Plural - para compatibilidad
  [key: string]: any;
}

interface LoginResponse {
  status: string;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

interface GetUserResponse {
  status: string;
  data: {
    user: User;
  };
}

interface RegisterResponse {
  status: string;
  message: string;
}

// Clase de utilidad para manejo de cookies
class SecureCookies {
  static get(name: string): string | undefined {
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
  }

  static set(name: string, value: string, options: { [key: string]: any } = {}): void {
    if (typeof document === 'undefined') return;
    
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const cookieOptions = {
      path: '/',
      secure: !isLocal,
      sameSite: 'strict',
      ...options
    };
    
    let cookieString = `${name}=${value}`;
    
    if (cookieOptions.maxAge) cookieString += `; max-age=${cookieOptions.maxAge}`;
    if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`;
    if (cookieOptions.secure) cookieString += '; secure';
    if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`;
    
    document.cookie = cookieString;
    console.log(`🍪 Cookie ${name} guardada:`, value.substring(0, 20) + '...');
  }

  static delete(name: string): void {
    if (typeof document === 'undefined') return;
    
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${isLocal ? '' : '; secure'}; samesite=strict`;
    console.log(`🗑️ Cookie ${name} eliminada`);
  }

  static debugAll(): void {
    console.log('🔧 === DEBUG TODAS LAS COOKIES ===');
    console.log('📄 document.cookie:', document.cookie);
    
    if (document.cookie) {
      const cookies = document.cookie.split(';');
      cookies.forEach((cookie, index) => {
        const [name, value] = cookie.trim().split('=');
        console.log(`🍪 ${index + 1}. ${name}:`, value?.substring(0, 30) + '...');
      });
    } else {
      console.log('❌ No hay cookies disponibles');
    }
    console.log('🔧 === FIN DEBUG COOKIES ===');
  }
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Log inicial para debugging
  useEffect(() => {
    console.log('🔥 useAuth initialized with state:', auth);
  }, []);

  // Función para normalizar datos de usuario (manejar diferentes estructuras)
  const normalizeUser = (userData: any): User => {
    // Manejar diferentes estructuras de respuesta del backend
    const user = userData.user || userData;
    
    return {
      userId: user.userId || user.id,
      id: user.id || user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      roles: user.roles || (user.role ? [user.role] : []), // Convertir role singular a array
      ...user // Mantener otros campos
    };
  };

  // Función para comprobar si hay sesión activa CORREGIDA
  const checkAuth = useCallback(async (silent: boolean = true) => {
    console.log('🔍 === INICIANDO checkAuth ===', { silent });
    
    if (typeof document === 'undefined') {
      console.log('❌ checkAuth: document no disponible (SSR)');
      return;
    }
    
    if (!silent) {
      SecureCookies.debugAll();
    }
    
    const token = SecureCookies.get('token');
    console.log('🔑 Token encontrado:', token ? 'SÍ (' + token.substring(0, 20) + '...)' : 'NO');
    
    if (!token) {
      console.log('❌ No hay token, estableciendo estado no autenticado');
      setAuth({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      return null;
    }
    
    try {
      console.log('🌐 Verificando token con servidor...');
      console.log('📡 Llamando a: /auth/me');
      
      const response = await apiService.get<GetUserResponse>('/auth/me');
      console.log('✅ Respuesta del servidor recibida:', response);
      
      // CORREGIDO: Manejar la estructura correcta de la respuesta
      if (response && response.status === 'success' && response.data && response.data.user) {
        const normalizedUser = normalizeUser(response.data.user);
        console.log('👤 Usuario verificado:', normalizedUser.email);
        
        setAuth({
          user: normalizedUser,
          isAuthenticated: true,
          loading: false,
          error: null
        });
        
        console.log('✅ Estado de autenticación actualizado exitosamente');
        return normalizedUser;
      } else {
        console.warn('⚠️ Respuesta del servidor no contiene estructura válida:', response);
        throw new Error('Respuesta del servidor inválida - estructura inesperada');
      }
    } catch (error: any) {
      console.error('❌ Error verificando autenticación:', error);
      
      // Limpiar datos de autenticación en caso de error
      console.log('🗑️ Limpiando autenticación por error...');
      SecureCookies.delete('token');
      
      setAuth({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: silent ? null : error.message
      });
      
      return null;
    } finally {
      console.log('🔍 === FIN checkAuth ===');
    }
  }, []);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    console.log('🚀 useAuth: useEffect ejecutado');
    
    const initAuth = async () => {
      console.log('⏳ Inicializando verificación de autenticación...');
      await checkAuth(false); // false = mostrar todos los logs
    };
    
    initAuth();
    
    // Verificar sesión periódicamente (cada 5 minutos)
    const interval = setInterval(() => {
      if (auth.isAuthenticated) {
        console.log('🔄 Verificación periódica de sesión');
        checkAuth(true);
      }
    }, 5 * 60 * 1000);
    
    return () => {
      console.log('🧹 Limpiando interval de useAuth');
      clearInterval(interval);
    };
  }, []); // Dependency array vacío

  // Log de cambios de estado para debugging
  useEffect(() => {
    console.log('📊 useAuth estado actualizado:', {
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!auth.user,
      userEmail: auth.user?.email,
      loading: auth.loading,
      error: auth.error
    });
  }, [auth]);

  // Función para iniciar sesión CORREGIDA
  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('🔐 === INICIANDO LOGIN ===', email);
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiService.post<LoginResponse>('/auth/login', { email, password });
      console.log('📊 Respuesta del login:', response);
      
      // CRÍTICO: Manejar la estructura real del backend
      if (response.status === 'success' && response.data?.token) {
        console.log('✅ Login exitoso, guardando token...');
        
        // Guardar token
        SecureCookies.set('token', response.data.token, { 
          maxAge: 86400 // 1 día
        });
        
        // Normalizar usuario
        const normalizedUser = normalizeUser(response.data.user);
        console.log('✅ Usuario normalizado:', normalizedUser);
        
        setAuth({
          user: normalizedUser,
          isAuthenticated: true,
          loading: false,
          error: null
        });
        
        console.log('✅ Estado establecido, login completado');
        return normalizedUser;
      } else {
        console.error('❌ Respuesta de login inválida:', response);
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error.message);
      
      setAuth(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message || 'Error al iniciar sesión'
      }));
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = async (redirectUrl: string = '/login'): Promise<void> => {
    try {
      console.log('👋 === INICIANDO LOGOUT ===');
      setAuth(prev => ({ ...prev, loading: true }));
      
      try {
        await apiService.post('/auth/logout');
        console.log('✅ Logout en servidor exitoso');
      } catch (error) {
        console.warn('⚠️ Error en logout del servidor:', error);
      }
      
      SecureCookies.delete('token');
      
      setAuth({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      
      console.log('✅ Logout completado');
      
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      console.error('❌ Error durante logout:', error);
      
      SecureCookies.delete('token');
      setAuth({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }
  };

  // Función para registrar nuevo usuario
  const register = async (email: string, password: string, name?: string): Promise<RegisterResponse> => {
    try {
      console.log('📝 Registrando usuario:', email);
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await apiService.post<RegisterResponse>('/auth/register', { 
        email, 
        password,
        name
      });
      
      setAuth(prev => ({ ...prev, loading: false }));
      return data;
    } catch (error: any) {
      setAuth(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message || 'Error al registrar usuario'
      }));
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.put<GetUserResponse>('/auth/me', profileData);
      
      if (response.status === 'success' && response.data?.user) {
        const normalizedUser = normalizeUser(response.data.user);
        setAuth(prev => ({ ...prev, user: normalizedUser, loading: false }));
        return normalizedUser;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      setAuth(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      await apiService.post('/auth/forgot-password', { email });
      setAuth(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuth(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      await apiService.post('/auth/reset-password', { token, password: newPassword });
      setAuth(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuth(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      await apiService.post('/auth/change-password', { currentPassword, newPassword });
      setAuth(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuth(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const clearError = () => {
    setAuth(prev => ({ ...prev, error: null }));
  };

  const hasRole = (role: string): boolean => {
    if (!auth.user) return false;
    
    // Verificar en array de roles
    if (auth.user.roles && auth.user.roles.includes(role)) return true;
    
    // Verificar rol singular
    if (auth.user.role && auth.user.role === role) return true;
    
    return false;
  };

  const debugAuth = () => {
    console.log('🔧 === DEBUG useAuth COMPLETO ===');
    console.log('👤 Usuario:', auth.user);
    console.log('🔐 Autenticado:', auth.isAuthenticated);
    console.log('⏳ Cargando:', auth.loading);
    console.log('❌ Error:', auth.error);
    
    SecureCookies.debugAll();
    
    const token = SecureCookies.get('token');
    if (token) {
      console.log('🧪 Probando endpoint /auth/me...');
      apiService.get('/auth/me')
        .then(data => {
          console.log('✅ /auth/me exitoso:', data);
          console.log('🔍 Estructura de respuesta:', {
            hasStatus: !!data.status,
            hasData: !!data.data,
            hasUser: !!(data.data && data.data.user),
            userEmail: data.data?.user?.email
          });
        })
        .catch(error => console.error('❌ /auth/me falló:', error));
    }
    
    console.log('🔧 === FIN DEBUG ===');
  };

  const forceRecheck = () => {
    console.log('🔄 Forzando nueva verificación de autenticación...');
    checkAuth(false);
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    login,
    logout,
    register,
    checkAuth,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError,
    hasRole,
    debugAuth,
    forceRecheck
  };
};