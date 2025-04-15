import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Home, Users, Briefcase, FileText, CreditCard, BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentPath?: string;
}

export const Navbar = ({ currentPath = window.location.pathname }: NavbarProps) => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    return currentPath.startsWith(path);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
    { name: 'Clientes', path: '/clientes', icon: <Users className="w-5 h-5 mr-2" /> },
    { name: 'Proyectos', path: '/proyectos', icon: <Briefcase className="w-5 h-5 mr-2" /> },
    { name: 'Facturas', path: '/facturas', icon: <FileText className="w-5 h-5 mr-2" /> },
    { name: 'Pagos', path: '/pagos', icon: <CreditCard className="w-5 h-5 mr-2" /> },
    { name: 'Reportes', path: '/reportes', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
  ];

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y menú de navegación desktop */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button 
                onClick={() => handleNavigation('/dashboard')} 
                className="text-xl font-bold text-primary"
              >
                Administrador de Proyectos
              </button>
            </div>
            
            {/* Menú de escritorio */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${isActivePath(item.path)
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Botones de la derecha */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Cerrar Sesión
            </button>
          </div>
          
          {/* Botón de menú móvil */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Abrir menú principal</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavigation(item.path);
                }}
                className={`flex items-center w-full px-4 py-2 text-base font-medium
                  ${isActivePath(item.path)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
            
            <div className="border-t border-gray-200 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-2 text-base font-medium text-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};