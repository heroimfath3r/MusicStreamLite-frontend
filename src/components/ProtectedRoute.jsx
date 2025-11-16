// src/components/ProtectedRoute.jsx
// ✅ MEJORADO: Verifica token Y redirige logueados desde login

import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  // ❌ SIN TOKEN: Redirigir a login
  if (!token) {
    console.warn('⚠️ [ProtectedRoute] Sin token, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  // ✅ CON TOKEN pero en /login: Redirigir a home
  if (token && location.pathname === '/login') {
    console.log('✅ [ProtectedRoute] Usuario ya logueado, redirigiendo a home');
    return <Navigate to="/home" replace />;
  }
  
  // ✅ CON TOKEN: Permitir acceso a rutas privadas
  console.log('✅ [ProtectedRoute] Token válido, permitiendo acceso');
  return children;
};

export default ProtectedRoute;