// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TicketSidebar } from './components/sideBar';
import Login from './pages/Login';
import Inbox from './pages/Inbox';
import Dashboard from './pages/Dashboard';
import CreateTicket from './components/createTicket';
import AdminPanel from './pages/panelAdmin';
import AssignedTickets from './pages/AssignedTickets';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Rutas donde NO se muestra el sidebar
  const hideSidebarRoutes = ['/login'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex">
      {user && !shouldHideSidebar && <TicketSidebar />}
      <div className={`flex-1 ${user && !shouldHideSidebar ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas - SOLO para usuarios normales */}
          <Route path="/inbox" element={
            user ? <Inbox /> : <Navigate to="/login" />
          } />
          <Route path="/dashboard" element={
            user ? <Dashboard /> : <Navigate to="/login" />
          } />
          <Route path="/create-ticket" element={
            user ? <CreateTicket /> : <Navigate to="/login" />
          } />
          
          {/* Ruta de Admin - SOLO para rol_id === 2 */}
          <Route path="/admin" element={
            user && user.rol_id === 2 ? <AdminPanel /> : <Navigate to="/inbox" />
          } />
          <Route path="/assigned-tickets" element={
  user && user.rol_id === 3 ? <AssignedTickets /> : <Navigate to="/dashboard" />
} />
          <Route path="/" element={<Navigate to="/inbox" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;