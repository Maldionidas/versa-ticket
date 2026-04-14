import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';

// Contexto y Seguridad 
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Páginas y Componentes (views)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { TicketSidebar } from './components/sideBar';
import { CreateTicketForm } from './pages/createTicket';
import { AdminPanel } from './pages/panelAdmin';

const MainLayout = () => {
    // Extraemos el usuario real que el Login guardó en la memoria global (Context)
    const { user } = useAuth(); 

    return (
        <div className="flex h-screen overflow-hidden">
            {/* 1. El Sidebar se queda estático a la izquierda */}
            <TicketSidebar user={user} />
            
            <div className="flex-1 overflow-auto bg-background">
                {/* 2. El Outlet es el "Hueco Dinámico" */}
                <Outlet context={{ user }} />
            </div>
        </div>
    );
};
const AdminPanelWrapper = () => {
    // Recuperamos el usuario que el Outlet nos pasó en el paso anterior
    const { user } = useOutletContext();
    
    // Validamos: Si no eres Administrador...
    if (user?.rol !== "Administrador" && user?.rol_id !== 1) {
        // ...te pateo de regreso a la pantalla de crear ticket
        return <Navigate to="/crear-ticket" />;
    }
    
    // Si pasaste la validación, te muestro el componente real
    return <AdminPanel user={user} />;
};
function App() {
    return (
        <Router>
            {/* AuthProvider envuelve todo para que cualquier pantalla sepa si estás logueado */}
            <AuthProvider>
                <Routes>
                    {/* 1. RUTA PÚBLICA */}
                    <Route path="/login" element={<Login />} />

                    {/* 2. RUTAS PROTEGIDAS */}
                    {/* Si intentas entrar aquí, PrivateRoute revisa que tengas Token. Si tienes, pinta el MainLayout */}
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        
                        {/* Estas son las pantallas que se inyectan dentro del <Outlet /> del MainLayout */}
                        <Route path="/crear-ticket" element={<CreateTicketForm />} />
                        <Route path="/admin" element={<AdminPanelWrapper />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Redirección por defecto */}
                        <Route path="/" element={<Navigate to="/crear-ticket" />} />
                    </Route>

                    {/* 3. MANEJO DE ERRORES */}
                    {/* Si escriben una ruta que no existe (ej. /asdfg), los mandamos al inicio */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;