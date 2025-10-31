import React, { useState } from 'react';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const searchResults = {
    songs: [
      { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
      { id: 2, title: "Save Your Tears", artist: "The Weeknd", duration: "3:35" }
    ],
    artists: [
      { id: 1, name: "The Weeknd", genre: "R&B" },
      { id: 2, name: "Dua Lipa", genre: "Pop" }
    ],
    albums: [
      { id: 1, title: "After Hours", artist: "The Weeknd", year: 2020 },
      { id: 2, title: "Future Nostalgia", artist: "Dua Lipa", year: 2020 }
    ]
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
            {(activeTab === 'all' || activeTab === 'songs') && (
              <div className="results-section">
                <h3>Canciones</h3>
                {searchResults.songs.map(song => (
                  <div key={song.id} className="result-item">
                    <div className="song-info">
                      <div className="song-cover"></div>
                      <div className="song-details">
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                    </div>
                    <span className="song-duration">{song.duration}</span>
                    <button className="play-btn-small">▶</button>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'artists') && (
              <div className="results-section">
                <h3>Artistas</h3>
                <div className="artists-grid">
                  {searchResults.artists.map(artist => (
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