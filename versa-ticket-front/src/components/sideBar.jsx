import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import logo from '../assets/Logo-Versa.jpeg';
import mascot from '../assets/mascota.jpeg'; // Usamos tu mascota original

// Iconos de Lucide
import { 
  LayoutDashboard,
  PlusCircle, 
  CircleCheckBig,
  Settings,
  Headphones,
  LogOut,
  Ticket
} from 'lucide-react';

export function TicketSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper para las iniciales del usuario (Senior Style)
  const getInitials = () => {
    if (!user) return 'US';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    return (nombre.charAt(0) + (apellido.charAt(0) || nombre.charAt(1) || '')).toUpperCase();
  };

  // Badge de rol dinámico
  const getRolBadge = () => {
    const rolId = parseInt(user?.rol_id);
    switch (rolId) {
      case 2: // Administrador según tu DB
        return <p className="text-[10px] uppercase tracking-wider text-amber-400 mt-1 font-bold">Administrador</p>;
      case 3: // Agente
        return <p className="text-[10px] uppercase tracking-wider text-blue-400 mt-1 font-bold">Agente de Soporte</p>;
      default:
        return <p className="text-[10px] uppercase tracking-wider text-green-400 mt-1 font-bold">Usuario Final</p>;
    }
  };

  // Definición de rutas según el Rol (RBAC en el Frontend)
  const getNavItems = () => {
    const rolId = parseInt(user?.rol_id);
    
    const items = [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];
    
    // Si es Usuario Normal (Rol 1 o similar)
    if (rolId !== 2 && rolId !== 3) {
      items.push(
        { label: 'Crear Ticket', path: '/create-ticket', icon: PlusCircle },
        { label: 'Mis Tickets', path: '/inbox', icon: Ticket }
      );
    }
    
    // Si es Agente (Rol 3)
    if (rolId === 3) {
      items.push(
        { label: 'Tickets Asignados', path: '/assigned-tickets', icon: CircleCheckBig },
        { label: 'Resolver', path: '/resolve', icon: Headphones }
      );
    }
    
    // Si es Administrador (Rol 2)
    if (rolId === 2) {
      items.push(
        { label: 'Gestión Global', path: '/inbox', icon: Ticket },
        { label: 'Nuevo Ticket', path: '/create-ticket', icon: PlusCircle },
        { label: 'Configuración', path: '/admin', icon: Settings }
      );
    }
    
    return items;
  };

  const navItems = getNavItems();

  return (
    <aside className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#0e294b] to-[#071a33] text-white shadow-2xl fixed left-0 top-0 z-40">
      
      {/* Header con Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-700/50">
        <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg shadow-md" />
        <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
          VERSATICKET
        </span>
      </div>

      {/* Mascota Interactiva */}
      <div className="flex justify-center py-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border-2 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <img src={mascot} alt="Mascota Versa" className="h-20 w-20 object-contain" />
        </div>
      </div>

      {/* Perfil de Usuario */}
      {user && (
        <div className="mx-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white font-bold text-sm shadow-inner">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-none">{user.nombre} {user.apellido}</p>
              {getRolBadge()}
            </div>
          </div>
        </div>
      )}

      {/* Menú de Navegación */}
      <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 text-left group',
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg translate-x-1'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-amber-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-gray-700/50 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default TicketSidebar;