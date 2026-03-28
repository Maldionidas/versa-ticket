import { useState } from 'react'
import { TicketSidebar } from './components/sideBar'
import { CreateTicketForm } from './pages/createTicket'
import { AdminPanel } from './pages/panelAdmin'
import { Camera } from 'lucide-react'

function App() {
  const user = {
    id: 1,
    nombre: "Jose",
    rol: "Administrador",
    permisos: {
    users: { create: true, read: true, update: true, delete: true },
    areas: { create: true, read: true, update: true, delete: true },
    roles: { create: true, read: true, update: true, delete: true },
    categorias: { create: true, read: true, update: true, delete: true },
    campos: { create: true, read: true, update: true, delete: true }
  }
  }
  const [activeView, setActiveView] = useState('create-ticket')

  return (
    <div className="flex h-screen">
      <TicketSidebar user={user} setActiveView={setActiveView} />

      {/* Render dinámico */}
      {activeView === 'create-ticket' && <CreateTicketForm />}
      {activeView === 'admin' && user.rol === "Administrador" &&<AdminPanel user={user}/>}
    </div>
  )
}

export default App
