import { useState } from 'react'
import { LayoutDashboard, Ticket, PlusCircle, Settings, CircleDot } from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { label: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { label: 'Tickets', id: 'tickets', icon: Ticket },
  { label: 'Create Ticket', id: 'create-ticket', icon: PlusCircle },
  { label: 'Admin Panel', id: 'admin', icon: Settings },
]

export function TicketSidebar() {
  const [activeItem, setActiveItem] = useState('create-ticket')

  return (
    <aside className="flex h-screen w-52 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <CircleDot className="h-5 w-5 text-sidebar-primary" />
        <span className="text-lg font-semibold">VersaTicket</span>
      </div>

      {/* Mascot */}
      <div className="flex justify-center py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-4xl">🎫</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
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

      {/* User info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
            JS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Smith</span>
            <span className="text-xs text-sidebar-foreground/70">john.smith@company.com</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
