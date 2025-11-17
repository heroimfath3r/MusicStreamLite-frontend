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
  const [selectedGenre, setSelectedGenre] = useState(null);

  // ============================================================
  // GÉNEROS DISPONIBLES
  // ============================================================
  const genres = [
    { id: 1, name: 'Hip Hop', color: '#007AFF' },
    { id: 2, name: 'Rap', color: '#FF2D55' },
    { id: 3, name: 'R&B', color: '#5856D6' },
    { id: 4, name: 'Pop', color: '#34C759' }
  ];

  // ============================================================
  // BÚSQUEDA POR TEXTO O GÉNERO
  // ============================================================
  useEffect(() => {
    // Si no hay query ni género seleccionado, limpiar resultados
    if (!searchQuery.trim() && !selectedGenre) {
      setSearchResults({ songs: [], artists: [], albums: [] });
      setError(null);
      return;
    }

    // Implementar debounce para evitar muchas llamadas a la API
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        let response;

        // Si hay género seleccionado, buscar por género
        if (selectedGenre) {
          console.log(`🎵 Buscando canciones del género: ${selectedGenre.name}`);
          response = await searchAPI.searchByGenre(selectedGenre.id);
        } 
        // Si hay query, buscar por texto
        else if (searchQuery.trim()) {
          console.log(`🔍 Buscando: ${searchQuery}`);
          response = await searchAPI.searchAll(searchQuery);
        }

        if (response.success) {
          // Mapear los datos de la API a la estructura esperada por el componente
          const mappedResults = {
            songs: response.results.songs?.map(song => ({
              id: song.id || song.song_id,
              title: song.title,
              artist: song.artist_name || 'Desconocido',
              album: song.album_title || 'Desconocido',
              duration: song.duration || 'N/A',
              audioFileUrl: song.audio_file_url
            })) || [],
            artists: response.results.artists?.map(artist => ({
              id: artist.id,
              name: artist.name,
              bio: artist.bio || '',
              imageUrl: artist.image_url
            })) || [],
            albums: response.results.albums?.map(album => ({
              id: album.id,
              title: album.title,
              artist: album.artist_name || 'Desconocido',
              releaseDate: album.release_date,
              coverImageUrl: album.cover_image_url
            })) || []
          };

          setSearchResults(mappedResults);
          console.log(`✅ Resultados encontrados:`, mappedResults);
        } else {
          setError('Error al realizar la búsqueda');
        }
      } catch (err) {
        console.error('❌ Error en búsqueda:', err);
        setError('Error al conectar con el servidor. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce de 500ms

    // Cleanup: cancelar el timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedGenre]);

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

  // ============================================================
  // MANEJAR CLIC EN GÉNERO
  // ============================================================
  const handleGenreClick = (genre) => {
    console.log(`📌 Género seleccionado: ${genre.name}`);
    setSelectedGenre(genre);
    setSearchQuery(''); // Limpiar búsqueda de texto
    setActiveTab('songs'); // Cambiar a tab de canciones
  };

  // ============================================================
  // LIMPIAR BÚSQUEDA POR GÉNERO
  // ============================================================
  const handleClearGenre = () => {
    console.log('❌ Limpiando filtro de género');
    setSelectedGenre(null);
    setSearchResults({ songs: [], artists: [], albums: [] });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Buscar</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Artistas, canciones o álbumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-large"
            disabled={selectedGenre ? true : false}
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
          RESULTADOS POR BÚSQUEDA O GÉNERO
          ============================================================ */}
      {(searchQuery || selectedGenre) && !loading && (
        <div className="search-results">
          {/* Mostrar género seleccionado */}
          {selectedGenre && (
            <div className="genre-badge" style={{
              padding: '15px',
              margin: '20px 0',
              backgroundColor: selectedGenre.color,
              color: 'white',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                🎵 Canciones de {selectedGenre.name}
              </span>
              <button 
                onClick={handleClearGenre}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕ Limpiar
              </button>
            </div>
          )}

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
            {!selectedGenre && (
              <>
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
              </>
            )}
          </div>

          <div className="results-content">
            {/* Sección de Canciones */}
            {(activeTab === 'all' || activeTab === 'songs') && filteredResults.songs.length > 0 && (
              <div className="results-section">
                <h3>Canciones {filteredResults.songs.length > 0 && `(${filteredResults.songs.length})`}</h3>
                {filteredResults.songs.map(song => (
                  <div key={song.id} className="result-item">
                    <div className="song-info">
                      <div className="song-cover"></div>
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
            {(searchQuery || selectedGenre) &&
              filteredResults.songs.length === 0 &&
              filteredResults.artists.length === 0 &&
              filteredResults.albums.length === 0 && (
                <div className="no-results">
                  <h3>No se encontraron resultados</h3>
                  <p>Intenta con otras palabras clave o género</p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ============================================================
          SUGERENCIAS POR GÉNERO (SIN BÚSQUEDA)
          ============================================================ */}
      {!searchQuery && !selectedGenre && (
        <div className="search-suggestions">
          <h2>Explorar por género</h2>
          <div className="categories-grid">
            {genres.map(genre => (
              <div 
                key={genre.id}
                className="category-card" 
                style={{ background: genre.color, cursor: 'pointer' }}
                onClick={() => handleGenreClick(genre)}
              >
                <h3>{genre.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;