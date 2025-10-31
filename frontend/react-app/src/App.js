import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.js';
import MusicPlayer from './components/MusicPlayer.js';
import Home from './pages/Home.js';
import Search from './pages/Search.js';
import Library from './pages/Library.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </main>
        <MusicPlayer />
      </div>
    </Router>
  );
}

export default App;