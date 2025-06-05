// src/components/auth/shared/AuthComponents.tsx (Actualizado para el nuevo diseño)
import React from 'react';
import { AtSign, Lock, EyeOff, Eye } from 'lucide-react';

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ElementType;
  error?: string;
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  disabled?: boolean;
  autoComplete?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  error,
  showPasswordToggle = false,
  onPasswordToggle,
  disabled = false,
  autoComplete
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 disabled:opacity-50
          ${error ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'}`}
        required
      />
      {showPasswordToggle && onPasswordToggle && (
        <button
          type="button"
          onClick={onPasswordToggle}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          {type === 'password' ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      )}
    </div>
  );
};

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string | React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => (
  <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
    <div className="max-w-md w-full">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-purple mb-4">
          <span className="text-2xl font-bold text-white">Λ</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && (
          <div className="text-gray-300">{subtitle}</div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="gradient-card rounded-2xl p-8 card-hover">
        {children}
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

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
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
              {req.test && (
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SubmitButtonProps {
  isLoading: boolean;
  text: string;
  loadingText: string;
  disabled?: boolean;
  icon?: React.ElementType;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  isLoading, 
  text, 
  loadingText,
  disabled = false,
  icon: Icon
}) => (
  <button
    type="submit"
    disabled={isLoading || disabled}
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
        {loadingText}
      </>
    ) : (
      <>
        {text}
        {Icon && <Icon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
      </>
    )}
  </button>
);

// Utility functions
export const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra minúscula';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra mayúscula';
  }
  return '';
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Error Message Component
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Reintentar',
  type = 'error'
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      default:
        return 'bg-red-500/20 border-red-500/30 text-red-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${getStyles()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
          {onRetry && (
            <button 
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium hover:underline transition-all"
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  InputField,
  AuthLayout,
  PasswordRequirements,
  SubmitButton,
  ErrorMessage,
  validatePassword,
  validateEmail
};