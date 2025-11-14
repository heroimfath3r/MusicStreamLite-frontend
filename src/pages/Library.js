// frontend/react-app/src/pages/Library.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaThLarge, FaList, FaFilter } from 'react-icons/fa';
import SongCard from '../components/songCard.js';
import { songsAPI, usersAPI } from '../services/api.js';
import { usePlayer } from '../contexts/PlayerContext.jsx';
import './Library.css';

const Library = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');

  // ============================================================
  // CONTEXTOS
  // ============================================================
  const { playSong, currentSong, setPlayQueue } = usePlayer();

  // ============================================================
  // EFFECT: CARGAR DATOS INICIALES
  // ============================================================
  useEffect(() => {
    const initializeLibrary = async () => {
      try {
        setLoading(true);
        await Promise.all([loadSongs(), loadFavorites()]);
      } catch (err) {
        console.error('Error inicializando library:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    initializeLibrary();
  }, []);

  // ============================================================
  // EFFECT: FILTRAR POR BÚSQUEDA
  // ============================================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSongs(songs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = songs.filter(song =>
      song.title?.toLowerCase().includes(query) ||
      song.artist_name?.toLowerCase().includes(query) ||
      song.album_name?.toLowerCase().includes(query)
    );

    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  // ============================================================
  // EFFECT: ORDENAR CANCIONES
  // ============================================================
  useEffect(() => {
    const sorted = [...filteredSongs].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'artist':
          return (a.artist_name || '').localeCompare(b.artist_name || '');
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });

    setFilteredSongs(sorted);
  }, [sortBy, songs]);

  // ============================================================
  // CARGAR CANCIONES
  // ============================================================
  const loadSongs = useCallback(async () => {
    try {
      setError(null);
      console.log('📚 Cargando canciones de la biblioteca...');
      
      const response = await songsAPI.getAll();
      
      console.log('📦 Respuesta del servidor:', response);

      // ✅ FIXED: Manejar correctamente la estructura de respuesta
      let songsArray = [];
      
      if (response.data) {
        // Si viene { data: [...] }
        songsArray = Array.isArray(response.data) ? response.data : [];
      } else if (response.rows) {
        // Si viene { rows: [...] }
        songsArray = Array.isArray(response.rows) ? response.rows : [];
      } else if (Array.isArray(response)) {
        // Si viene directamente un array
        songsArray = response;
      } else if (response.songs) {
        // Si viene { songs: [...] }
        songsArray = Array.isArray(response.songs) ? response.songs : [];
      }

      if (!Array.isArray(songsArray)) {
        console.warn('⚠️ No se pudo extraer array de canciones:', response);
        setSongs([]);
        setFilteredSongs([]);
        return;
      }

      setSongs(songsArray);
      setFilteredSongs(songsArray);
      console.log(`✅ Cargadas ${songsArray.length} canciones`);
    } catch (err) {
      console.error('❌ Error cargando canciones:', err);
      console.error('Detalles:', err.response?.data || err.message);
      setError('Error al cargar las canciones. Intenta nuevamente.');
      setSongs([]);
      setFilteredSongs([]);
    }
  }, []);

  // ============================================================
  // CARGAR FAVORITOS
  // ============================================================
  const loadFavorites = useCallback(async () => {
    try {
      const response = await usersAPI.getFavorites();
      
      console.log('❤️ Respuesta favoritos:', response);

      // ✅ FIXED: Manejar múltiples estructuras de respuesta
      let favArray = [];
      
      if (Array.isArray(response)) {
        favArray = response;
      } else if (response.favorites && Array.isArray(response.favorites)) {
        favArray = response.favorites;
      } else if (response.data && Array.isArray(response.data)) {
        favArray = response.data;
      }

      setFavorites(favArray);
      console.log(`✅ Cargados ${favArray.length} favoritos`);
    } catch (err) {
      console.error('⚠️ Error cargando favoritos:', err);
      setFavorites([]);
    }
  }, []);

  // ============================================================
  // REPRODUCIR CANCIÓN
  // ============================================================
  const handlePlay = useCallback(async (song, index) => {
    try {
      console.log('🎵 Reproduciendo:', song.title);

      // Establecer cola de reproducción
      setPlayQueue(filteredSongs, index);
      playSong(song);

      // Registrar en analytics
      try {
        await usersAPI.recordPlay({
          song_id: song.song_id,
          duration_played: 0,
          completed: false
        });
      } catch (analyticsErr) {
        console.warn('⚠️ No se pudo registrar reproducción:', analyticsErr);
        // No fallar si analytics no funciona
      }
    } catch (err) {
      console.error('❌ Error reproduciendo canción:', err);
    }
  }, [filteredSongs, playSong, setPlayQueue]);

  // ============================================================
  // AGREGAR/REMOVER DE FAVORITOS
  // ============================================================
  const handleAddToFavorites = useCallback(async (songId) => {
    try {
      const isFavorite = favorites.some(f => f.song_id === songId || f.songId === songId);

      if (isFavorite) {
        await usersAPI.removeFavorite(songId);
        setFavorites(prev => prev.filter(f => f.song_id !== songId && f.songId !== songId));
        console.log('❤️ Eliminado de favoritos');
      } else {
        await usersAPI.addFavorite(songId);
        await loadFavorites();
        console.log('❤️ Agregado a favoritos');
      }
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
    }
  }, [favorites, loadFavorites]);

  // ============================================================
  // HELPERS
  // ============================================================
  const isFavorite = useCallback((songId) => {
    return favorites.some(f => f.song_id === songId || f.songId === songId);
  }, [favorites]);

  const isCurrentlyPlaying = useCallback((songId) => {
    return currentSong?.song_id === songId;
  }, [currentSong]);

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="library-container">
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Cargando tu biblioteca...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error) {
    return (
      <div className="library-container">
        <div className="library-error">
          <p>❌ {error}</p>
          <button onClick={loadSongs} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: PRINCIPAL
  // ============================================================
  return (
    <div className="library-container">
      {/* ========== FONDO CON COLLAGE ========== */}
      <div className="library-background">
        <div className="collage-grid">
          {songs.slice(0, 12).map((song, index) => (
            <motion.div
              key={`collage-${song.song_id || index}`}
              className="collage-item"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 8,
                delay: index * 0.5,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              <img
                src={song.cover_image_url || 'https://storage.googleapis.com/music-stream-lite-bucket/collage%20jahseh.jpeg'}
                alt={song.title}
                onError={(e) => {
                  e.target.src = 'https://storage.googleapis.com/music-stream-lite-bucket/collage%20jahseh.jpeg';
                }}
              />
            </motion.div>
          ))}
        </div>
        <div className="collage-overlay"></div>
      </div>

      {/* ========== HEADER ========== */}
      <div className="library-header">
        <motion.h1
          className="library-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tu Biblioteca
        </motion.h1>
        <p className="library-count">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'canción' : 'canciones'}
        </p>
      </div>

      {/* ========== CONTROLES ========== */}
      <div className="library-controls">
        {/* BÚSQUEDA */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar canciones, artistas o álbumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar canciones"
          />
        </div>

        {/* VISTA */}
        <div className="view-controls">
          <button
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista en cuadrícula"
            aria-label="Vista cuadrícula"
          >
            <FaThLarge />
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vista en lista"
            aria-label="Vista lista"
          >
            <FaList />
          </button>
        </div>

        {/* ORDENAR */}
        <div className="sort-controls">
          <FaFilter className="filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Ordenar por"
          >
            <option value="title">Ordenar por título</option>
            <option value="artist">Ordenar por artista</option>
            <option value="duration">Ordenar por duración</option>
          </select>
        </div>
      </div>

      {/* ========== GRID DE CANCIONES ========== */}
      <motion.div
        className={`songs-grid ${viewMode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredSongs.length === 0 ? (
          <div className="no-results">
            <p>
              {searchQuery ? '🔍 No se encontraron canciones' : '🎵 Sin canciones'}
            </p>
          </div>
        ) : (
          filteredSongs.map((song, index) => (
            <SongCard
              key={song.song_id}
              song={song}
              onPlay={() => handlePlay(song, index)}
              onAddToFavorites={handleAddToFavorites}
              isPlaying={isCurrentlyPlaying(song.song_id)}
              isFavorite={isFavorite(song.song_id)}
            />
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Library;