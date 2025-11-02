import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.js';
import MusicPlayer from './components/MusicPlayer.js';
import Home from './pages/Home.js';
import Search from './pages/Search.js';
import Library from './pages/Library.js';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
        <MusicPlayer />
      </div>
    </Router>
  );
}

export default App;