import { useState } from 'react'
import { TicketSidebar } from './components/sideBar'
import { CreateTicketForm } from './components/createTicket'
import { AdminUsers } from './components/adminUsers'

function App() {
  const [activeView, setActiveView] = useState('create-ticket')

  return (
    <div className="flex h-screen">
      <TicketSidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Render dinámico */}
      {activeView === 'create-ticket' && <CreateTicketForm />}
      {activeView === 'admin' && <AdminUsers />}
    </div>
  )
}

export default App