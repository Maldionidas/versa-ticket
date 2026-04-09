// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Ticket, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  User,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    totalUsers: 0
  });
  const [dashboardData, setDashboardData] = useState({
    ticketsPorDia: [],
    prioridadesStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }
      
      const statsResponse = await fetch('http://localhost:3000/api/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.status === 401) {
        setError('Sesión expirada, por favor inicia sesión nuevamente');
        setLoading(false);
        return;
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats({
            totalTickets: statsData.data?.totalTickets || 0,
            pendingTickets: statsData.data?.pendingTickets || 0,
            inProgressTickets: statsData.data?.inProgressTickets || 0,
            completedTickets: statsData.data?.completedTickets || 0,
            totalUsers: statsData.data?.totalUsers || 0
          });
        }
      }
      
      const dashboardResponse = await fetch('http://localhost:3000/api/stats/dashboard', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        if (dashboardResult.success) {
          setDashboardData({
            ticketsPorDia: Array.isArray(dashboardResult.data?.ticketsPorDia) ? dashboardResult.data.ticketsPorDia : [],
            prioridadesStats: Array.isArray(dashboardResult.data?.prioridadesStats) ? dashboardResult.data.prioridadesStats : []
          });
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadColor = (nombre) => {
    switch (nombre?.toLowerCase()) {
      case 'crítica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getPrioridadTextColor = (nombre) => {
    switch (nombre?.toLowerCase()) {
      case 'crítica': return 'text-red-600';
      case 'alta': return 'text-orange-600';
      case 'media': return 'text-yellow-600';
      case 'baja': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const totalActivos = stats.pendingTickets + stats.inProgressTickets;
  const tasaCompletados = stats.totalTickets > 0 
    ? Math.round((stats.completedTickets / stats.totalTickets) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-amber-500" />
                Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {user?.rol_id === 2 && (
                  <>
                    <p className="text-gray-600 text-sm">Visión completa del sistema</p>
                  </>
                )}
                {user?.rol_id === 3 && (
                  <>
                    <p className="text-gray-600 text-sm">Tickets asignados a ti</p>
                  </>
                )}
                {user?.rol_id === 1 && (
                  <>
                    <p className="text-gray-600 text-sm">Tus tickets y solicitudes</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title={user?.rol_id === 3 ? "Tickets Asignados" : "Total Tickets"} 
            value={stats.totalTickets} 
            icon={Ticket}
            color="bg-blue-500"
          />
          <StatCard 
            title={user?.rol_id === 3 ? "Por Atender" : "Pendientes"} 
            value={stats.pendingTickets} 
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard 
            title="En Proceso" 
            value={stats.inProgressTickets} 
            icon={AlertCircle}
            color="bg-orange-500"
          />
          <StatCard 
            title={user?.rol_id === 3 ? "Resueltos" : "Completados"} 
            value={stats.completedTickets} 
            icon={CheckCircle2}
            color="bg-green-500"
          />
        </div>

        {/* Usuarios - Solo Admin */}
        {user?.rol_id === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Usuarios Registrados</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard 
            title="Tasa de Resolución"
            value={tasaCompletados}
            icon={CheckCircle2}
            color="from-green-500 to-green-600"
            unit="%"
            description="Tickets resueltos exitosamente"
          />
          <MetricCard 
            title="Tickets Activos"
            value={totalActivos}
            icon={TrendingUp}
            color="from-amber-500 to-orange-500"
            unit=""
            description="Pendientes + En proceso"
          />
          <MetricCard 
            title="Eficiencia"
            value={stats.totalTickets > 0 ? Math.min(100, Math.round((stats.completedTickets / stats.totalTickets) * 100)) : 0}
            icon={Star}
            color="from-blue-500 to-blue-600"
            unit="%"
            description="Rendimiento general"
          />
        </div>

        {/* Prioridades - Solo Admin */}
        {user?.rol_id === 2 && dashboardData?.prioridadesStats && dashboardData.prioridadesStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Distribución por Prioridad</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.prioridadesStats.map((prioridad, index) => {
                  const porcentaje = stats.totalTickets > 0 
                    ? (prioridad.total / stats.totalTickets) * 100 
                    : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={getPrioridadTextColor(prioridad.nombre)}>
                          {prioridad.nombre}
                        </span>
                        <span className="font-semibold">{prioridad.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getPrioridadColor(prioridad.nombre)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tickets por Día - Solo Admin */}
        {user?.rol_id === 2 && dashboardData?.ticketsPorDia && dashboardData.ticketsPorDia.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Tickets por Día (Últimos 7 días)</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-4 h-64">
                {dashboardData.ticketsPorDia.slice().reverse().map((dia, index) => {
                  const maxValue = Math.max(...dashboardData.ticketsPorDia.map(d => d.total), 1);
                  const height = (dia.total / maxValue) * 200;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-2">{dia.total}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}px`, minHeight: '4px', maxHeight: '200px' }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                        {dia.fecha ? new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Botón de acción para Agente */}
        {user?.rol_id === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tickets Asignados</h3>
            <p className="text-gray-500">
              Tienes {stats.pendingTickets + stats.inProgressTickets} tickets activos asignados
            </p>
            <button 
              onClick={() => window.location.href = '/assigned-tickets'}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Ver mis tickets asignados
            </button>
          </div>
        )}

        {/* Botón de acción para Usuario */}
        {user?.rol_id === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 text-center">
            <Ticket className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tus Tickets</h3>
            <p className="text-gray-500">
              Has creado {stats.totalTickets} tickets en total
            </p>
            <button 
              onClick={() => window.location.href = '/inbox'}
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Ver mi bandeja de entrada
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, color, unit, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-600 font-medium">{title}</h3>
      <div className={`bg-gradient-to-r ${color} p-2 rounded-lg`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </div>
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-3xl font-bold text-gray-800">{value}</span>
      <span className="text-gray-500">{unit}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
      <div 
        className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%` }}
      ></div>
    </div>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

export default Dashboard;