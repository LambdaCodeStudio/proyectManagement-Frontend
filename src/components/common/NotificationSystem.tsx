// src/components/common/NotificationSystem.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultDuration = 5000
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? defaultDuration
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limitar el número de notificaciones
      return updated.slice(0, maxNotifications);
    });

    // Auto-remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [generateId, defaultDuration, maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'success', title, message });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ 
      ...options, 
      type: 'error', 
      title, 
      message,
      duration: options?.duration ?? 7000 // Errores duran más tiempo
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'warning', title, message });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ ...options, type: 'info', title, message });
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // Wait for exit animation
  }, [onClose]);

  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = "border-l-4 backdrop-blur-md";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-900/90 border-green-400 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/90 border-red-400 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-orange-900/90 border-orange-400 text-orange-100`;
      case 'info':
        return `${baseStyles} bg-blue-900/90 border-blue-400 text-blue-100`;
      default:
        return `${baseStyles} bg-gray-900/90 border-gray-400 text-gray-100`;
    }
  };

  const getIcon = (type: NotificationType) => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-green-400" />;
      case 'error':
        return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-red-400" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 text-orange-400" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-400" />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <div
      className={`
        relative rounded-lg shadow-lg p-4 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${getNotificationStyles(notification.type)}
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {getIcon(notification.type)}
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
          
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={() => {
                  notification.action!.onClick();
                  handleClose();
                }}
                className="text-xs font-medium underline hover:no-underline focus:outline-none"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for non-persistent notifications */}
      {!notification.persistent && notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-white/40 rounded-b-lg"
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Hook personalizado para notificaciones comunes en la aplicación
export const useAppNotifications = () => {
  const notifications = useNotifications();

  return {
    ...notifications,
    
    // Notificaciones específicas de la aplicación
    paymentSuccess: (amount: number, currency: string = 'ARS') => {
      return notifications.success(
        'Pago Procesado',
        `Tu pago de ${currency === 'ARS' ? '$' : 'US$'}${amount.toLocaleString()} ha sido procesado exitosamente.`,
        { duration: 6000 }
      );
    },

    paymentError: (error: string) => {
      return notifications.error(
        'Error en el Pago',
        error,
        { 
          duration: 8000,
          action: {
            label: 'Intentar de nuevo',
            onClick: () => window.location.reload()
          }
        }
      );
    },

    debtCreated: (description: string) => {
      return notifications.success(
        'Deuda Creada',
        `La deuda "${description}" ha sido creada exitosamente.`
      );
    },

    reminderSent: (recipientEmail: string) => {
      return notifications.info(
        'Recordatorio Enviado',
        `Se ha enviado un recordatorio a ${recipientEmail}.`
      );
    },

    sessionExpiring: (minutesLeft: number) => {
      return notifications.warning(
        'Sesión por Expirar',
        `Tu sesión expirará en ${minutesLeft} minutos. ¿Deseas extenderla?`,
        {
          persistent: true,
          action: {
            label: 'Extender Sesión',
            onClick: () => {
              // Implementar lógica para extender sesión
              console.log('Extending session...');
            }
          }
        }
      );
    },

    connectionLost: () => {
      return notifications.error(
        'Conexión Perdida',
        'Se ha perdido la conexión con el servidor. Reintentando...',
        {
          persistent: true,
          action: {
            label: 'Reintentar',
            onClick: () => window.location.reload()
          }
        }
      );
    },

    updateAvailable: () => {
      return notifications.info(
        'Actualización Disponible',
        'Hay una nueva versión disponible. Recarga la página para actualizar.',
        {
          persistent: true,
          action: {
            label: 'Actualizar',
            onClick: () => window.location.reload()
          }
        }
      );
    }
  };
};

// Componente para mostrar notificaciones de desarrollo
export const DevNotifications: React.FC = () => {
  const notifications = useAppNotifications();

  // Solo mostrar en desarrollo
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <details className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700">
        <summary className="px-3 py-2 text-sm text-gray-300 cursor-pointer hover:text-white">
          🔧 Test Notifications
        </summary>
        <div className="p-3 space-y-2 border-t border-gray-700">
          <button
            onClick={() => notifications.success('Test Success', 'This is a success message')}
            className="block w-full text-left px-2 py-1 text-xs bg-green-600/20 text-green-300 rounded hover:bg-green-600/30"
          >
            Success
          </button>
          <button
            onClick={() => notifications.error('Test Error', 'This is an error message')}
            className="block w-full text-left px-2 py-1 text-xs bg-red-600/20 text-red-300 rounded hover:bg-red-600/30"
          >
            Error
          </button>
          <button
            onClick={() => notifications.warning('Test Warning', 'This is a warning message')}
            className="block w-full text-left px-2 py-1 text-xs bg-orange-600/20 text-orange-300 rounded hover:bg-orange-600/30"
          >
            Warning
          </button>
          <button
            onClick={() => notifications.info('Test Info', 'This is an info message')}
            className="block w-full text-left px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30"
          >
            Info
          </button>
          <button
            onClick={() => notifications.paymentSuccess(1500, 'ARS')}
            className="block w-full text-left px-2 py-1 text-xs bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30"
          >
            Payment Success
          </button>
        </div>
      </details>
    </div>
  );
};

export default {
  NotificationProvider,
  useNotifications,
  useAppNotifications,
  DevNotifications
};