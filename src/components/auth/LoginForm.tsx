import React, { useState, useEffect } from 'react';
import { AtSign, Lock, ArrowRight, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Usar el hook useAuth que ya corregimos
  const { login, loading: isLoading, error, clearError, debugAuth } = useAuth();

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
      setShowSuccessMessage(true);
      clearError();
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Cambiado: array vacío, clearError se ejecuta solo cuando sea necesario

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setShowSuccessMessage(false);

    // Basic validation
    if (!formData.email || !formData.password) {
      return; // useAuth manejará la validación
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return; // useAuth manejará la validación
    }

    try {
      console.log('🚀 Iniciando sesión con useAuth...');
      
      // Handle remember me functionality before login attempt
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          email: formData.email,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      // Usar el hook useAuth para login - esto manejará todo automáticamente
      const user = await login(formData.email, formData.password);
      
      console.log('✅ Login exitoso con useAuth:', user.email);

      // Show brief success message before redirect
      setShowSuccessMessage(true);
      
      console.log('🔄 Redirigiendo a dashboard en 1.5 segundos...');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error en login con useAuth:', err);
      
      setShowSuccessMessage(false);
      
      // Clear password on error for security
      setFormData(prev => ({ ...prev, password: '' }));
      
      // El error ya está manejado por useAuth, solo necesitamos limpiar la contraseña
    }
  };

  const handleRetry = async () => {
    // Usar función de debug del useAuth
    if (debugAuth) {
      debugAuth();
    }
    
    // Limpiar error después de 3 segundos
    setTimeout(() => clearError(), 3000);
  };

  const handleForgotPassword = () => {
    window.location.href = '/forgot-password';
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-purple mb-4">
            <span className="text-2xl font-bold text-white">Λ</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido de nuevo</h1>
          <p className="text-gray-300">
            ¿No tienes una cuenta?{' '}
            <a 
              href="/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Regístrate aquí
            </a>
          </p>
        </div>

        {/* Main Form Card */}
        <div className="gradient-card rounded-2xl p-8 card-hover">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-300 text-sm font-medium">
                    ¡Inicio de sesión exitoso! Redirigiendo al dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 disabled:opacity-50
                    ${error && !showSuccessMessage ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'}`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 disabled:opacity-50
                    ${error && !showSuccessMessage ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && !showSuccessMessage && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 text-sm">{error}</p>
                    <button 
                      type="button"
                      onClick={handleRetry}
                      className="mt-2 text-sm font-medium text-red-200 hover:text-red-100 underline transition-colors"
                      disabled={isLoading}
                    >
                      Debug información de autenticación
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-600 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50"
                />
                <span className="text-sm text-gray-300">Recuérdame</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="group relative w-full flex justify-center items-center py-3 px-4 
                rounded-xl text-white font-medium gradient-purple
                hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent
                transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {showSuccessMessage ? 'Redirigiendo...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Conexión segura y cifrada</span>
            </div>
          </div>

          {/* Debug section for development */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <details className="text-sm text-gray-400">
                <summary className="cursor-pointer hover:text-gray-300 flex items-center space-x-2">
                  <span>🔧 Debug (Solo desarrollo)</span>
                </summary>
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (debugAuth) {
                        debugAuth();
                      } else {
                        console.log('📋 Datos del formulario:', formData);
                        console.log('🍪 Cookies actuales:', document.cookie);
                      }
                    }}
                    className="block w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs"
                  >
                    Debug autenticación completo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('📋 Estado useAuth:', { isLoading, error });
                      console.log('📋 Datos del formulario:', formData);
                    }}
                    className="block w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs"
                  >
                    Ver estado actual
                  </button>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            © 2025 Lambda Code Studio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;