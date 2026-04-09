// src/components/sideBar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import logo from '../assets/Logo-Versa.jpeg';
import mascot from '../assets/mascota.png';

// Iconos
import { 
  LayoutDashboard,
  PlusCircle, 
  CircleCheckBig,
  Settings,
  Users,
  Headphones,
  LogOut
} from 'lucide-react';

export function TicketSidebar({ activeItem, onViewChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (user?.nombre) {
      return user.nombre.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.nombre) {
      return user.nombre;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const getRolBadge = () => {
    switch (user?.rol_id) {
      case 2:
        return <p className="text-xs text-amber-400 mt-1 font-semibold">Administrador</p>;
      case 3:
        return <p className="text-xs text-blue-400 mt-1 font-semibold">Agente</p>;
      case 4:
        return <p className="text-xs text-gray-400 mt-1 font-semibold">Invitado</p>;
      default:
        return <p className="text-xs text-green-400 mt-1 font-semibold">Usuario</p>;
    }
  };

  const handleNavigation = (path, id) => {
    if (onViewChange) {
      onViewChange(id);
    }
    navigate(path);
  };

  // Items según el rol del usuario
  const getNavItems = () => {
    const userRole = user?.rol_id;
    
    // Items comunes para todos los usuarios autenticados
    const commonItems = [
      { label: 'Dashboard', id: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ];
    
    // Usuario normal (rol_id = 1)
    if (userRole === 1) {
      return [
        ...commonItems,
        { label: 'Crear Ticket', id: 'create-ticket', icon: PlusCircle, path: '/create-ticket' },
        { label: 'Mis Tickets', id: 'inbox', icon: CircleCheckBig, path: '/inbox' },
      ];
    }
    
    // Agente (rol_id = 3)
    if (userRole === 3) {
      return [
        ...commonItems,
        { label: 'Tickets Asignados', id: 'assigned', icon: CircleCheckBig, path: '/assigned-tickets' },
        { label: 'Resolver Tickets', id: 'resolve', icon: Headphones, path: '/resolve-tickets' },
      ];
    }
    
    // Administrador (rol_id = 2)
    if (userRole === 2) {
      return [
        ...commonItems,
        { label: 'Todos los Tickets', id: 'all-tickets', icon: CircleCheckBig, path: '/Inbox' },
        { label: 'Crear Ticket', id: 'create-ticket', icon: PlusCircle, path: '/create-ticket' },
        { label: 'Panel Admin', id: 'admin', icon: Settings, path: '/admin' },
      ];
    }
    
    // Invitado (rol_id = 4)
    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#0e294b] to-[#071a33] text-white shadow-xl fixed left-0 top-0">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-700">
        <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg" />
        <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          VersaTicket
        </span>
      </div>

      {/* Mascota */}
      <div className="flex justify-center py-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
          <img src={mascot} alt="Mascot" className="h-20 w-20" />
        </div>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="mx-4 mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getUserName()}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {getRolBadge()}
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 text-left',
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Botón de cerrar sesión */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default TicketSidebar;