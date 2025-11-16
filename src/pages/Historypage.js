// src/pages/HistoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPlay, FaMusic, FaClock } from 'react-icons/fa';
import { analyticsAPI, songsAPI } from '../services/api.js';
import { usePlayer } from '../contexts/PlayerContext.jsx';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { playSong, setPlayQueue } = usePlayer();

  const [history, setHistory] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // ============================================
  // OBTENER userId DEL LOCALSTORAGE
  // ============================================
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

  // ============================================
  // CARGAR HISTORIAL Y CANCIONES
  // ============================================
  useEffect(() => {
    if (userId) {
      loadHistoryAndSongs();
    }
  }, [userId]);

  const loadHistoryAndSongs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener historial
      console.log('📜 Cargando historial para usuario:', userId);
      const historyResponse = await analyticsAPI.getUserHistory(userId);

      let historyArray = [];
      if (historyResponse.history && Array.isArray(historyResponse.history)) {
        historyArray = historyResponse.history;
      } else if (Array.isArray(historyResponse)) {
        historyArray = historyResponse;
      }

      console.log(`✅ Cargadas ${historyArray.length} reproduciones`);
      setHistory(historyArray);

      // Obtener todas las canciones para enriquecer datos
      console.log('🎵 Cargando canciones...');
      const songsResponse = await songsAPI.getAll();

      let songsArray = [];
      if (songsResponse.data && Array.isArray(songsResponse.data)) {
        songsArray = songsResponse.data;
      } else if (Array.isArray(songsResponse)) {
        songsArray = songsResponse;
      }

      console.log(`✅ Cargadas ${songsArray.length} canciones`);
      setAllSongs(songsArray);
    } catch (err) {
      console.error('❌ Error cargando historial:', err);
      setError('Error al cargar el historial de reproducción');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ============================================
  // ENRIQUECER HISTORIAL CON DATOS DE CANCIONES
  // ============================================
  const getEnrichedHistory = useCallback(() => {
    return history.map(playEvent => {
      const fullSong = allSongs.find(s => s.song_id === playEvent.songId);
      return {
        ...playEvent,
        title: fullSong?.title || 'Canción desconocida',
        artist_name: fullSong?.artist_name || 'Artista desconocido',
        cover_image_url: fullSong?.cover_image_url,
      };
    });
  }, [history, allSongs]);

  // ============================================
  // REPRODUCIR CANCIÓN
  // ============================================
  const handlePlaySong = useCallback((song, index) => {
    try {
      console.log('🎵 Reproduciendo desde historial:', song.title);
      
      const enrichedHistory = getEnrichedHistory();
      setPlayQueue(enrichedHistory, index);
      playSong(enrichedHistory[index]);
    } catch (err) {
      console.error('❌ Error reproduciendo:', err);
    }
  }, [getEnrichedHistory, playSong, setPlayQueue]);

  // ============================================
  // FORMATEAR FECHA
  // ============================================
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="history-page-container">
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Cargando historial...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR
  // ============================================
  if (error) {
    return (
      <div className="history-page-container">
        <div className="history-error">
          <p>❌ {error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const enrichedHistory = getEnrichedHistory();

  // ============================================
  // RENDER: PRINCIPAL
  // ============================================
  return (
    <div className="history-page-container">
      {/* HEADER */}
      <div className="history-header">
        <motion.button
          className="back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft />
        </motion.button>

        <div className="history-title-section">
          <motion.h1
            className="history-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            📜 Historial de Reproducción
          </motion.h1>
          <p className="history-subtitle">
            {enrichedHistory.length} {enrichedHistory.length === 1 ? 'canción' : 'canciones'}
          </p>
        </div>
      </div>

      {/* LISTA DE REPRODUCCIÓN */}
      <motion.div
        className="history-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {enrichedHistory.length === 0 ? (
          <div className="no-history">
            <FaMusic size={48} />
            <p>Aún no hay historial de reproducción</p>
            <p className="subtitle">Las canciones que reproduzcas aparecerán aquí</p>
          </div>
        ) : (
          <div className="history-list">
            {enrichedHistory.map((playEvent, index) => (
              <motion.div
                key={`${playEvent.id}-${index}`}
                className="history-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* NÚMERO */}
                <span className="history-number">{index + 1}</span>

                {/* COVER */}
                <div className="history-cover">
                  <img
                    src={playEvent.cover_image_url || 'https://via.placeholder.com/50x50/1a1f3a/007AFF?text=No+Cover'}
                    alt={playEvent.title}
                  />
                </div>

                {/* INFO */}
                <div className="history-info">
                  <h4 className="history-song-title">{playEvent.title}</h4>
                  <p className="history-song-artist">{playEvent.artist_name}</p>
                </div>

                {/* FECHA */}
                <div className="history-date">
                  <FaClock size={14} />
                  <span>{formatDate(playEvent.timestamp)}</span>
                </div>

                {/* ACCIONES */}
                <div className="history-actions">
                  <motion.button
                    className="history-play-btn"
                    onClick={() => handlePlaySong(playEvent, index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Reproducir"
                  >
                    <FaPlay />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;