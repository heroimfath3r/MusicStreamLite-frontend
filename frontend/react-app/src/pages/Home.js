import React, { useState, useEffect } from 'react';
import { catalogAPI } from '../services/api.js';
import './Home.css';

const Home = () => {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const songsResponse = await catalogAPI.getSongs({ limit: 10 });
      
      console.log('📡 Respuesta del backend:', songsResponse);
      
      // La respuesta de axios es: response.data = {success, data: [...]}
      const songs = songsResponse.data?.data || [];
      setRecentSongs(songs);
      
      console.log('✅ Canciones cargadas:', songs.length);
      
      // Mock featured playlists
      setFeaturedPlaylists([
        {
          id: 1,
          title: "Today's Hits",
          description: "The biggest hits right now",
          image: "https://via.placeholder.com/200x200/FF2D55/FFFFFF?text=Hits",
          color: "#FF2D55"
        },
        {
          id: 2,
          title: "Chill Vibes",
          description: "Relax and unwind",
          image: "https://via.placeholder.com/200x200/5856D6/FFFFFF?text=Chill",
          color: "#5856D6"
        },
        {
          id: 3,
          title: "Rock Classics",
          description: "Timeless rock anthems",
          image: "https://via.placeholder.com/200x200/007AFF/FFFFFF?text=Rock",
          color: "#007AFF"
        }
      ]);
      
    } catch (error) {
      console.error('❌ Error fetching home data:', error);
      setRecentSongs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando música...</p>
      </div>
    );
  }

  return (
    <div className="apple-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Bienvenido a MusicStream</h1>
          <p className="hero-subtitle">Millones de canciones. Tus artistas favoritos. Todo en un solo lugar.</p>
          <div className="hero-buttons">
            <button className="btn-primary">Comenzar ahora</button>
            <button className="btn-secondary">Ver planes</button>
          </div>
        </div>
      </section>

      {/* Featured Playlists */}
      <section className="section">
        <h2 className="section-title">Playlists destacadas</h2>
        <div className="playlists-grid">
          {featuredPlaylists.map(playlist => (
            <div key={playlist.id} className="playlist-card fade-in">
              <div 
                className="playlist-image"
                style={{ backgroundColor: playlist.color }}
              >
                <img src={playlist.image} alt={playlist.title} />
                <button className="play-overlay">▶</button>
              </div>
              <div className="playlist-info">
                <h3 className="playlist-title">{playlist.title}</h3>
                <p className="playlist-description">{playlist.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      <section className="section">
        <h2 className="section-title">Recién agregadas</h2>
        <div className="tracks-list">
          {recentSongs && recentSongs.length > 0 ? (
            recentSongs.map((track, index) => (
              <div key={track.id} className="track-item fade-in">
                <div className="track-info">
                  <span className="track-number">{index + 1}</span>
                  <div className="track-details">
                    <h4 className="track-title">{track.title}</h4>
                    <p className="track-artist">{track.artist_name}</p>
                  </div>
                </div>
                <div className="track-plays">{track.plays} plays</div>
                <button className="play-btn">▶</button>
              </div>
            ))
          ) : (
            <p style={{ color: '#A1A1A6', textAlign: 'center', padding: '20px' }}>
              No hay canciones disponibles
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;