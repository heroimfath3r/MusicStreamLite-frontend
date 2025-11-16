// frontend/react-app/src/pages/PlaylistDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPlay, FaTrash, FaMusic, FaPlus } from 'react-icons/fa';
import { playlistsAPI, songsAPI, usersAPI } from '../services/api.js';
import { usePlayer } from '../contexts/PlayerContext.jsx';
import SongCard from '../components/songCard.js';
import './PlaylistDetail.css';

const PlaylistDetail = () => {
  // ============================================================
  // PARAMS Y NAVIGATION
  // ============================================================
  const { playlistId } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [addingSong, setAddingSong] = useState(false);

  // ============================================================
  // CONTEXTOS
  // ============================================================
  const { playSong, setPlayQueue } = usePlayer();

  // ============================================================
  // EFFECT: CARGAR DATOS AL MONTAR
  // ============================================================
  useEffect(() => {
    loadPlaylistDetails();
  }, [playlistId]);

  // ============================================================
  // CARGAR DETALLES DE LA PLAYLIST
  // ============================================================
  const loadPlaylistDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Cargando playlist:', playlistId);

      let playlistResponse;

      // ✅ CASO ESPECIAL PARA FAVORITOS
      if (playlistId === 'favorites') {
        const favResponse = await usersAPI.getFavorites();
        
        setPlaylist({
          id: 'favorites',
          name: 'Canciones Favoritas',
          description: 'Tus canciones favoritas'
        });

        // ✅ CORREGIDO: Extraer canciones de favoritos (es "favorites", no "songs")
        let songsArray = [];
        if (favResponse.favorites && Array.isArray(favResponse.favorites)) {
          songsArray = favResponse.favorites;
        } else if (Array.isArray(favResponse)) {
          songsArray = favResponse;
        }

        setSongs(songsArray);
        console.log(`✅ Cargadas ${songsArray.length} canciones favoritas`);
      } else {
        // Caso normal: Cargar canciones de una playlist regular
        playlistResponse = await playlistsAPI.getSongs(playlistId);
        
        console.log('📦 Respuesta playlist:', playlistResponse);

        // Extraer datos de la playlist
        setPlaylist({
          id: playlistResponse.playlist.id,
          name: playlistResponse.playlist.name,
          description: playlistResponse.playlist.description
        });

        // Extraer canciones
        let songsArray = [];
        if (Array.isArray(playlistResponse.songs)) {
          songsArray = playlistResponse.songs;
        } else if (Array.isArray(playlistResponse)) {
          songsArray = playlistResponse;
        }

        setSongs(songsArray);
        console.log(`✅ Cargadas ${songsArray.length} canciones de la playlist`);
      }

      // Cargar todas las canciones disponibles
      await loadAllSongs();
    } catch (err) {
      console.error('❌ Error cargando playlist:', err);
      setError('Error al cargar la playlist');
      setPlaylist(null);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, 
  [playlistId]);

  // ============================================================
  // CARGAR TODAS LAS CANCIONES DISPONIBLES
  // ============================================================
  const loadAllSongs = useCallback(async () => {
    try {
      const response = await songsAPI.getAll();
      
      let songsArray = [];
      if (response.data && Array.isArray(response.data)) {
        songsArray = response.data;
      } else if (Array.isArray(response)) {
        songsArray = response;
      }

      setAllSongs(songsArray);
      console.log(`✅ Cargadas ${songsArray.length} canciones disponibles`);
    } catch (err) {
      console.error('⚠️ Error cargando canciones disponibles:', err);
    }
  }, []);

  // ============================================================
  // AGREGAR CANCIÓN A PLAYLIST O FAVORITOS
  // ============================================================
  const handleAddSong = useCallback(async () => {
    if (!selectedSongId) {
      alert('Por favor selecciona una canción');
      return;
    }

    try {
      setAddingSong(true);
      console.log('➕ Agregando canción:', selectedSongId);

      // ✅ SI ES FAVORITOS, USA usersAPI
      if (playlistId === 'favorites') {
        await usersAPI.addFavorite(selectedSongId);
      } else {
        // SINO, USA playlistsAPI
        await playlistsAPI.addSong(playlistId, selectedSongId);
      }

      console.log('✅ Canción agregada');

      // Recargar canciones
      await loadPlaylistDetails();

      // Limpiar modal
      setSelectedSongId(null);
      setShowAddSongModal(false);

      alert('Canción agregada exitosamente');
    } catch (err) {
      console.error('❌ Error agregando canción:', err);
      alert('Error al agregar la canción. Puede que ya esté agregada.');
    } finally {
      setAddingSong(false);
    }
  }, [selectedSongId, playlistId, loadPlaylistDetails]);

  // ============================================================
  // REMOVER CANCIÓN DE PLAYLIST O FAVORITOS
  // ============================================================
  const handleRemoveSong = useCallback(async (songId) => {
    if (!window.confirm('¿Estás seguro de que quieres remover esta canción?')) {
      return;
    }

    try {
      console.log('➖ Removiendo canción:', songId);
      
      // ✅ SI ES FAVORITOS, USA usersAPI
      if (playlistId === 'favorites') {
        await usersAPI.removeFavorite(songId);
      } else {
        // SINO, USA playlistsAPI
        await playlistsAPI.removeSong(playlistId, songId);
      }

      setSongs(prev => prev.filter(s => s.songId !== songId));

      console.log('✅ Canción removida');
      alert('Canción removida exitosamente');
    } catch (err) {
      console.error('❌ Error removiendo canción:', err);
      alert('Error al remover la canción');
    }
  }, [playlistId]);

  // ============================================================
  // REPRODUCIR CANCIÓN
  // ============================================================
  const handlePlaySong = useCallback(async (song, index) => {
    try {
      console.log('🎵 Reproduciendo:', song.title);

      setPlayQueue(songs, index);
      playSong(song);
    } catch (err) {
      console.error('❌ Error reproduciendo canción:', err);
    }
  }, [songs, playSong, setPlayQueue]);

  // ============================================================
  // REPRODUCIR TODO
  // ============================================================
  const handlePlayAll = useCallback(() => {
    if (songs.length === 0) {
      alert('No hay canciones en la playlist');
      return;
    }

    setPlayQueue(songs, 0);
    playSong(songs[0]);
    console.log('▶️ Reproduciendo toda la playlist');
  }, [songs, playSong, setPlayQueue]);

  // ============================================================
  // OBTENER CANCIONES NO AGREGADAS
  // ============================================================
  const getAvailableSongs = useCallback(() => {
    const playlistSongIds = new Set(songs.map(s => s.songId));
    return allSongs.filter(song => !playlistSongIds.has(song.song_id));
  }, [songs, allSongs]);

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="playlist-detail-container">
        <div className="playlist-loading">
          <div className="spinner"></div>
          <p>Cargando playlist...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error) {
    return (
      <div className="playlist-detail-container">
        <div className="playlist-error">
          <p>❌ {error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: PRINCIPAL
  // ============================================================
  if (!playlist) {
    return (
      <div className="playlist-detail-container">
        <div className="playlist-error">
          <p>❌ Playlist no encontrada</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const availableSongs = getAvailableSongs();

  return (
    <div className="playlist-detail-container">
      {/* HEADER */}
      <div className="playlist-header">
        <motion.button
          className="back-btn"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft />
        </motion.button>

        <div className="playlist-title-section">
          <motion.h1
            className="playlist-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {playlist.name}
          </motion.h1>
          {playlist.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}
          <p className="playlist-count">
            {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
          </p>
        </div>

        <div className="playlist-actions">
          {songs.length > 0 && (
            <motion.button
              className="play-all-btn"
              onClick={handlePlayAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlay /> Reproducir todo
            </motion.button>
          )}

          <motion.button
            className="add-song-btn"
            onClick={() => setShowAddSongModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Agregar canción
          </motion.button>
        </div>
      </div>

      {/* LISTA DE CANCIONES */}
      <motion.div
        className="playlist-songs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {songs.length === 0 ? (
          <div className="no-songs">
            <FaMusic size={48} />
            <p>La playlist está vacía</p>
            <button 
              onClick={() => setShowAddSongModal(true)}
              className="add-first-song-btn"
            >
              Agregar primera canción
            </button>
          </div>
        ) : (
          <div className="songs-list">
            {songs.map((playlistSong, index) => {
              // Buscar los datos completos de la canción
              const fullSong = allSongs.find(s => s.song_id === playlistSong.songId);
              
              if (!fullSong) return null;

              return (
                <motion.div
                  key={playlistSong.id}
                  className="playlist-song-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* NÚMERO */}
                  <span className="song-number">{index + 1}</span>

                  {/* INFORMACIÓN */}
                  <div className="song-info" onClick={() => handlePlaySong(fullSong, index)}>
                    <h4 className="song-title">{fullSong.title}</h4>
                    <p className="song-artist">{fullSong.artist_name}</p>
                  </div>

                  {/* ACCIONES */}
                  <div className="song-actions">
                    <motion.button
                      className="play-btn"
                      onClick={() => handlePlaySong(fullSong, index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Reproducir"
                    >
                      <FaPlay />
                    </motion.button>

                    <motion.button
                      className="remove-btn"
                      onClick={() => handleRemoveSong(playlistSong.songId)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Remover de playlist"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* MODAL: AGREGAR CANCIÓN */}
      {showAddSongModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAddSongModal(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Agregar canción a la playlist</h2>

            <div className="form-group">
              <label>Selecciona una canción</label>
              <select
                value={selectedSongId || ''}
                onChange={(e) => setSelectedSongId(parseInt(e.target.value))}
              >
                <option value="">-- Elige una canción --</option>
                {availableSongs.length > 0 ? (
                  availableSongs.map(song => (
                    <option key={song.song_id} value={song.song_id}>
                      {song.title} - {song.artist_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay canciones disponibles</option>
                )}
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowAddSongModal(false)}
              >
                Cancelar
              </button>
              <motion.button
                className="btn-add"
                onClick={handleAddSong}
                disabled={addingSong || !selectedSongId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {addingSong ? 'Agregando...' : 'Agregar'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PlaylistDetail;