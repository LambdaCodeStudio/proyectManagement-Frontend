import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  LogOut, 
  Settings, 
  User, 
  Home, 
  CreditCard, 
  Users, 
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  UserCircle,
  Shield,
  Activity,
  FileText,
  Calendar
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, children, isActive, badge, onClick }) => {
  return (
    <a 
      href={href}
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/25' 
          : 'hover:bg-white/10 text-gray-300 hover:text-white'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
        isActive ? 'text-blue-400' : ''
      }`} />
      <span className="text-sm font-medium">{children}</span>
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
      )}
    </a>
  );
};

interface UserDropdownProps {
  user: any;
  isAdmin: boolean;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, isAdmin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
      >
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-gray-400">
              {isAdmin ? 'Administrador' : 'Cliente'}
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-white font-bold text-sm">
              {getInitials(user?.email || 'U')}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 gradient-card rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center text-white font-bold">
                {getInitials(user?.email || 'U')}
              </div>
              <div>
                <p className="text-white font-medium">{user?.email}</p>
                <p className="text-xs text-gray-400 flex items-center space-x-1">
                  {isAdmin && <Shield className="w-3 h-3" />}
                  <span>{isAdmin ? 'Administrador' : 'Cliente'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <a href="/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors">
              <UserCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Mi Perfil</span>
            </a>
            
            <a href="/settings" className="flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Configuración</span>
            </a>

            {isAdmin && (
              <a href="activity" className="flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">Logs de Actividad</span>
              </a>
            )}

            <a href="/help" className="flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-white">Ayuda</span>
            </a>

            <div className="border-t border-white/10 mt-2 pt-2">
              <button
                onClick={onLogout}
                className="flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-red-500/20 transition-colors text-red-300 hover:text-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationDropdownProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
  }>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 gradient-card rounded-xl shadow-2xl border border-white/20 z-50 max-h-96 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-blue-400">{unreadCount} nuevas</span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400 text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    !notification.read ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{notification.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                      <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/10">
              <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuickSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Buscar...</span>
        <kbd className="ml-auto text-xs bg-white/20 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div className="w-full max-w-lg gradient-card rounded-xl mx-4">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar deudas, pagos, usuarios..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {searchTerm && (
              <div className="border-t border-white/10 p-2">
                <div className="text-xs text-gray-400 px-2 py-1">Resultados de búsqueda</div>
                <div className="space-y-1">
                  <div className="px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white text-sm">Deuda #12345</p>
                        <p className="text-gray-400 text-xs">Servicio de hosting - $150</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Mock notifications - en producción vendría de un hook
  const notifications = [
    {
      id: '1',
      title: 'Pago Recibido',
      message: 'Se recibió un pago de $1,500 ARS',
      time: 'Hace 2 minutos',
      type: 'success' as const,
      read: false
    },
    {
      id: '2',
      title: 'Deuda Vencida',
      message: 'La deuda #12345 ha vencido',
      time: 'Hace 1 hora',
      type: 'warning' as const,
      read: false
    }
  ];

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isAdmin = hasRole('admin') || hasRole('administrator');

  const navigationItems = [
    { href: '/dashboard', icon: Home, label: 'Inicio', adminOnly: false },
    { href: 'debts', icon: CreditCard, label: 'Gestión', adminOnly: true },
    { href: 'users', icon: Users, label: 'Usuarios', adminOnly: true },
    { href: 'reports', icon: FileText, label: 'Reportes', adminOnly: true },
  ];

  return (
    <nav className="gradient-card border-b border-white/20 sticky top-0 z-40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Título */}
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">Λ</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient">Lambda Code Studio</h1>
                <p className="text-xs text-gray-400">Sistema de Pagos</p>
              </div>
            </a>
          </div>

          {/* Navegación Central */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  isActive={currentPath === item.href}
                  badge={item.href === 'debts' ? 3 : undefined}
                >
                  {item.label}
                </NavItem>
              );
            })}
          </div>

          {/* Búsqueda y Acciones */}
          <div className="flex items-center space-x-3">
            {/* Búsqueda Rápida */}
            <QuickSearch />

            {/* Notificaciones */}
            <NotificationDropdown notifications={notifications} />

            {/* Usuario Dropdown */}
            <UserDropdown 
              user={user} 
              isAdmin={isAdmin} 
              onLogout={handleLogout} 
            />

            {/* Menu móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    currentPath === item.href
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.href === 'debts' && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                  )}
                </a>
              );
            })}

            {/* Acciones adicionales en móvil */}
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              <a
                href="/search"
                className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Buscar</span>
              </a>
              
              <a
                href="/profile"
                className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                <span className="font-medium">Mi Perfil</span>
              </a>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};