import React, { useState, useMemo, useEffect } from 'react';
// import { searchAPI } from '../services/api.js'; // Eliminado o comentado si no se usa

import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  // Se han eliminado los estados searchResults, loading y error,
  // ya que la lógica se centraliza en getSearchResults (useMemo) y es sincrónica.
  // Si planeas usar la API de nuevo, deberías reintroducirlos.

  // Realizar búsqueda con debounce si se usa una API real
  // En este ejemplo con datos locales, usaremos solo useMemo.
  /*
  useEffect(() => {
    // ... Lógica de debounce con searchAPI.searchAll ...
  }, [searchQuery]);
  */

  // Base de datos completa con relaciones (simulación de datos)
  const database = {
    songs: [
      { id: 1, title: "Blinding Lights", artistId: 1, artist: "The Weeknd", albumId: 1, album: "After Hours", duration: "3:20" },
      { id: 2, title: "Save Your Tears", artistId: 1, artist: "The Weeknd", albumId: 1, album: "After Hours", duration: "3:35" },
      { id: 3, title: "In Your Eyes", artistId: 1, artist: "The Weeknd", albumId: 1, album: "After Hours", duration: "3:57" },
      { id: 4, title: "Levitating", artistId: 2, artist: "Dua Lipa", albumId: 2, album: "Future Nostalgia", duration: "3:23" },
      { id: 5, title: "Don't Start Now", artistId: 2, artist: "Dua Lipa", albumId: 2, album: "Future Nostalgia", duration: "3:03" },
      { id: 6, title: "Physical", artistId: 2, artist: "Dua Lipa", albumId: 2, album: "Future Nostalgia", duration: "3:13" },
      { id: 7, title: "Bohemian Rhapsody", artistId: 3, artist: "Queen", albumId: 3, album: "A Night at the Opera", duration: "5:55" },
      { id: 8, title: "We Will Rock You", artistId: 3, artist: "Queen", albumId: 4, album: "News of the World", duration: "2:02" },
    ],
    artists: [
      { id: 1, name: "The Weeknd", genre: "R&B" },
      { id: 2, name: "Dua Lipa", genre: "Pop" },
      { id: 3, name: "Queen", genre: "Rock" }
    ],
    albums: [
      { id: 1, title: "After Hours", artistId: 1, artist: "The Weeknd", year: 2020 },
      { id: 2, title: "Future Nostalgia", artistId: 2, artist: "Dua Lipa", year: 2020 },
      { id: 3, title: "A Night at the Opera", artistId: 3, artist: "Queen", year: 1975 },
      { id: 4, title: "News of the World", artistId: 3, artist: "Queen", year: 1977 }
    ]
  };

  // Función para búsqueda inteligente con relaciones cruzadas (Usando useMemo para optimización)
  const getSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return { songs: [], artists: [], albums: [] };

    const query = searchQuery.toLowerCase().trim();
    const results = { songs: [], artists: [], albums: [] };
    const foundArtistIds = new Set();
    const foundAlbumIds = new Set();

    // 1. Buscar artistas que coincidan
    const matchingArtists = database.artists.filter(artist =>
      artist.name.toLowerCase().includes(query) ||
      artist.genre.toLowerCase().includes(query)
    );

    matchingArtists.forEach(artist => {
      if (!results.artists.find(a => a.id === artist.id)) {
        results.artists.push(artist);
        foundArtistIds.add(artist.id);
      }
    });

    // 2. Buscar álbumes que coincidan
    const matchingAlbums = database.albums.filter(album =>
      album.title.toLowerCase().includes(query) ||
      album.artist.toLowerCase().includes(query)
    );

    matchingAlbums.forEach(album => {
      if (!results.albums.find(a => a.id === album.id)) {
        results.albums.push(album);
        foundAlbumIds.add(album.id);
      }
      // Agregar el artista del álbum si no está ya (lógica de relaciones cruzadas)
      if (!foundArtistIds.has(album.artistId)) {
        const artist = database.artists.find(a => a.id === album.artistId);
        if (artist && !results.artists.find(a => a.id === artist.id)) {
          results.artists.push(artist);
          foundArtistIds.add(artist.id);
        }
      }
    });

    // 3. Buscar canciones que coincidan
    const matchingSongs = database.songs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
    );

    matchingSongs.forEach(song => {
      if (!results.songs.find(s => s.id === song.id)) {
        results.songs.push(song);
      }

      // Agregar el artista de la canción si no está ya
      if (!foundArtistIds.has(song.artistId)) {
        const artist = database.artists.find(a => a.id === song.artistId);
        if (artist && !results.artists.find(a => a.id === artist.id)) {
          results.artists.push(artist);
          foundArtistIds.add(artist.id);
        }
      }

      // Agregar el álbum de la canción si no está ya
      if (!foundAlbumIds.has(song.albumId)) {
        const album = database.albums.find(a => a.id === song.albumId);
        if (album && !results.albums.find(a => a.id === album.id)) {
          results.albums.push(album);
          foundAlbumIds.add(album.id);
        }
      }
    });

    // 4. Si encontramos artistas, agregar TODAS sus canciones y álbumes (relación cruzada)
    // Nota: El código original ya tenía esta lógica y la mantendremos para una búsqueda "inteligente"
    foundArtistIds.forEach(artistId => {
      const artistSongs = database.songs.filter(song => song.artistId === artistId);
      artistSongs.forEach(song => {
        if (!results.songs.find(s => s.id === song.id)) {
          results.songs.push(song);
        }
      });

      const artistAlbums = database.albums.filter(album => album.artistId === artistId);
      artistAlbums.forEach(album => {
        if (!results.albums.find(a => a.id === album.id)) {
          results.albums.push(album);
          foundAlbumIds.add(album.id);
        }
      });
    });

    // 5. Si encontramos álbumes, agregar todas las canciones del álbum (relación cruzada)
    foundAlbumIds.forEach(albumId => {
      const albumSongs = database.songs.filter(song => song.albumId === albumId);
      albumSongs.forEach(song => {
        if (!results.songs.find(s => s.id === song.id)) {
          results.songs.push(song);
        }
      });
    });

    return results;
  }, [searchQuery]);

  // Filtrar resultados según el tab activo (Usando useMemo)
  const filteredResults = useMemo(() => {
    const results = getSearchResults;
    if (activeTab === 'all') {
      return results;
    }
    return {
      songs: activeTab === 'songs' ? results.songs : [],
      artists: activeTab === 'artists' ? results.artists : [],
      albums: activeTab === 'albums' ? results.albums : []
    };
  }, [getSearchResults, activeTab]);

  // Se asume que no hay "loading" ni "error" para la demostración con datos locales
  const loading = false;
  const error = null;

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
              Canciones ({getSearchResults.songs?.length || 0})
            </button>
            <button
              className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              Artistas ({getSearchResults.artists?.length || 0})
            </button>
            <button
              className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
              onClick={() => setActiveTab('albums')}
            >
              Álbumes ({getSearchResults.albums?.length || 0})
            </button>
          </div>

          <div className="results-content">
            {/* Sección de Canciones (Corregido: Usar filteredResults) */}
            {(activeTab === 'all' || activeTab === 'songs') && filteredResults.songs.length > 0 && (
              <div className="results-section">
                <h3>Canciones {filteredResults.songs.length > 0 && `(${filteredResults.songs.length})`}</h3>
                {filteredResults.songs.map(song => (
                  <div key={song.id} className="result-item">
                    <div className="song-info">
                      <div className="song-cover"></div>
                      <div className="song-details">
                        <h4>{song.title}</h4>
                        {/* Corregido: Usar 'artist' y 'album' que vienen del objeto song de la base de datos */}
                        <p>{song.artist} • {song.album}</p>
                      </div>
                    </div>
                    <span className="song-duration">{song.duration || 'N/A'}</span>
                    <button className="play-btn-small">▶</button>
                  </div>
                ))}
              </div>
            )}

            {/* Sección de Artistas (Corregido: Usar filteredResults) */}
            {(activeTab === 'all' || activeTab === 'artists') && filteredResults.artists.length > 0 && (
              <div className="results-section">
                <h3>Artistas {filteredResults.artists.length > 0 && `(${filteredResults.artists.length})`}</h3>
                <div className="artists-grid">
                  {filteredResults.artists.map(artist => (
                    <div key={artist.id} className="artist-card">
                      <div className="artist-avatar"></div>
                      <div className="artist-info">
                        <h4>{artist.name}</h4>
                        {/* Corregido: Usar 'genre' que viene del objeto artist de la base de datos */}
                        <p>{artist.genre}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Álbumes (Corregido: Eliminada la sección duplicada y uso de filteredResults) */}
            {(activeTab === 'all' || activeTab === 'albums') && filteredResults.albums.length > 0 && (
              <div className="results-section">
                <h3>Álbumes {filteredResults.albums.length > 0 && `(${filteredResults.albums.length})`}</h3>
                <div className="albums-grid">
                  {filteredResults.albums.map(album => (
                    <div key={album.id} className="album-card">
                      <div className="album-cover"></div>
                      <div className="album-info">
                        <h4>{album.title}</h4>
                        {/* Corregido: Usar 'artist' y 'year' que vienen del objeto album de la base de datos */}
                        <p>{album.artist} • {album.year}</p>
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
                  <h3>No se encontraron resultados para "{searchQuery}"</h3>
                  <p>Intenta con otras palabras clave</p>
                </div>
              )}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="search-suggestions">
          <h2>Explorar por categoría</h2>
          <div className="categories-grid">
            <div className="category-card" style={{ background: '#FF2D55' }}>
              <h3>Pop</h3>
            </div>
            <div className="category-card" style={{ background: '#5856D6' }}>
              <h3>Rock</h3>
            </div>
            <div className="category-card" style={{ background: '#007AFF' }}>
              <h3>Hip Hop</h3>
            </div>
            <div className="category-card" style={{ background: '#34C759' }}>
              <h3>Electrónica</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;