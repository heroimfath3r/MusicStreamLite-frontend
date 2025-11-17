// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { songsAPI, analyticsAPI } from '../services/api.js';
import { FaPlay, FaMusic, FaClock, FaFire, FaStar } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentSongs, setRecentSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [userId, setUserId] = useState(null);

  // ============================================================
  // OBTENER userId
  // ============================================================
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.user_id);
      }
    } catch (err) {
      console.error('Error obteniendo userId:', err);
    }
  }, []);

  // ============================================================
  // CARGAR DATOS AL MONTARSE
  // ============================================================
  useEffect(() => {
    if (userId) {
      loadHomeData();
    }
  }, [userId]);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Cargar canciones recientes
      console.log('📜 Cargando reproducciones recientes...');
      const historyResponse = await analyticsAPI.getUserHistory(userId);
      let historyArray = [];
      if (historyResponse.history && Array.isArray(historyResponse.history)) {
        historyArray = historyResponse.history;
      } else if (Array.isArray(historyResponse)) {
        historyArray = historyResponse;
      }

      // Cargar todas las canciones
      console.log('🎵 Cargando todas las canciones...');
      const songsResponse = await songsAPI.getAll();
      let songsArray = [];
      if (songsResponse.data && Array.isArray(songsResponse.data)) {
        songsArray = songsResponse.data;
      } else if (Array.isArray(songsResponse)) {
        songsArray = songsResponse;
      }

      setAllSongs(songsArray);

      // Enriquecer historial con info de canciones
      const enrichedHistory = historyArray
        .slice(0, 5)
        .map(playEvent => {
          const song = songsArray.find(s => 
            s.song_id === playEvent.songId || 
            String(s.song_id) === String(playEvent.songId)
          );
          return {
            ...playEvent,
            title: song?.title || `Canción ${playEvent.songId}`,
            artist: song?.artist_name || 'Artista desconocido',
            cover_image_url: song?.cover_image_url
          };
        });

      setRecentSongs(enrichedHistory);
      console.log('✅ Datos cargados:', enrichedHistory);
    } catch (err) {
      console.error('❌ Error cargando datos home:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GÉNEROS DESTACADOS - COLORES SERIOS
  // ============================================================
  const genres = [
    { id: 1, name: 'Hip Hop', icon: '🎤', color: '#1B3A5E', accentColor: '#007AFF', songs: 4 },
    { id: 2, name: 'Rap', icon: '🔥', color: '#3A1B1B', accentColor: '#FF2D55', songs: 2 },
    { id: 3, name: 'R&B', icon: '💝', color: '#1B2D3A', accentColor: '#5856D6', songs: 2 },
    { id: 4, name: 'Pop', icon: '✨', color: '#2D3A1B', accentColor: '#34C759', songs: 1 }
  ];

  // ============================================================
  // ANIMACIONES FRAMER
  // ============================================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    whileHover: { scale: 1.02 }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>🎵 Cargando tu música...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          HEADER CON BIENVENIDA - TIPOGRAFÍA 2K ROCKERA
          ============================================================ */}
      <motion.div className="home-header" variants={sectionVariants}>
        <div className="header-content">
          <h1 className="header-title-2k">🎵 Hola, bienvenido</h1>
          <p className="header-subtitle-2k">Tu música, tu ritmo, tu momento</p>
        </div>
      </motion.div>

      {/* ============================================================
          SECCIÓN: REPRODUCIDAS RECIENTEMENTE
          ============================================================ */}
      {recentSongs.length > 0 && (
        <motion.section className="recent-songs-section" variants={sectionVariants}>
          <div className="section-header">
            <h2>
              <FaClock className="section-icon" /> Reproducidas recientemente
            </h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/history')}
            >
              Ver todo →
            </button>
          </div>
          <div className="recent-songs-grid">
            {recentSongs.map((song, index) => (
              <motion.div
                key={`${song.id}-${index}`}
                className="recent-song-card"
                variants={cardVariants}
                whileHover={{ y: -4 }}
              >
                <div className="song-card-image">
                  <img
                    src={song.cover_image_url || 'https://storage.googleapis.com/music-stream-lite-bucket/collage%20jahseh.jpeg'}
                    alt={song.title}
                    onError={(e) => {
                      e.target.src = 'https://storage.googleapis.com/music-stream-lite-bucket/collage%20jahseh.jpeg';
                    }}
                    className="card-image"
                  />
                  <div className="play-overlay">
                    <FaPlay className="play-icon" />
                  </div>
                </div>
                <div className="song-card-info">
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ============================================================
          SECCIÓN: GÉNEROS DESTACADOS
          ============================================================ */}
      <motion.section className="genres-section" variants={sectionVariants}>
        <div className="section-header">
          <h2>
            <FaFire className="section-icon" /> Géneros trending
          </h2>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/search')}
          >
            Explorar →
          </button>
        </div>
        <div className="genres-grid">
          {genres.map((genre, index) => (
            <motion.div
              key={genre.id}
              className="genre-card"
              variants={cardVariants}
              style={{ 
                background: `linear-gradient(135deg, ${genre.color}dd, ${genre.color})`,
                borderColor: genre.accentColor
              }}
              onClick={() => navigate(`/search?genre=${genre.id}`)}
            >
              <div 
                className="genre-badge"
                style={{ 
                  background: `linear-gradient(135deg, ${genre.accentColor}, ${genre.accentColor}dd)`,
                  animation: `float${index + 1} 3s ease-in-out infinite`
                }}
              >
                {genre.icon}
              </div>
              <div className="genre-info">
                <h3>{genre.name}</h3>
                <p>{genre.songs} canciones</p>
              </div>
              <div className="genre-arrow">→</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============================================================
          SECCIÓN: DESCUBRE NUEVAS CANCIONES
          ============================================================ */}
      {allSongs.length > 0 && (
        <motion.section className="discover-section" variants={sectionVariants}>
          <div className="section-header">
            <h2>
              <FaStar className="section-icon" /> Descubre nuevas canciones
            </h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/songs')}
            >
              Ver todas →
            </button>
          </div>
          <div className="discover-grid">
            {allSongs.slice(0, 6).map((song) => (
              <motion.div
                key={song.song_id}
                className="discover-card"
                variants={cardVariants}
                whileHover={{ y: -6 }}
              >
                <div className="discover-card-image">
                  <img
                    src={song.cover_image_url || 'https://storage.googleapis.com/music-stream-lite-bucket/collage%20jahseh.jpeg'}
                    alt={song.title}
                    onError={(e) => {
                      e.target.src = 'https://storage.googleapis.com/music-stream-lite-bucket/collage%20jahseh.jpeg';
                    }}
                    className="discover-card-image-img"
                  />
                  <div className="discover-play-overlay">
                    <FaPlay className="play-icon-discover" />
                  </div>
                </div>
                <div className="discover-card-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist_name || 'Artista'}</p>
                  <div className="song-meta">
                    <span className="duration">⏱️ {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ============================================================
          SECCIÓN: ESTADÍSTICAS (OPTIONAL)
          ============================================================ */}
      <motion.section className="stats-section" variants={sectionVariants}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{recentSongs.length}</div>
            <p>Canciones recientes</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{allSongs.length}</div>
            <p>Canciones totales</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">{genres.length}</div>
            <p>Géneros disponibles</p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;