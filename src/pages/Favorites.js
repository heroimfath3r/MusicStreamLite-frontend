// frontend/react-app/src/pages/Favorites.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaThLarge, FaList, FaFilter, FaHeart } from 'react-icons/fa';
import SongCard from '../components/songCard.js';
import { usersAPI } from '../services/api.js';
import { usePlayer } from '../contexts/PlayerContext.jsx';
import './Favorites.css';

const Favorites = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
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
  // EFFECT: CARGAR FAVORITOS AL MONTAR
  // ============================================================
  useEffect(() => {
    loadFavorites();
  }, []);

  // ============================================================
  // EFFECT: FILTRAR POR BÚSQUEDA
  // ============================================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSongs(favoriteSongs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = favoriteSongs.filter(song =>
      song.title?.toLowerCase().includes(query) ||
      song.artist_name?.toLowerCase().includes(query) ||
      song.album_name?.toLowerCase().includes(query)
    );

    setFilteredSongs(filtered);
  }, [searchQuery, favoriteSongs]);

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
  }, [sortBy, favoriteSongs]);

  // ============================================================
  // CARGAR FAVORITOS
  // ============================================================
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersAPI.getFavorites();

      // Mapear la respuesta (puede ser un array directo o un objeto con favorites)
      const favArray = Array.isArray(response) ? response : response.favorites || [];

      if (!Array.isArray(favArray)) {
        console.warn('⚠️ Response no es array:', response);
        setFavoriteSongs([]);
        setFilteredSongs([]);
        return;
      }

      setFavoriteSongs(favArray);
      setFilteredSongs(favArray);
      console.log(`✅ Cargados ${favArray.length} favoritos`);
    } catch (err) {
      console.error('❌ Error cargando favoritos:', err);
      setError('Error al cargar los favoritos. Intenta nuevamente.');
      setFavoriteSongs([]);
      setFilteredSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // REPRODUCIR CANCIÓN
  // ============================================================
  const handlePlay = useCallback(async (song, index) => {
    try {
      console.log('🎵 Reproduciendo favorita:', song.title);

      setPlayQueue(filteredSongs, index);
      playSong(song);

      try {
        await usersAPI.recordPlay({
          song_id: song.song_id,
          duration_played: 0,
          completed: false
        });
      } catch (analyticsErr) {
        console.warn('⚠️ No se pudo registrar reproducción:', analyticsErr);
      }
    } catch (err) {
      console.error('❌ Error reproduciendo canción:', err);
    }
  }, [filteredSongs, playSong, setPlayQueue]);

  // ============================================================
  // REMOVER DE FAVORITOS
  // ============================================================
  const handleRemoveFavorite = useCallback(async (songId) => {
    try {
      await usersAPI.removeFavorite(songId);
      setFavoriteSongs(prev => 
        prev.filter(f => f.song_id !== songId && f.songId !== songId)
      );
      console.log('❤️ Eliminado de favoritos');
    } catch (err) {
      console.error('❌ Error al remover favorito:', err);
    }
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  const isFavorite = useCallback((songId) => {
    return true; // Todas son favoritas en esta página
  }, []);

  const isCurrentlyPlaying = useCallback((songId) => {
    return currentSong?.song_id === songId;
  }, [currentSong]);

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="favorites-container">
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error) {
    return (
      <div className="favorites-container">
        <div className="library-error">
          <p>❌ {error}</p>
          <button onClick={loadFavorites} className="retry-button">
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
    <div className="favorites-container">
      {/* HEADER */}
      <div className="favorites-header">
        <motion.div
          className="favorites-title-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FaHeart className="heart-icon" />
          <h1 className="favorites-title">Mis Favoritas</h1>
        </motion.div>
        <p className="favorites-count">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'canción favorita' : 'canciones favoritas'}
        </p>
      </div>

      {/* CONTROLES */}
      <div className="favorites-controls">
        {/* BÚSQUEDA */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar en favoritas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar favoritas"
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

      {/* GRID DE CANCIONES */}
      <motion.div
        className={`songs-grid ${viewMode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredSongs.length === 0 ? (
          <div className="no-results">
            <FaHeart size={48} />
            <p>
              {searchQuery ? '🔍 No se encontraron favoritas' : '❤️ Sin canciones favoritas'}
            </p>
            <p className="no-results-hint">
              {!searchQuery && 'Agrega canciones a favoritas desde la biblioteca'}
            </p>
          </div>
        ) : (
          filteredSongs.map((song, index) => (
            <SongCard
              key={song.song_id}
              song={song}
              onPlay={() => handlePlay(song, index)}
              onAddToFavorites={handleRemoveFavorite}
              isPlaying={isCurrentlyPlaying(song.song_id)}
              isFavorite={isFavorite(song.song_id)}
            />
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Favorites;