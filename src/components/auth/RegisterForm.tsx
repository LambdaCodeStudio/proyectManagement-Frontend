import React, { useState } from 'react';
import { AtSign, Lock, ArrowRight } from 'lucide-react';
import { 
  InputField, 
  AuthLayout, 
  PasswordRequirements,
  validatePassword,
  validateEmail 
} from './shared/AuthComponents';
import api from '../../services/api';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar email
    if (!validateEmail(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    // Validar contraseña
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando registro de usuario...');
      
      // El api.post ahora maneja automáticamente:
      // - Obtención/validación de tokens CSRF
      // - Reintentos automáticos si hay errores CSRF
      // - Múltiples estrategias de autenticación
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Registro exitoso:', response);
      
      // Redirigir a login con parámetro de éxito
      window.location.href = '/login?registered=true';
      
    } catch (err: any) {
      console.error('❌ Error en registro:', err);
      
      setIsLoading(false);
      
      // Manejar diferentes tipos de errores
      if (err.response?.status === 400) {
        // Error de validación del backend
        setError(err.response?.data?.message || 'Los datos proporcionados no son válidos');
      } else if (err.response?.status === 409) {
        // Usuario ya existe
        setError('Este correo electrónico ya está registrado');
      } else if (err.response?.status === 422) {
        // Errores de validación detallados
        const errorMsg = err.response?.data?.message || 'Error de validación';
        setError(errorMsg);
      } else if (err.message?.includes('CSRF')) {
        // Error específico de CSRF (aunque debería ser raro ahora)
        setError('Error de seguridad. Por favor, recargue la página e intente nuevamente.');
      } else if (err.message?.includes('conexión') || err.message?.includes('red')) {
        // Error de red
        setError('Error de conexión. Verifique su internet e intente nuevamente.');
      } else {
        // Error genérico
        setError(
          err.response?.data?.message || 
          err.response?.data?.msg || 
          err.message || 
          'Error al registrar usuario. Intente nuevamente.'
        );
      }
    }
  };

  const handleRetry = async () => {
    try {
      setError('🔄 Intentando renovar configuración de seguridad...');
      
      // Intentar diferentes estrategias CSRF
      const headerType = await api.tryDifferentCsrfStrategies();
      
      if (headerType === 'BYPASS_MODE') {
        setError('🛠️ Modo desarrollo activado. Intente registrarse nuevamente.');
      } else if (headerType) {
        setError(`✅ Configuración renovada (usando ${headerType}). Intente registrarse nuevamente.`);
      } else {
        // Si no se encontró una estrategia, intentar con el debugging completo
        await api.debugCsrfConfig();
        setError('✅ Configuración renovada. Intente registrarse nuevamente.');
      }
      
      // Limpiar el error después de unos segundos
      setTimeout(() => setError(''), 5000);
      
    } catch (err: any) {
      console.error('Error al intentar estrategias CSRF:', err);
      setError('❌ No se pudo renovar la configuración. Intente recargar la página.');
    }
  };

  return (
    <AuthLayout
      title="Crear nueva cuenta"
      subtitle={
        <span>
          ¿Ya tienes una cuenta?{' '}
          <a 
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Inicia sesión aquí
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
          />

          <InputField
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Confirmar contraseña"
            icon={Lock}
            error={error}
            showPasswordToggle
            onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
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
              
              {/* Botón de reintento solo para errores específicos */}
              {(error.includes('seguridad') || error.includes('CSRF') || error.includes('conexión')) && (
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

        <PasswordRequirements password={formData.password} />

        <button
          type="submit"
          disabled={isLoading}
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
                Creando cuenta...
              </>
            ) : (
              <>
                Crear cuenta
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
        
        {/* Botón de debugging solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={async () => {
              console.log('🔧 Ejecutando debugging CSRF...');
              await api.debugCsrfConfig();
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            🔧 Debug CSRF (Solo desarrollo)
          </button>
        )}
      </form>
    </AuthLayout>
  );
};

export default RegisterForm;