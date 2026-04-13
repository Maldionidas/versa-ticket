// src/pages/panelAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminUsers from '../components/adminUsers';
import AdminRoles from '../components/adminRoles';
import AdminAreas from '../components/adminAreas';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');

  // Pestañas
  const tabs = [
    { id: 'usuarios', label: '👥 Usuarios', component: AdminUsers },
    { id: 'roles', label: '🔐 Roles', component: AdminRoles },
    { id: 'areas', label: '🏢 Áreas', component: AdminAreas },
    { id: 'categorias', label: '📁 Categorías', component: () => (
      <div className="p-12 text-center text-gray-500">
        Componente de Categorías (próximamente)
      </div>
    )}
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Redirigir si no es admin
  useEffect(() => {
    if (user && user.rol_id !== 2) { // 2 = Admin
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user || user.rol_id !== 2) {
    return <div className="p-8 text-center">Acceso denegado. Solo administradores.</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-8">Bienvenido, <span className="font-semibold text-gray-800">{user.nombre}</span></p>

      {/* Pestañas */}
      <div className="flex gap-2 border-b mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all duration-200 whitespace-nowrap rounded-t-lg ${
              activeTab === tab.id
                ? 'border-b-2 border-amber-500 text-amber-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[70vh]">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default AdminPanel;