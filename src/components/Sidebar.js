import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaSearch,
  FaBook,
  FaHeart,
  FaCompactDisc,
  FaUserCircle,
  FaItunesNote,
  FaList,
  FaBroadcastTower,
  FaSpinner,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';
import { playlistsAPI, songsAPI } from '../services/api.js';
import './Sidebar.css';

const Sidebar = () => {
  // Estados para datos dinámicos
  const [playlists, setPlaylists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar playlists al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📋 Cargando datos del sidebar...');

        // ✅ FIXED: Mejor manejo de errores y validación
        try {
          const playlistsData = await playlistsAPI.getAll();
          
          // Validar que la respuesta sea válida
          if (playlistsData && playlistsData.playlists) {
            setPlaylists(playlistsData.playlists || []);
            console.log(`✅ Cargadas ${playlistsData.playlists?.length || 0} playlists`);
          } else {
            console.warn('⚠️ Respuesta de playlists inesperada:', playlistsData);
            setPlaylists([]);
          }
        } catch (playlistErr) {
          console.error('❌ Error cargando playlists:', playlistErr.message);
          setPlaylists([]);
          // No detener aquí, continuar con canciones
        }

        // Cargar canciones recientes (últimas 5)
        try {
          const songsData = await songsAPI.getAll({ limit: 5, sort: 'created_at', order: 'DESC' });
          
          // Validar respuesta de songs
          if (songsData && songsData.data) {
            setRecentSongs(Array.isArray(songsData.data) ? songsData.data : []);
            console.log(`✅ Cargadas ${Array.isArray(songsData.data) ? songsData.data.length : 0} canciones recientes`);
          } else if (Array.isArray(songsData)) {
            setRecentSongs(songsData);
          } else {
            console.warn('⚠️ Respuesta de songs inesperada:', songsData);
            setRecentSongs([]);
          }
        } catch (songsErr) {
          console.error('❌ Error cargando canciones:', songsErr.message);
          setRecentSongs([]);
        }

      } catch (err) {
        console.error('❌ Error cargando datos del sidebar:', err);
        setError(err.response?.data?.error || err.message || 'Error desconocido');
        setPlaylists([]);
        setRecentSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sidebarVariants = {
    hidden: { x: -250 },
    visible: {
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside 
      className="apple-sidebar"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <nav className="sidebar-nav">
        {/* Grupo principal */}
        <motion.ul className="nav-group" variants={sidebarVariants}>
          <motion.li variants={itemVariants}>
            <NavLink to="/home" className="sidebar-link">
              <FaHome size={18} />
              <span>Inicio</span>
            </NavLink>
          </motion.li>
          <motion.li variants={itemVariants}>
            <NavLink to="/history" className="sidebar-link">
              <FaClock size={18} />
              <span>Historial</span>
            </NavLink>
          </motion.li>
        </motion.ul>

        <motion.div className="sidebar-divider" variants={itemVariants}></motion.div>

        {/* Grupo: Biblioteca */}
        <motion.h3 variants={itemVariants}>Biblioteca</motion.h3>
        <motion.ul className="nav-group" variants={sidebarVariants}>
          <motion.li variants={itemVariants}>
            <NavLink to="/search/artists" className="sidebar-link">
              <FaUserCircle size={18} />
              <span>Artistas</span>
            </NavLink>
          </motion.li>
          <motion.li variants={itemVariants}>
            <NavLink to="/search/albums" className="sidebar-link">
              <FaCompactDisc size={18} />
              <span>Álbumes</span>
            </NavLink>
          </motion.li>
          <motion.li variants={itemVariants}>
            <NavLink to="/search/songs" className="sidebar-link">
              <FaItunesNote size={18} />
              <span>Canciones</span>
            </NavLink>
          </motion.li>
        </motion.ul>

        <motion.div className="sidebar-divider" variants={itemVariants}></motion.div>

        {/* Grupo: Playlists */}
        <motion.h3 variants={itemVariants}>Playlists</motion.h3>
        <motion.ul className="nav-group" variants={sidebarVariants}>

          <motion.li variants={itemVariants}>
            <NavLink to="/playlists" className="sidebar-link small-text">
              <FaList size={16} />
              <span>Todas las playlists</span>
            </NavLink>
          </motion.li>
          <motion.li variants={itemVariants}>
            <NavLink to="/playlists/favorites" className="sidebar-link small-text">
              <FaHeart size={16} />
              <span>Canciones favoritas</span>
            </NavLink>
          </motion.li>

          {/* ✅ FIXED: Mostrar indicador de carga con mejor manejo */}
          {loading && (
            <motion.li variants={itemVariants}>
              <div className="sidebar-link small-text loading-indicator">
                <FaSpinner className="fa-spin" size={16} />
                <span>Cargando playlists...</span>
              </div>
            </motion.li>
          )}

          {/* ✅ FIXED: Mostrar error si existe */}
          {error && !loading && (
            <motion.li variants={itemVariants}>
              <div className="sidebar-link small-text error-indicator">
                <FaExclamationTriangle size={16} />
                <span title={error}>Error al cargar</span>
              </div>
            </motion.li>
          )}

          {/* Mostrar playlists del usuario */}
          {!loading && playlists.length > 0 && playlists.slice(0, 8).map((playlist, index) => {
            // Generar colores aleatorios para los dots
            const colors = ['#4ECDC4', '#6B5B95', '#FEB236', '#D6ED17', '#FF6B6B', '#95E1D3', '#F38181', '#AA96DA'];
            const color = colors[index % colors.length];

            return (
              <motion.li key={playlist.playlist_id || playlist.id} variants={itemVariants}>
                <NavLink to={`/playlists/${playlist.id}`} className="sidebar-link small-text">
                  <span className="playlist-dot" style={{backgroundColor: color}}></span>
                  <span title={playlist.name}>
                    {playlist.name.length > 20 ? `${playlist.name.substring(0, 20)}...` : playlist.name}
                  </span>
                </NavLink>
              </motion.li>
            );
          })}

          {/* Mostrar mensaje si no hay playlists */}
          {!loading && playlists.length === 0 && !error && (
            <motion.li variants={itemVariants}>
              <div className="sidebar-link small-text" style={{ opacity: 0.6 }}>
                <FaMusic size={16} />
                <span>No hay playlists</span>
              </div>
            </motion.li>
          )}

          {/* Mostrar "Más..." si hay más de 8 playlists */}
          {!loading && playlists.length > 8 && (
            <motion.li variants={itemVariants}>
              <NavLink to="/playlists" className="sidebar-link small-text">
                <FaList size={16} />
                <span>Más... ({playlists.length - 8})</span>
              </NavLink>
            </motion.li>
          )}
        </motion.ul>
      </nav>


    </motion.aside>
  );
};

export default Sidebar;