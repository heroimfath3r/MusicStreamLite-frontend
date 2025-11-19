// frontend/react-app/src/pages/PlaylistsView.js
// ✅ CON DEBUGGING PARA ENCONTRAR PROBLEMA DE REDIRECCIÓN

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaMusic, FaEllipsisV } from 'react-icons/fa';
import { playlistsAPI } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import './PlaylistsView.css';

const PlaylistsView = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();

  // ✅ DEBUG: Monitorear cambios en showCreateModal
  useEffect(() => {
    console.log('🔵 showCreateModal cambió a:', showCreateModal);
  }, [showCreateModal]);

  // ✅ DEBUG: Monitorear navegación
  useEffect(() => {
    console.log('🔵 PlaylistsView montado');
    return () => {
      console.log('🔵 PlaylistsView desmontado');
    };
  }, []);

  // ============================================================
  // EFFECT: CARGAR PLAYLISTS AL MONTAR
  // ============================================================
  useEffect(() => {
    loadPlaylists();
  }, []);

  // ============================================================
  // CARGAR PLAYLISTS
  // ============================================================
  const loadPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Cargando playlists...');

      const response = await playlistsAPI.getAll();

      let playlistsArray = [];

      if (Array.isArray(response)) {
        playlistsArray = response;
      } else if (response.playlists && Array.isArray(response.playlists)) {
        playlistsArray = response.playlists;
      } else if (response.data && Array.isArray(response.data)) {
        playlistsArray = response.data;
      }

      setPlaylists(playlistsArray);
      console.log(`✅ Cargadas ${playlistsArray.length} playlists`);
    } catch (err) {
      console.error('❌ Error cargando playlists:', err);
      setError('Error al cargar las playlists');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // CREAR PLAYLIST
  // ============================================================
  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim()) {
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    try {
      setCreatingPlaylist(true);
      console.log('📝 Creando playlist:', newPlaylistName);

      await playlistsAPI.create({
        name: newPlaylistName,
        description: newPlaylistDesc || null,
        is_public: false
      });

      console.log('✅ Playlist creada');

      // Recargar playlists
      await loadPlaylists();

      // Limpiar modal
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);

      alert('Playlist creada exitosamente');
    } catch (err) {
      console.error('❌ Error creando playlist:', err);
      alert('Error al crear la playlist');
    } finally {
      setCreatingPlaylist(false);
    }
  }, [newPlaylistName, newPlaylistDesc, loadPlaylists]);

  // ============================================================
  // ELIMINAR PLAYLIST
  // ============================================================
  const handleDeletePlaylist = useCallback(async (playlistId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta playlist?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando playlist:', playlistId);
      await playlistsAPI.delete(playlistId);

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      setActiveMenu(null);

      console.log('✅ Playlist eliminada');
      alert('Playlist eliminada exitosamente');
    } catch (err) {
      console.error('❌ Error eliminando playlist:', err);
      alert('Error al eliminar la playlist');
    }
  }, []);

  // ============================================================
  // NAVEGAR A DETALLE DE PLAYLIST
  // ============================================================
  const handleOpenPlaylist = useCallback((playlistId) => {
    console.log('🔵 Navegando a playlist:', playlistId);
    navigate(`/playlists/${playlistId}`);
  }, [navigate]);

  // ✅ NUEVO: Handler para abrir modal con debugging
  const handleOpenModal = useCallback((e) => {
    console.log('🔵 ======== CLICK EN NUEVA PLAYLIST ========');
    console.log('🔵 Event:', e);
    console.log('🔵 showCreateModal ANTES:', showCreateModal);
    console.log('🔵 window.location.pathname:', window.location.pathname);
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setShowCreateModal(true);
    console.log('🔵 setShowCreateModal(true) ejecutado');
    
    // Verificar después de un tick
    setTimeout(() => {
      console.log('🔵 showCreateModal DESPUÉS:', showCreateModal);
      console.log('🔵 window.location.pathname DESPUÉS:', window.location.pathname);
    }, 100);
  }, [showCreateModal]);

  // ============================================================
  // RENDER: LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="playlists-container">
        <div className="playlists-loading">
          <div className="spinner"></div>
          <p>Cargando tus playlists...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ERROR
  // ============================================================
  if (error) {
    return (
      <div className="playlists-container">
        <div className="playlists-error">
          <p>❌ {error}</p>
          <button onClick={loadPlaylists} className="retry-button">
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
    <div className="playlists-container">
      {/* HEADER */}
      <div className="playlists-header">
        <motion.h1
          className="playlists-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Mis Playlists
        </motion.h1>

        {/* ✅ BOTÓN CON DEBUGGING */}
        <button
          className="create-playlist-btn"
          onClick={handleOpenModal}
          type="button"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <FaPlus /> Nueva Playlist (DEBUG)
        </button>
      </div>

      {/* GRID DE PLAYLISTS */}
      <motion.div
        className="playlists-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {playlists.length === 0 ? (
          <div className="no-playlists">
            <FaMusic size={48} />
            <p>No tienes playlists aún</p>
            <button 
              onClick={handleOpenModal}
              className="create-first-btn"
              type="button"
            >
              Crear tu primera playlist
            </button>
          </div>
        ) : (
          playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              className="playlist-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* PORTADA */}
              <div 
                className="playlist-cover"
                onClick={() => handleOpenPlaylist(playlist.id)}
                style={{ cursor: 'pointer' }}
              >
                {playlist.coverImage ? (
                  <img 
                    src={playlist.coverImage} 
                    alt={playlist.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="playlist-placeholder">
                    <FaMusic size={40} />
                  </div>
                )}
              </div>

              {/* INFORMACIÓN */}
              <div className="playlist-info">
                <h3 
                  className="playlist-name"
                  onClick={() => handleOpenPlaylist(playlist.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {playlist.name}
                </h3>
                {playlist.description && (
                  <p className="playlist-desc">{playlist.description}</p>
                )}
                <p className="playlist-songs">
                  {playlist.songCount} {playlist.songCount === 1 ? 'canción' : 'canciones'}
                </p>
              </div>

              {/* MENU */}
              <div className="playlist-menu">
                <motion.button
                  className="menu-btn"
                  onClick={() => setActiveMenu(activeMenu === playlist.id ? null : playlist.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEllipsisV />
                </motion.button>

                {activeMenu === playlist.id && (
                  <motion.div
                    className="menu-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button 
                      onClick={() => handleOpenPlaylist(playlist.id)}
                      className="menu-item"
                    >
                      Ver canciones
                    </button>
                    <button 
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      className="menu-item delete"
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ✅ DEBUG: Mostrar estado del modal */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'lime',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        <div>showCreateModal: {String(showCreateModal)}</div>
        <div>pathname: {window.location.pathname}</div>
      </div>

      {/* MODAL: CREAR PLAYLIST */}
      {showCreateModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            console.log('🔵 Click en overlay, cerrando modal');
            setShowCreateModal(false);
          }}
          style={{ zIndex: 10000 }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => {
              console.log('🔵 Click en modal content, previniendo propagación');
              e.stopPropagation();
            }}
          >
            <h2>Crear nueva playlist</h2>

            <div className="form-group">
              <label>Nombre de la playlist</label>
              <input
                type="text"
                placeholder="Mi playlist especial"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreatePlaylist();
                }}
              />
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                placeholder="Describe tu playlist..."
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <motion.button
                className="btn-create"
                onClick={handleCreatePlaylist}
                disabled={creatingPlaylist}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {creatingPlaylist ? 'Creando...' : 'Crear'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PlaylistsView;