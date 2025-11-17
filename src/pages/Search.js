// frontend/react-app/src/pages/Search.js
import React, { useState, useMemo, useEffect } from 'react';
import { searchAPI } from '../services/api.js';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchResults, setSearchResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // BÚSQUEDA POR TEXTO
  // ============================================================
  useEffect(() => {
    // Si no hay query, limpiar resultados
    if (!searchQuery.trim()) {
      setSearchResults({ songs: [], artists: [], albums: [] });
      setError(null);
      return;
    }

    // Implementar debounce para evitar muchas llamadas a la API
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🔍 Buscando: ${searchQuery}`);
        const response = await searchAPI.searchAll(searchQuery);

        console.log('📦 Respuesta del API:', response);

        // ✅ FIXED: Manejar múltiples estructuras de respuesta
        let songsArray = [];
        let artistsArray = [];
        let albumsArray = [];

        // Intentar extraer canciones
        if (response.results && response.results.songs) {
          songsArray = response.results.songs || [];
        } else if (response.songs && Array.isArray(response.songs)) {
          songsArray = response.songs;
        } else if (Array.isArray(response)) {
          songsArray = response;
        }

        // Intentar extraer artistas
        if (response.results && response.results.artists) {
          artistsArray = response.results.artists || [];
        } else if (response.artists && Array.isArray(response.artists)) {
          artistsArray = response.artists;
        }

        // Intentar extraer álbumes
        if (response.results && response.results.albums) {
          albumsArray = response.results.albums || [];
        } else if (response.albums && Array.isArray(response.albums)) {
          albumsArray = response.albums;
        }

        // Mapear los datos de la API a la estructura esperada por el componente
        const mappedResults = {
          songs: songsArray.map(song => ({
            id: song.song_id || song.id,
            title: song.title || 'Sin título',
            artist: song.artist_name || song.artist || 'Desconocido',
            album: song.album_name || song.album_title || 'Desconocido',
            duration: song.duration || 'N/A',
            audioFileUrl: song.audio_file_url,
            coverImageUrl: song.cover_image_url
          })),
          artists: artistsArray.map(artist => ({
            id: artist.artist_id || artist.id,
            name: artist.name || artist.artist_name || 'Desconocido',
            bio: artist.bio || '',
            imageUrl: artist.image_url
          })),
          albums: albumsArray.map(album => ({
            id: album.album_id || album.id,
            title: album.title || 'Sin título',
            artist: album.artist_name || album.artist || 'Desconocido',
            releaseDate: album.release_date,
            coverImageUrl: album.cover_image_url
          }))
        };

        setSearchResults(mappedResults);
        console.log(`✅ Resultados encontrados:`, mappedResults);
      } catch (err) {
        console.error('❌ Error en búsqueda:', err);
        setError('Error al conectar con el servidor. Por favor, intenta de nuevo.');
        setSearchResults({ songs: [], artists: [], albums: [] });
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce de 500ms

    // Cleanup: cancelar el timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ============================================================
  // FILTRAR RESULTADOS SEGÚN TAB ACTIVO
  // ============================================================
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') {
      return searchResults;
    }
    return {
      songs: activeTab === 'songs' ? searchResults.songs : [],
      artists: activeTab === 'artists' ? searchResults.artists : [],
      albums: activeTab === 'albums' ? searchResults.albums : []
    };
  }, [searchResults, activeTab]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Buscar</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Busca por canción, artista o álbum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-large"
          />
          <button className="search-btn-large">
            {loading ? '⏳' : '🔍'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{
          padding: '20px',
          margin: '20px 0',
          backgroundColor: '#ff4444',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* ============================================================
          RESULTADOS DE BÚSQUEDA
          ============================================================ */}
      {searchQuery && !loading && (
        <div className="search-results">
          <div className="results-tabs">
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Todo
            </button>
            <button
              className={`tab ${activeTab === 'songs' ? 'active' : ''}`}
              onClick={() => setActiveTab('songs')}
            >
              Canciones ({searchResults.songs?.length || 0})
            </button>
            <button
              className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              Artistas ({searchResults.artists?.length || 0})
            </button>
            <button
              className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
              onClick={() => setActiveTab('albums')}
            >
              Álbumes ({searchResults.albums?.length || 0})
            </button>
          </div>

          <div className="results-content">
            {/* Sección de Canciones */}
            {(activeTab === 'all' || activeTab === 'songs') && filteredResults.songs.length > 0 && (
              <div className="results-section">
                <h3>Canciones {filteredResults.songs.length > 0 && `(${filteredResults.songs.length})`}</h3>
                {filteredResults.songs.map(song => (
                  <div key={song.id} className="result-item">
                    <div className="song-info">
                      <div 
                        className="song-cover"
                        style={song.coverImageUrl ? {backgroundImage: `url(${song.coverImageUrl})`} : {}}
                      ></div>
                      <div className="song-details">
                        <h4>{song.title}</h4>
                        <p>{song.artist} • {song.album}</p>
                      </div>
                    </div>
                    <span className="song-duration">{song.duration || 'N/A'}</span>
                    <button className="play-btn-small">▶</button>
                  </div>
                ))}
              </div>
            )}

            {/* Sección de Artistas */}
            {(activeTab === 'all' || activeTab === 'artists') && filteredResults.artists.length > 0 && (
              <div className="results-section">
                <h3>Artistas {filteredResults.artists.length > 0 && `(${filteredResults.artists.length})`}</h3>
                <div className="artists-grid">
                  {filteredResults.artists.map(artist => (
                    <div key={artist.id} className="artist-card">
                      <div className="artist-avatar" style={artist.imageUrl ? {backgroundImage: `url(${artist.imageUrl})`} : {}}></div>
                      <div className="artist-info">
                        <h4>{artist.name}</h4>
                        <p>{artist.bio || 'Artista'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Álbumes */}
            {(activeTab === 'all' || activeTab === 'albums') && filteredResults.albums.length > 0 && (
              <div className="results-section">
                <h3>Álbumes {filteredResults.albums.length > 0 && `(${filteredResults.albums.length})`}</h3>
                <div className="albums-grid">
                  {filteredResults.albums.map(album => (
                    <div key={album.id} className="album-card">
                      <div className="album-cover" style={album.coverImageUrl ? {backgroundImage: `url(${album.coverImageUrl})`} : {}}></div>
                      <div className="album-info">
                        <h4>{album.title}</h4>
                        <p>{album.artist} • {album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {searchQuery &&
              filteredResults.songs.length === 0 &&
              filteredResults.artists.length === 0 &&
              filteredResults.albums.length === 0 && (
                <div className="no-results">
                  <h3>No se encontraron resultados</h3>
                  <p>Intenta con otras palabras clave</p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ============================================================
          SUGERENCIAS INICIALES (SIN BÚSQUEDA)
          ============================================================ */}
      {!searchQuery && (
        <div className="search-suggestions">
          <h2>¿Qué estás buscando?</h2>
          <p className="search-hint">Busca canciones, artistas o álbumes</p>
        </div>
      )}
    </div>
  );
};

export default Search;