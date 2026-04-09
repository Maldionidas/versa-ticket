// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // ← Agrega esta importación

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>  {/* ← Envuelve App con AuthProvider */}
            <App />
        </AuthProvider>
    </React.StrictMode>
);