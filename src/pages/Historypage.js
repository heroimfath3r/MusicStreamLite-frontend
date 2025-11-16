// src/pages/HistoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaMusic, FaClock } from 'react-icons/fa';
import { analyticsAPI, songsAPI } from '../services/api.js';
import './Historypage.css';

const HistoryPage = () => {
  const navigate = useNavigate();

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

      console.log(`✅ Cargadas ${historyArray.length} reproduciones (sin normalizar)`);

      // ✅ NORMALIZAR TIMESTAMPS Y songId
      historyArray = historyArray.map(item => {
        let timestamp = item.timestamp;

        // Convertir Firestore Timestamp a ISO string
        if (timestamp && typeof timestamp.toDate === 'function') {
          console.log('🔄 Normalizando Firestore Timestamp');
          timestamp = timestamp.toDate().toISOString();
        } else if (timestamp instanceof Object && timestamp.seconds) {
          // Otra forma de Timestamp serializado (ej: {seconds: 1234567890, nanoseconds: 0})
          console.log('🔄 Normalizando timestamp serializado');
          timestamp = new Date(timestamp.seconds * 1000).toISOString();
        } else if (timestamp instanceof Date) {
          timestamp = timestamp.toISOString();
        }

        // Normalizar songId: si es string numérico, convertir a number
        const songId = (typeof item.songId === 'string' && /^\d+$/.test(item.songId)) 
          ? Number(item.songId) 
          : item.songId;

        return {
          ...item,
          timestamp,
          songId
        };
      });

      console.log(`✅ Historial normalizado: ${historyArray.length} reproduciones`);
      setHistory(historyArray);

      // Obtener todas las canciones
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
  // ENRIQUECER HISTORIAL CON NOMBRE DE CANCIÓN
  // ============================================
  const getEnrichedHistory = useCallback(() => {
    return history.map(playEvent => {
      // ✅ BUSCAR POR MÚLTIPLES VARIANTES (song_id, id, songId)
      const song = allSongs.find(s => 
        s.song_id === playEvent.songId || 
        s.id === playEvent.songId || 
        s.songId === playEvent.songId ||
        String(s.song_id) === String(playEvent.songId)
      );

      console.log(`🔍 Buscando songId: ${playEvent.songId} → Encontrado:`, song?.title || 'No encontrado');

      return {
        ...playEvent,
        title: song?.title || `Canción ${playEvent.songId}`,
        artist: song?.artist_name || song?.artist || 'Artista desconocido'
      };
    });
  }, [history, allSongs]);

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
      console.error('Error formateando fecha:', err);
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

      {/* LISTA */}
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

                {/* NOMBRE CANCIÓN */}
                <div className="history-info">
                  <h4 className="history-song-title">{playEvent.title}</h4>
                </div>

                {/* FECHA */}
                <div className="history-date">
                  <FaClock size={14} />
                  <span>{formatDate(playEvent.timestamp)}</span>
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