import { LayoutDashboard, Ticket, PlusCircle, Settings} from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/Logo-Versa.jpeg'
import mascot from '../assets/mascota.jpeg'

export function TicketSidebar({ user}) {
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = [
    { label: 'Panel', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tickets', path: '/tickets', icon: Ticket },
    { label: 'Crear Ticket', path: '/create-ticket', icon: PlusCircle },
    ...(user?.rol === "Administrador" || user?.rol_id === 2
      ? [{ label: 'Panel de Administración', path: '/admin', icon: Settings }]
      : [])
  ]

  return (
    <aside className="flex h-screen w-52 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <img src={logo} alt="Logo" className="h-5 w-5" />
        <span className="text-lg font-semibold">VersaTicket</span>
      </div>

      {/* Mascot */}
      <div className="flex justify-center py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-sidebar-primary">
          <img src={mascot} alt="Mascot" className="h-16 w-16" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User info dinámica */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          
          {/* Sacamos las iniciales (Ej. Si se llama Jose, pintamos JO) */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium uppercase text-sidebar-foreground">
            {user?.nombre ? user.nombre.substring(0, 2) : 'US'}
          </div>
          
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">
               {user?.nombre} {user?.apellido} {/* Nombre real */}
            </span>
            <span className="text-xs text-sidebar-foreground/70 truncate">
               {user?.email || 'usuario@versa.com'} {/* Correo real */}
            </span>
          </div>

        </div>
      </div>
    </aside>
  )
}