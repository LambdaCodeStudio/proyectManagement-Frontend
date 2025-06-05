import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminDashboard } from './AdminDashboard';
import { ClientDashboard } from './ClientDashboard';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export const DashboardMain: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, hasRole, debugAuth } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Simular inicialización del dashboard
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Debug: Recopilar información de estado
  useEffect(() => {
    const gatherDebugInfo = () => {
      const info = {
        user: user ? {
          userId: user.userId,
          email: user.email,
          roles: user.roles,
          hasUserData: !!user
        } : null,
        isAuthenticated,
        authLoading,
        isInitializing,
        timestamp: new Date().toISOString(),
        cookies: {
          token: document.cookie.includes('token=') ? 'Presente' : 'Ausente',
          tokenValue: document.cookie.split('token=')[1]?.split(';')[0]?.substring(0, 20) + '...' || 'N/A'
        },
        localStorage: {
          available: typeof localStorage !== 'undefined',
          keys: typeof localStorage !== 'undefined' ? Object.keys(localStorage) : []
        }
      };
      
      setDebugInfo(info);
      
      // Log para debugging
      console.log('🔧 Dashboard Debug Info:', info);
    };

    gatherDebugInfo();
    
    // Actualizar debug info cada vez que cambien los estados
    const interval = setInterval(gatherDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated, authLoading, isInitializing]);

  // Función para forzar recheck de autenticación
  const forceAuthCheck = () => {
    console.log('🔄 Forzando verificación de autenticación...');
    if (debugAuth) {
      debugAuth();
    }
    window.location.reload();
  };

  // Loading states
  if (authLoading || isInitializing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full gradient-purple animate-pulse"></div>
            <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="text-gray-300 text-sm">Cargando dashboard...</p>
          
          {/* Debug info durante loading */}
          <div className="text-xs text-gray-400 text-center max-w-md">
            <div>Auth Loading: {authLoading ? 'true' : 'false'}</div>
            <div>Initializing: {isInitializing ? 'true' : 'false'}</div>
            <div>Token Cookie: {document.cookie.includes('token=') ? '✅' : '❌'}</div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - Con información de debugging mejorada
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Acceso No Autorizado</h2>
          <p className="text-gray-300 mb-6">Por favor, inicia sesión para continuar</p>
          
          {/* Panel de debugging expandido */}
          <div className="mb-6 p-6 bg-gray-900/50 border border-gray-700 rounded-lg text-left">
            <h3 className="text-yellow-400 font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Información de Debugging
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="font-medium">Estado de Autenticación:</span>
                  <div className="ml-2 text-gray-400">
                    <div>isAuthenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'true' : 'false'}</span></div>
                    <div>user exists: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? 'true' : 'false'}</span></div>
                    <div>authLoading: <span className={authLoading ? 'text-yellow-400' : 'text-gray-400'}>{authLoading ? 'true' : 'false'}</span></div>
                  </div>
                </div>
                
                <div className="text-gray-300">
                  <span className="font-medium">Usuario:</span>
                  <div className="ml-2 text-gray-400">
                    <div>Email: {user?.email || 'undefined'}</div>
                    <div>ID: {user?.userId || 'undefined'}</div>
                    <div>Roles: {user?.roles?.join(', ') || 'undefined'}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="font-medium">Cookies:</span>
                  <div className="ml-2 text-gray-400">
                    <div>Token presente: <span className={debugInfo?.cookies?.token === 'Presente' ? 'text-green-400' : 'text-red-400'}>{debugInfo?.cookies?.token || 'Verificando...'}</span></div>
                    <div className="font-mono text-xs break-all">
                      {debugInfo?.cookies?.tokenValue || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-300">
                  <span className="font-medium">Timestamp:</span>
                  <div className="ml-2 text-gray-400 text-xs">
                    {debugInfo?.timestamp || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botón para debugging */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={forceAuthCheck}
                className="inline-flex items-center px-3 py-2 text-xs border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Forzar Verificación
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <a 
              href="/login"
              className="inline-flex items-center px-6 py-3 rounded-lg gradient-purple hover:opacity-90 transition-opacity text-white font-medium"
            >
              Ir a Iniciar Sesión
            </a>
            
            <div className="text-xs text-gray-500">
              Si el problema persiste, abre las herramientas de desarrollador (F12) y revisa la consola
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine which dashboard to show based on user role
  const isAdmin = hasRole('admin') || hasRole('administrator');

  return (
    <div className="space-y-6">
      {/* Debug banner (solo en desarrollo) */}
      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-200 text-sm font-medium">
                ✅ Autenticación exitosa - Dashboard cargado
              </span>
            </div>
            <div className="text-xs text-green-300">
              Usuario: {user.email} | Rol: {isAdmin ? 'Admin' : 'Cliente'}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="gradient-card rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenido, {user.email.split('@')[0]}
            </h1>
            <p className="text-gray-300">
              {isAdmin 
                ? 'Panel de administración - Gestiona todos los aspectos del sistema' 
                : 'Panel de cliente - Visualiza tus deudas y pagos'
              }
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-20 h-20 rounded-full gradient-purple flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-based Dashboard */}
      {isAdmin ? <AdminDashboard /> : <ClientDashboard />}
    </div>
  );
};