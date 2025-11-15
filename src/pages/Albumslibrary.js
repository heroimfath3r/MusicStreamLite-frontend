// frontend/react-app/src/pages/AlbumsLibrary.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCompactDisc } from 'react-icons/fa';
import { albumsAPI } from '../services/api.js';
import './albumslibrary.css';

const AlbumsLibrary = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================================
  // EFFECT: CARGAR ÁLBUMES AL MONTAR
  // ============================================================
  useEffect(() => {
    loadAlbums();
  }, []);

  // ============================================================
  // EFFECT: FILTRAR POR BÚSQUEDA
  // ============================================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAlbums(albums);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = albums.filter(album =>
      album.title?.toLowerCase().includes(query) ||
      album.artist_name?.toLowerCase().includes(query)
    );

    setFilteredAlbums(filtered);
  }, [searchQuery, albums]);

  // ============================================================
  // CARGAR ÁLBUMES
  // ============================================================
  const loadAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await searchAPI.getAll();
      
      const albumsArray = response.data || [];

      if (!Array.isArray(albumsArray)) {
        console.warn('⚠️ Response no es array:', response);
        setAlbums([]);
        setFilteredAlbums([]);
        return;
      }

      setAlbums(albumsArray);
      setFilteredAlbums(albumsArray);
      console.log(`✅ Cargados ${albumsArray.length} álbumes`);
    } catch (err) {
      console.error('❌ Error cargando álbumes:', err);
      setError('Error al cargar los álbumes. Intenta nuevamente.');
      setAlbums([]);
      setFilteredAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  const formatYear = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="albums-library-container">
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Cargando álbumes...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error) {
    return (
      <div className="albums-library-container">
        <div className="library-error">
          <p>❌ {error}</p>
          <button onClick={loadAlbums} className="retry-button">
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
    <div className="albums-library-container">
      {/* HEADER */}
      <div className="albums-header">
        <motion.h1
          className="albums-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Álbumes
        </motion.h1>
        <p className="albums-count">
          {filteredAlbums.length} {filteredAlbums.length === 1 ? 'álbum' : 'álbumes'}
        </p>
      </div>

      {/* BÚSQUEDA */}
      <div className="albums-search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar álbumes o artistas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar álbumes"
        />
      </div>

      {/* GRID DE ÁLBUMES */}
      <motion.div
        className="albums-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredAlbums.length === 0 ? (
          <div className="no-results">
            <p>
              {searchQuery ? '🔍 No se encontraron álbumes' : '💿 Sin álbumes'}
            </p>
          </div>
        ) : (
          filteredAlbums.map((album) => (
            <motion.div
              key={album.id || album.album_id}
              className="album-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* PORTADA DEL ÁLBUM */}
              <div className="album-cover-container">
                <div className="album-cover">
                  {album.cover_image_url ? (
                    <img 
                      src={album.cover_image_url} 
                      alt={album.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaCompactDisc size={60} />
                  )}
                </div>
                <div className="album-cover-overlay"></div>
              </div>

              {/* INFORMACIÓN DEL ÁLBUM */}
              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                <p className="album-artist">{album.artist_name || 'Artista desconocido'}</p>
                
                <div className="album-meta">
                  <span className="album-year">
                    {formatYear(album.release_date)}
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

export default AlbumsLibrary;