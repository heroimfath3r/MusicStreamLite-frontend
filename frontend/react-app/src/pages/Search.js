import React, { useState, useMemo } from 'react';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Base de datos completa con relaciones
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

  // Función para búsqueda inteligente con relaciones cruzadas
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
      results.artists.push(artist);
      foundArtistIds.add(artist.id);
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
      // Agregar el artista del álbum si no está ya
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
      results.songs.push(song);

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

    // 4. Si encontramos artistas, agregar TODAS sus canciones y álbumes
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

    // 5. Si encontramos álbumes, agregar todas las canciones del álbum
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

  // Filtrar resultados según el tab activo
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') {
      return getSearchResults;
    }
    return {
      songs: activeTab === 'songs' ? getSearchResults.songs : [],
      artists: activeTab === 'artists' ? getSearchResults.artists : [],
      albums: activeTab === 'albums' ? getSearchResults.albums : []
    };
  }, [getSearchResults, activeTab]);

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
          <button className="search-btn-large">🔍</button>
        </div>
      </div>

      {searchQuery && (
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
              Canciones
            </button>
            <button 
              className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              Artistas
            </button>
            <button 
              className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
              onClick={() => setActiveTab('albums')}
            >
              Álbumes
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
                      <div className="song-cover"></div>
                      <div className="song-details">
                        <h4>{song.title}</h4>
                        <p>{song.artist} • {song.album}</p>
                      </div>
                    </div>
                    <span className="song-duration">{song.duration}</span>
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
                      <div className="artist-avatar"></div>
                      <div className="artist-info">
                        <h4>{artist.name}</h4>
                        <p>{artist.genre}</p>
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
                      <div className="album-cover"></div>
                      <div className="album-info">
                        <h4>{album.title}</h4>
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
            <div className="category-card" style={{background: '#FF2D55'}}>
              <h3>Pop</h3>
            </div>
            <div className="category-card" style={{background: '#5856D6'}}>
              <h3>Rock</h3>
            </div>
            <div className="category-card" style={{background: '#007AFF'}}>
              <h3>Hip Hop</h3>
            </div>
            <div className="category-card" style={{background: '#34C759'}}>
              <h3>Electrónica</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;