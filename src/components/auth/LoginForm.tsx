import React, { useState, useEffect } from 'react';
import { AtSign, Lock, ArrowRight } from 'lucide-react';
import { InputField, AuthLayout } from './shared/AuthComponents';
import api from '../../services/api';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for remembered credentials
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      try {
        const { email, password } = JSON.parse(remembered);
        setFormData(prev => ({
          ...prev,
          email,
          password,
          rememberMe: true
        }));
      } catch (err) {
        localStorage.removeItem('rememberedUser');
      }
    }

    // Check for registration success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setError(''); // Clear any errors
      // You could show a success message here instead
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Por favor ingresa tu correo electrónico y contraseña');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando sesión de usuario...');
      
      // Handle remember me functionality before login attempt
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          email: formData.email,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      // Call login API - Note: NO '/api' prefix because baseURL already includes it
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Login exitoso:', response);

      // Handle successful login
      if (response.token) {
        // Store auth token (the api interceptor should handle this automatically)
        console.log('🔐 Token de autenticación recibido');
      }

      // Handle user data
      if (response.user) {
        console.log('👤 Datos de usuario recibidos:', response.user.email);
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      
      setIsLoading(false);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        // Bad request - invalid credentials format
        setError('Datos de inicio de sesión inválidos');
      } else if (err.response?.status === 401) {
        // Unauthorized - wrong credentials
        setError('Correo electrónico o contraseña incorrectos');
      } else if (err.response?.status === 403) {
        // Forbidden - account issues
        setError('Tu cuenta está bloqueada o suspendida. Contacta al soporte.');
      } else if (err.response?.status === 404) {
        // Not found - probably API endpoint issue
        setError('Servicio de autenticación no disponible. Intenta más tarde.');
      } else if (err.response?.status === 422) {
        // Validation errors
        const errorMsg = err.response?.data?.message || 'Error de validación en el servidor';
        setError(errorMsg);
      } else if (err.response?.status === 429) {
        // Too many requests
        setError('Demasiados intentos de inicio de sesión. Espera un momento antes de intentar de nuevo.');
      } else if (err.message?.includes('conexión') || err.message?.includes('red') || err.message?.includes('Network')) {
        // Network error
        setError('Error de conexión. Verifique su internet e intente nuevamente.');
      } else {
        // Generic error
        setError(
          err.response?.data?.message || 
          err.response?.data?.msg || 
          err.message || 
          'Error al iniciar sesión. Intente nuevamente.'
        );
      }

      // Clear password on error for security
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };

  const handleRetry = async () => {
    try {
      setError('🔄 Verificando conexión con el servidor...');
      
      // Test server connectivity
      const isHealthy = await api.checkHealth();
      if (isHealthy) {
        setError('✅ Conexión con servidor OK. Intente iniciar sesión nuevamente.');
      } else {
        setError('❌ El servidor no está respondiendo. Intente más tarde.');
      }
      
      // Clear the error after a few seconds
      setTimeout(() => setError(''), 3000);
      
    } catch (err: any) {
      setError('❌ No se pudo conectar con el servidor. Verifique su conexión.');
    }
  };

  const handleForgotPassword = () => {
    // You can replace this with your actual forgot password logic
    window.location.href = '/forgot-password';
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle={
        <span>
          ¿No tienes una cuenta?{' '}
          <a 
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Regístrate aquí
          </a>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <InputField
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Correo electrónico"
            icon={AtSign}
            error={error}
            disabled={isLoading}
            autoComplete="email"
          />

          <InputField
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Contraseña"
            icon={Lock}
            error={error}
            showPasswordToggle
            onPasswordToggle={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className={`text-sm p-3 rounded-lg ${
            error.includes('✅') 
              ? 'text-green-700 bg-green-50 border border-green-200' 
              : error.includes('🔄')
              ? 'text-blue-700 bg-blue-50 border border-blue-200'
              : 'text-red-600 bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start justify-between">
              <span className="flex-1">{error}</span>
              
              {/* Show retry button for connection/server errors */}
              {(error.includes('conexión') || error.includes('servidor') || error.includes('disponible')) && (
                <button 
                  type="button"
                  onClick={handleRetry}
                  className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-800 underline flex-shrink-0"
                  disabled={isLoading}
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Recuérdame
            </label>
          </div>

          <div className="text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.email || !formData.password}
          className="group relative w-full flex justify-center py-3 px-4 
            border border-transparent rounded-lg text-white bg-blue-600 
            hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-blue-500 transition-all
            duration-200 ease-in-out transform hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="flex items-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>

        {/* Debug section for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="text-sm text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">🔧 Debug (Solo desarrollo)</summary>
              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    console.log('🔧 Verificando salud del servidor...');
                    const isHealthy = await api.checkHealth();
                    console.log('🏥 Estado del servidor:', isHealthy ? 'OK' : 'ERROR');
                  }}
                  className="block w-full text-left px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Test conexión servidor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('📋 Datos del formulario:', formData);
                    console.log('📍 URL base API:', api.defaults?.baseURL);
                  }}
                  className="block w-full text-left px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Ver datos del formulario
                </button>
              </div>
            </details>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default LoginForm;