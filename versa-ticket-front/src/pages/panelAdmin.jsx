// src/pages/panelAdmin.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminUsers from '../components/adminUsers';
import AdminRoles from '../components/adminRoles';
import AdminAreas from '../components/adminAreas';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');

  // Pestañas disponibles
  const tabs = [
    { id: 'usuarios', label: '👥 Usuarios', component: AdminUsers },
    { id: 'roles', label: '🔐 Roles', component: AdminRoles },
    { id: 'areas', label: '🏢 Áreas', component: AdminAreas },
    { id: 'categorias', label: '📁 Categorías', component: () => <div className="p-4 text-center text-gray-500">Componente de Categorías (próximamente)</div> }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-6">Bienvenido, {user?.nombre}</p>

      {/* Pestañas */}
      <div className="flex gap-2 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-b-2 border-amber-500 text-amber-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido dinámico según la pestaña activa */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default AdminPanel;