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

  const hideSidebarRoutes = ['/login'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  // Mientras está cargando la autenticación → mostrar solo loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Cargando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar solo si está logueado y no es login */}
      {user && !shouldHideSidebar && <TicketSidebar />}

      <div className={`flex-1 overflow-auto ${user && !shouldHideSidebar ? 'ml-64' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route 
            path="/inbox" 
            element={user ? <Inbox /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/create-ticket" 
            element={user ? <CreateTicket /> : <Navigate to="/login" replace />} 
          />

          {/* Rutas con permisos especiales */}
          <Route 
            path="/admin" 
            element={
              user && user.rol_id === 2 ? 
                <AdminPanel /> : 
                <Navigate to="/inbox" replace />
            } 
          />
          <Route 
            path="/assigned-tickets" 
            element={
              user && user.rol_id === 3 ? 
                <AssignedTickets /> : 
                <Navigate to="/dashboard" replace />
            } 
          />

          <Route path="/" element={<Navigate to="/inbox" replace />} />
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