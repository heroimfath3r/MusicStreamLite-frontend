// frontend/react-app/src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProvider } from './contexts/PlayerContext.jsx';


// ============================================
// 🔥 LAZY LOADING - Code Splitting Implementado
// ============================================
// Cada página se carga SOLO cuando se necesita
// Esto hace que la carga inicial sea 5-10x más rápida
// Si una página falla, las demás siguen funcionando

const Signup = lazy(() => import('./pages/Signup.js'));
const Home = lazy(() => import('./pages/Home.js'));
const Search = lazy(() => import('./pages/Search.js'));
const Library = lazy(() => import('./pages/Library.js'));
const Login = lazy(() => import('./pages/Login.js'));
const Profile = lazy(() => import('./pages/Profile.js'));
const Settings = lazy(() => import('./pages/Settings.js'));

// Layouts NO son lazy porque siempre se necesitan
import PublicLayout from './components/PublicLayout.jsx';
import PrivateLayout from './components/PrivateLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingFallback from './components/LoadingFallback.jsx';

import './App.css';

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
        {/* 
          🔥 Suspense espera a que se cargue la página lazy
          Mientras tanto, muestra LoadingFallback
        */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location} key={location.pathname}>
            {/* Rutas públicas (sin Header ni MusicPlayer) */}
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

            {/* Rutas privadas (con Header, Sidebar y MusicPlayer) */}
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="app-container">
          {/* 
            🔥 ErrorBoundary captura errores de páginas que fallan
            Si Home.js falla, Login.js seguirá funcionando
          */}
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </div>
      </Router>
    </PlayerProvider>
  );
}

export default App;