// src/App.js
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProvider } from './contexts/PlayerContext.jsx';

// ============================================
// 🔥 LAZY LOADING - Code Splitting
// ============================================
const Signup = lazy(() => import('./pages/Signup.js'));
const Home = lazy(() => import('./pages/Home.js'));
const Search = lazy(() => import('./pages/Search.js'));
const Library = lazy(() => import('./pages/Library.js'));
const Login = lazy(() => import('./pages/Login.js'));
const Profile = lazy(() => import('./pages/Profile.js'));
const Settings = lazy(() => import('./pages/Settings.js'));

// Layouts NO son lazy
import PublicLayout from './components/PublicLayout.jsx';
import PrivateLayout from './components/PrivateLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingFallback from './components/LoadingFallback.jsx';

import './App.css';

// ============================================
// 🔐 PROTECTED ROUTE - Proteger rutas privadas
// ============================================
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('⚠️ Sin token, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ============================================
// 🎬 ANIMACIONES DE PÁGINA
// ============================================
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

// ============================================
// 🛣️ ANIMATED ROUTES COMPONENT
// ============================================
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        className="main-content"
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
        key={location.pathname}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location} key={location.pathname}>
            {/* ============================================
                📱 RUTAS PÚBLICAS (sin Header, Sidebar, Player)
                ============================================ */}
            <Route
              path="/signup"
              element={
                <PublicLayout>
                  <Signup />
                </PublicLayout>
              }
            />
            
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />

            {/* ============================================
                🔐 RUTAS PRIVADAS (con Header, Sidebar, Player)
                ============================================ */}
            <Route
              element={
                <ProtectedRoute>
                  <PrivateLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* ============================================
                🔄 RUTAS POR DEFECTO
                ============================================ */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

// ============================================
// 🚀 APP PRINCIPAL
// ============================================
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detectar cambios en conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexión restaurada');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('❌ Sin conexión');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Si no hay conexión, mostrar mensaje
  if (!isOnline) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0e27',
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1>⚠️ Sin conexión a internet</h1>
        <p>Por favor verifica tu conexión y recarga la página</p>
      </div>
    );
  }

  return (
    <PlayerProvider>
      <Router>
        <div className="app-container">
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </div>
      </Router>
    </PlayerProvider>
  );
}

export default App;