
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NotificationProvider, DevNotifications } from './components/common/NotificationSystem';
import './index.css';

// Componente principal que incluye todos los proveedores
const App: React.FC = () => {
  return (
    <NotificationProvider maxNotifications={5} defaultDuration={5000}>
      <div className="min-h-screen gradient-bg">
        {/* Aquí irían tus rutas principales */}
        <div id="app-content">
          {/* El contenido se renderiza mediante los scripts de Astro */}
        </div>
        
        {/* Sistema de notificaciones de desarrollo */}
        <DevNotifications />
      </div>
    </NotificationProvider>
  );
};

// Solo ejecutar si no estamos en un entorno de Astro
if (typeof window !== 'undefined' && !window.astro) {
  const container = document.getElementById('root');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  }
}

export default App;