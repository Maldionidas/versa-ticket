// src/pages/panelAdmin.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// Importación de sub-componentes
import { AdminUsers } from "../components/adminUsers";
import { AdminAreas } from "../components/adminAreas";
import { AdminRoles } from "../components/adminRoles";
import { AdminCategorias } from "../components/adminCategorias";
import { AdminCampos } from "../components/adminCampos";

const AdminPanel = () => {
  const { user, loading } = useAuth();
  
  // Helper para normalizar permisos (Tu lógica Senior)
  const permisos = useMemo(() => {
    try {
      if (!user?.permisos) return {};
      return typeof user.permisos === "string" 
        ? JSON.parse(user.permisos) 
        : user.permisos;
    } catch { return {}; }
  }, [user]);

  // Definición de pestañas con lógica de acceso (Fusión de ambos)
  const allTabs = [
    { 
      id: 'users', 
      label: '👥 Usuarios', 
      component: AdminUsers, 
      visible: permisos?.users?.read || user?.rol_id === 2 
    },
    { 
      id: 'roles', 
      label: '🔐 Roles', 
      component: AdminRoles, 
      visible: permisos?.roles?.read || user?.rol_id === 2 
    },
    { 
      id: 'areas', 
      label: '🏢 Áreas', 
      component: AdminAreas, 
      visible: permisos?.areas?.read || user?.rol_id === 2 
    },
    { 
      id: 'categorias', 
      label: '📁 Categorías', 
      component: AdminCategorias, 
      visible: permisos?.categorias?.read || user?.rol_id === 2 
    },
    { 
      id: 'campos', 
      label: '🛠️ Campos', 
      component: AdminCampos, 
      visible: permisos?.campos?.read || user?.rol_id === 2 
    }
  ];

  // Filtramos solo las pestañas que el usuario puede ver
  const availableTabs = allTabs.filter(tab => tab.visible);
  
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Si no hay pestañas disponibles, significa que no tiene acceso a nada
  if (availableTabs.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl inline-block shadow-sm">
          <p className="font-bold text-lg">Acceso Denegado</p>
          <p className="text-sm">No tienes permisos para visualizar ningún módulo administrativo.</p>
        </div>
      </div>
    );
  }

  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Panel de Administración</h1>
        <p className="text-gray-500">
          Gestionando VersaTicket como <span className="font-bold text-amber-600">{user?.nombre}</span>
        </p>
      </div>

      {/* TABS (Diseño del compañero con tu lógica) */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-bold transition-all duration-300 whitespace-nowrap rounded-t-xl text-sm uppercase tracking-wider ${
              activeTab === tab.id
                ? 'border-b-4 border-amber-500 text-amber-600 bg-amber-50/50 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO (Diseño del compañero) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[60vh]">
        <div className="p-2">
           {ActiveComponent && <ActiveComponent user={user} permisos={permisos} />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;