// src/components/ProtectedRoute.jsx
// ✅ MEJORADO: Consolidado y con logging

import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ [ProtectedRoute] Sin token, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ [ProtectedRoute] Token válido, permitiendo acceso');
  return children;
};

export default ProtectedRoute;






