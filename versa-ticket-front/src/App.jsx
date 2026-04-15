// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';

// Contexto y Seguridad
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Páginas y Componentes
import Login from './pages/Login';
import Inbox from './pages/Inbox';
import Dashboard from './pages/Dashboard';
import AssignedTickets from './pages/AssignedTickets';
import { TicketSidebar } from './components/sideBar';
import { CreateTicketForm } from './pages/createTicket'; // Ajusta según tu nombre de archivo
import AdminPanel from './pages/panelAdmin';

// ----------------------------------------------------------------------
// 1. LAYOUT PRINCIPAL (Estructura con Sidebar)
// ----------------------------------------------------------------------
const MainLayout = () => {
    const { user, loading } = useAuth();

    // Pantalla de carga profesional (Diseño del compañero)
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 mx-auto border-4 border-amber-500 border-t-transparent rounded-full"></div>
                    <p className="mt-4 text-gray-600 font-medium">Sincronizando VersaTicket...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar con acceso al usuario del contexto */}
            <TicketSidebar />
            
            {/* Contenedor dinámico con margen para el Sidebar fijo (ml-64) */}
            <div className="flex-1 overflow-auto ml-64 p-4">
                <Outlet context={{ user }} />
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. WRAPPER DE ADMINISTRACIÓN (Protección RBAC)
// ----------------------------------------------------------------------
const AdminRoute = () => {
    const { user } = useOutletContext();
    
    // Si no es Admin (Rol 2), lo mandamos al Inbox
    if (user?.rol_id !== 2) {
        return <Navigate to="/inbox" replace />;
    }
    
    return <AdminPanel />;
};

// ----------------------------------------------------------------------
// 3. COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* RUTA PÚBLICA */}
                    <Route path="/login" element={<Login />} />

                    {/* RUTAS PROTEGIDAS (Requieren Token) */}
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        
                        {/* Dashboard general */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Inbox: Para admin es global, para usuario es personal */}
                        <Route path="/inbox" element={<Inbox />} />
                        
                        {/* Creación de tickets */}
                        <Route path="/create-ticket" element={<CreateTicketForm />} />
                        
                        {/* Ruta para Agentes (Rol 3) */}
                        <Route path="/assigned-tickets" element={<AssignedTickets />} />

                        {/* Ruta para Administradores (Rol 2) con validación extra */}
                        <Route path="/admin" element={<AdminRoute />} />
                        
                        {/* Redirecciones de conveniencia */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>

                    {/* Manejo de 404 */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;