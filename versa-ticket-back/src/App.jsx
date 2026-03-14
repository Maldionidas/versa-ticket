import { TicketSidebar } from './components/sideBar'
import { CreateTicketForm } from './components/createTicket'

function App() {
  return (
    <div className="flex h-screen">
      <TicketSidebar />
      <CreateTicketForm />
    </div>
  )
}

export default App
