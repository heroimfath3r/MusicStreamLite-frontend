// frontend/react-app/src/contexts/PlayerContext.jsx
import React, { createContext, useContext, useState, useRef } from 'react';

// Crear el contexto
const PlayerContext = createContext();

// Hook personalizado para usar el contexto
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Provider del contexto
export const PlayerProvider = ({ children }) => {
  // Estado de la canción actual
  const [currentSong, setCurrentSong] = useState(null);
  
  // Estado de reproducción
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Cola de reproducción
  const [queue, setQueue] = useState([]);
  
  // Índice actual en la cola
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Referencia al audio (para controlar desde cualquier componente)
  const audioRef = useRef(null);

  // ============================================
  // FUNCIONES DE CONTROL
  // ============================================

  /**
   * Reproducir una canción específica
   * @param {Object} song - Objeto de canción con song_id, title, artist_name, cover_image_url
   */
  const playSong = (song) => {
    console.log('🎵 Reproduciendo:', song);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  /**
   * Pausar/Reanudar reproducción
   */
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error al reproducir:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Reproducir siguiente canción en la cola
   */
  const playNext = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playSong(queue[nextIndex]);
    }
  };

  /**
   * Reproducir canción anterior
   */
  const playPrevious = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queue[prevIndex]);
    }
  };

  /**
   * Establecer cola de reproducción
   * @param {Array} songs - Array de canciones
   * @param {Number} startIndex - Índice de la canción inicial
   */
  const setPlayQueue = (songs, startIndex = 0) => {
    setQueue(songs);
    setCurrentIndex(startIndex);
    if (songs.length > 0) {
      playSong(songs[startIndex]);
    }
  };

  /**
   * Limpiar cola y detener reproducción
   */
  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
    setCurrentSong(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  // Valor del contexto
  const value = {
    // Estado
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    audioRef,
    
    // Funciones
    playSong,
    togglePlayPause,
    playNext,
    playPrevious,
    setPlayQueue,
    clearQueue,
    setIsPlaying,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};