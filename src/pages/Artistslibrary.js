// frontend/react-app/src/pages/ArtistsLibrary.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUser } from 'react-icons/fa';
import { artistsAPI } from '../services/api.js';
import './artistslibrary.css';

const ArtistsLibrary = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================================
  // EFFECT: CARGAR ARTISTAS AL MONTAR
  // ============================================================
  useEffect(() => {
    loadArtists();
  }, []);

  // ============================================================
  // EFFECT: FILTRAR POR BÚSQUEDA
  // ============================================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArtists(artists);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = artists.filter(artist =>
      artist.name?.toLowerCase().includes(query)
    );

    setFilteredArtists(filtered);
  }, [searchQuery, artists]);

  // ============================================================
  // CARGAR ARTISTAS
  // ============================================================
  const loadArtists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await artistsAPI.getAll();
      
      // Si no hay query, obtener todos
      // Alternativa: llamar directamente a artistsAPI si existe
      const artistsArray = response.data || [];

      if (!Array.isArray(artistsArray)) {
        console.warn('⚠️ Response no es array:', response);
        setArtists([]);
        setFilteredArtists([]);
        return;
      }

      setArtists(artistsArray);
      setFilteredArtists(artistsArray);
      console.log(`✅ Cargados ${artistsArray.length} artistas`);
    } catch (err) {
      console.error('❌ Error cargando artistas:', err);
      setError('Error al cargar los artistas. Intenta nuevamente.');
      setArtists([]);
      setFilteredArtists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="artists-library-container">
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Cargando artistas...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error) {
    return (
      <div className="artists-library-container">
        <div className="library-error">
          <p>❌ {error}</p>
          <button onClick={loadArtists} className="retry-button">
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
    <div className="artists-library-container">
      {/* HEADER */}
      <div className="artists-header">
        <motion.h1
          className="artists-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Artistas
        </motion.h1>
        <p className="artists-count">
          {filteredArtists.length} {filteredArtists.length === 1 ? 'artista' : 'artistas'}
        </p>
      </div>

      {/* BÚSQUEDA */}
      <div className="artists-search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar artistas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar artistas"
        />
      </div>

      {/* GRID DE ARTISTAS */}
      <motion.div
        className="artists-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredArtists.length === 0 ? (
          <div className="no-results">
            <p>
              {searchQuery ? '🔍 No se encontraron artistas' : '🎤 Sin artistas'}
            </p>
          </div>
        ) : (
          filteredArtists.map((artist) => (
            <motion.div
              key={artist.id || artist.artist_id}
              className="artist-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="artist-image-container">
                <div className="artist-avatar">
                  {artist.image_url ? (
                    <img 
                      src={artist.image_url} 
                      alt={artist.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaUser size={40} />
                  )}
                </div>
              </div>

              <div className="artist-info">
                <h3 className="artist-name">{artist.name}</h3>
                <p className="artist-bio">
                  {artist.bio || 'Artista'}
                </p>
                <div className="artist-stats">
                  <span className="stat">
                    {artist.song_count || 0} canciones
                  </span>
                  <span className="stat-separator">•</span>
                  <span className="stat">
                    {artist.album_count || 0} álbumes
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default ArtistsLibrary;