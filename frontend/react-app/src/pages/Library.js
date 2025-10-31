import React from 'react';
import './Library.css';

const Library = () => {
  const userPlaylists = [
    { id: 1, name: "Favoritos", songCount: 25, color: "#FF2D55" },
    { id: 2, name: "Viaje Carretera", songCount: 18, color: "#5856D6" },
    { id: 3, name: "Study Focus", songCount: 12, color: "#007AFF" }
  ];

  const recentlyPlayed = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", lastPlayed: "Hoy 14:30" },
    { id: 2, title: "Save Your Tears", artist: "The Weeknd", lastPlayed: "Ayer 20:15" },
    { id: 3, title: "Levitating", artist: "Dua Lipa", lastPlayed: "2 días atrás" }
  ];

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Tu Biblioteca</h1>
        <button className="create-playlist-btn">+ Crear playlist</button>
      </div>

      <div className="library-content">
        <section className="library-section">
          <h2>Tus Playlists</h2>
          <div className="playlists-grid">
            {userPlaylists.map(playlist => (
              <div key={playlist.id} className="playlist-card-library">
                <div 
                  className="playlist-cover"
                  style={{ backgroundColor: playlist.color }}
                >
                  <span className="playlist-icon">🎵</span>
                </div>
                <div className="playlist-info">
                  <h3>{playlist.name}</h3>
                  <p>{playlist.songCount} canciones</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="library-section">
          <h2>Recientemente escuchado</h2>
          <div className="recent-tracks">
            {recentlyPlayed.map(track => (
              <div key={track.id} className="recent-track">
                <div className="track-cover"></div>
                <div className="track-details">
                  <h4>{track.title}</h4>
                  <p>{track.artist}</p>
                </div>
                <span className="last-played">{track.lastPlayed}</span>
                <button className="play-btn">▶</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Library;