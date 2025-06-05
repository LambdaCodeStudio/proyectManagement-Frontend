import React, { useState } from 'react';
import { AtSign, Lock, ArrowRight, Shield, CheckCircle, AlertCircle, User } from 'lucide-react';
import { validatePassword, validateEmail } from './shared/AuthComponents';
import api from '../../services/api';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const requirements = [
    { text: 'Mínimo 8 caracteres', test: password.length >= 8 },
    { text: 'Al menos una letra minúscula', test: /[a-z]/.test(password) },
    { text: 'Al menos una letra mayúscula', test: /[A-Z]/.test(password) },
    { text: 'Al menos un número', test: /\d/.test(password) }
  ];

  const passedCount = requirements.filter(req => req.test).length;
  const strengthLevel = passedCount === 0 ? 0 : (passedCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthLevel < 25) return 'bg-red-500';
    if (strengthLevel < 50) return 'bg-orange-500';
    if (strengthLevel < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthLevel < 25) return 'Muy débil';
    if (strengthLevel < 50) return 'Débil';
    if (strengthLevel < 75) return 'Moderada';
    return 'Fuerte';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Seguridad de la contraseña</span>
          <span className={`text-xs font-medium ${
            strengthLevel < 50 ? 'text-red-400' : 
            strengthLevel < 75 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthLevel}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className={`flex items-center space-x-2 text-xs transition-colors ${
            req.test ? 'text-green-400' : 'text-gray-500'
          }`}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
              req.test ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              {req.test && <CheckCircle className="w-2 h-2 text-white" />}
            </div>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [step, setStep] = useState(1); // For multi-step feel

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
      
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Registro exitoso:', response);
      
      // Show success state briefly before redirect
      setStep(3);
      setTimeout(() => {
        window.location.href = '/login?registered=true';
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Error en registro:', err);
      
      setIsLoading(false);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Los datos proporcionados no son válidos');
      } else if (err.response?.status === 409) {
        setError('Este correo electrónico ya está registrado');
      } else if (err.response?.status === 422) {
        const errorMsg = err.response?.data?.message || 'Error de validación';
        setError(errorMsg);
      } else if (err.message?.includes('CSRF')) {
        setError('Error de seguridad. Por favor, recargue la página e intente nuevamente.');
      } else if (err.message?.includes('conexión') || err.message?.includes('red')) {
        setError('Error de conexión. Verifique su internet e intente nuevamente.');
      } else {
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
      
      const headerType = await api.tryDifferentCsrfStrategies();
      
      if (headerType === 'BYPASS_MODE') {
        setError('🛠️ Modo desarrollo activado. Intente registrarse nuevamente.');
      } else if (headerType) {
        setError(`✅ Configuración renovada (usando ${headerType}). Intente registrarse nuevamente.`);
      } else {
        await api.debugCsrfConfig();
        setError('✅ Configuración renovada. Intente registrarse nuevamente.');
      }
      
      setTimeout(() => setError(''), 5000);
      
    } catch (err: any) {
      console.error('Error al intentar estrategias CSRF:', err);
      setError('❌ No se pudo renovar la configuración. Intente recargar la página.');
    }
  };

  const isFormValid = formData.email && formData.password && formData.confirmPassword && 
                     validateEmail(formData.email) && !validatePassword(formData.password) &&
                     formData.password === formData.confirmPassword;

  // Success step
  if (step === 3) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="gradient-card rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">¡Cuenta creada con éxito!</h2>
            <p className="text-gray-300 mb-6">
              Tu cuenta ha sido creada exitosamente. Serás redirigido al inicio de sesión en unos momentos.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-purple mb-4">
            <span className="text-2xl font-bold text-white">Λ</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear nueva cuenta</h1>
          <p className="text-gray-300">
            ¿Ya tienes una cuenta?{' '}
            <a 
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-white/20 text-gray-400'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
              step >= 2 ? 'bg-blue-500' : 'bg-white/20'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-white/20 text-gray-400'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Datos básicos</span>
            <span className="text-xs text-gray-400">Confirmación</span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="gradient-card rounded-2xl p-8 card-hover">
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
                    ${error ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'}`}
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
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 disabled:opacity-50
                    ${error ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'}`}
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

            {/* Password Strength Indicator */}
            <PasswordStrength password={formData.password} />

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200 disabled:opacity-50
                    ${error ? 'border-red-500/50' : 
                      formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500/50' :
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500/50' :
                      'border-white/20 hover:border-white/30'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
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
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`flex items-center space-x-2 text-xs ${
                  formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 text-sm">{error}</p>
                    {(error.includes('seguridad') || error.includes('CSRF') || error.includes('conexión')) && (
                      <button 
                        type="button"
                        onClick={handleRetry}
                        className="mt-2 text-sm font-medium text-red-200 hover:text-red-100 underline transition-colors"
                        disabled={isLoading}
                      >
                        Reintentar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-gray-300">
                Al crear una cuenta, aceptas nuestros{' '}
                <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Términos de Servicio
                </a>{' '}
                y{' '}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Política de Privacidad
                </a>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
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
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
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
                    onClick={async () => {
                      console.log('🔧 Ejecutando debugging CSRF...');
                      await api.debugCsrfConfig();
                    }}
                    className="block w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs"
                  >
                    Debug CSRF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('📋 Datos del formulario:', formData);
                      console.log('✅ Formulario válido:', isFormValid);
                    }}
                    className="block w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs"
                  >
                    Ver estado del formulario
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

export default RegisterForm;