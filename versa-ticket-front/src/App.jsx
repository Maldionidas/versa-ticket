import { useState } from 'react'
import { TicketSidebar } from './components/sideBar'
import { CreateTicketForm } from './components/createTicket'
import { AdminUsers } from './components/adminUsers'

function App() {
  const user = {
    id: 1,
    nombre: "Jose",
    rol: "Administrador" // 🔥 CLAVE
  }
  const [activeView, setActiveView] = useState('create-ticket')

  return (
    <div className="flex h-screen">
      <TicketSidebar user={user} setActiveView={setActiveView} />

      {/* Render dinámico */}
      {activeView === 'create-ticket' && <CreateTicketForm />}
      {activeView === 'admin' && user.rol === "Administrador" &&<AdminUsers />}
    </div>
  )
}

export default App
