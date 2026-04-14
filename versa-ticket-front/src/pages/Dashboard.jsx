import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Bienvenido, {user?.nombre}!</p>
            <p>Email: {user?.email}</p>
            <button 
                onClick={logout}
                style={{
                    padding: '10px 20px',
                    background: '#c33',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default Dashboard;