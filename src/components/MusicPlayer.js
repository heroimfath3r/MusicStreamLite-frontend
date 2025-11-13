// src/components/MusicPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { useSongStream } from '../hooks/useSongStream.js';
import { usePlayer } from '../contexts/PlayerContext.jsx';
import { motion } from 'framer-motion';
import analyticsService from '../services/analyticsservice.js';
import { 
  FaPlay, 
  FaPause, 
  FaStepBackward, 
  FaStepForward, 
  FaVolumeMute, 
  FaVolumeUp,
  FaHeart,
  FaRegHeart,
  FaListUl,
  FaRandom,
  FaRedoAlt
} from 'react-icons/fa';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause,
    playNext,
    playPrevious,
    audioRef,
    setIsPlaying 
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);

  const { url: streamUrl, loading: urlLoading } = useSongStream(currentSong?.song_id);
  const playEventTrackedRef = useRef(false); // 📊 ANALYTICS

  // ============================================
  // ✅ Cargar y reproducir cuando streamUrl esté listo
  // ============================================
  useEffect(() => {
    // Validar que tenemos todo lo necesario
    if (!streamUrl || urlLoading || !audioRef.current || !currentSong) {
      return;
    }

    const audio = audioRef.current;
    
    // Solo actualizar si la URL realmente cambió
    if (audio.src !== streamUrl) {
      console.log('🔄 Cargando canción:', currentSong.title);
      
      // Pausar cualquier reproducción anterior
      audio.pause();
      
      // Establecer nueva fuente
      audio.src = streamUrl;
      
      // Cargar el audio
      audio.load();
      
      // ✅ Esperar a que el audio esté listo antes de reproducir
      const handleCanPlay = () => {
        console.log('✅ Audio listo, reproduciendo automáticamente');
        
        // Solo reproducir si el estado dice que debería estar reproduciéndose
        if (isPlaying) {
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ Reproducción iniciada con éxito');
              })
              .catch(error => {
                console.error('❌ Error al reproducir:', error);
                setIsPlaying(false);
              });
          }
        }
        
        // Limpiar el listener
        audio.removeEventListener('canplay', handleCanPlay);
      };
      
      // Escuchar cuando el audio esté listo
      audio.addEventListener('canplay', handleCanPlay);
      
      // Cleanup: Remover listener si el componente se desmonta
      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [streamUrl, urlLoading, currentSong, isPlaying]);

  // ============================================
  // Sincronizar volumen
  // ============================================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSongEnd = () => {
    if (repeatMode === 2) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (!currentSong) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const playButtonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.1 }
  };

  return (
    <motion.div 
      className="apple-music-player"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
        onPlay={() => {
          console.log('🎵 Audio onPlay event');
          setIsPlaying(true);
          
          // 📊 ANALYTICS: Registrar reproducción
          if (!playEventTrackedRef.current && currentSong?.song_id) {
            playEventTrackedRef.current = true;
            
            const userId = currentSong.user_id || 'anonymous';
            
            analyticsService.trackPlay(
              userId,
              currentSong.song_id,
              Math.round(duration)
            );
          }
        }}
        onPause={() => {
          console.log('⏸️ Audio onPause event');
          setIsPlaying(false);
        }}
        onError={(e) => {
          console.error('❌ Audio error:', e.target.error);
        }}
      />

      {/* Left side - Song info */}
      <div className="player-left">
        <motion.div 
          className="now-playing-cover"
          whileHover={{ scale: 1.05 }}
        >
          <img 
            src={currentSong.cover_image_url || 'https://via.placeholder.com/56x56/1a1f3a/007AFF?text=No+Cover'} 
            alt={currentSong.title} 
          />
        </motion.div>

        <div className="now-playing-info">
          <div className="now-playing-title">{currentSong.title || 'Sin título'}</div>
          <div className="now-playing-artist">{currentSong.artist_name || 'Artista desconocido'}</div>
        </div>

        <motion.button
          className={`like-btn ${isFavorite ? 'liked' : ''}`}
          onClick={() => setIsFavorite(!isFavorite)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </motion.button>
      </div>

      {/* Center - Controls and progress */}
      <div className="player-center">
        <div className="player-controls">
          <motion.button
            className={`control-btn ${shuffleMode ? 'active' : ''}`}
            onClick={toggleShuffle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Aleatorio"
          >
            <FaRandom size={16} />
          </motion.button>

          <motion.button
            className="control-btn"
            onClick={playPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Anterior"
          >
            <FaStepBackward size={18} />
          </motion.button>

          <motion.button
            className="play-pause-btn"
            onClick={togglePlayPause}
            variants={playButtonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
          </motion.button>

          <motion.button
            className="control-btn"
            onClick={playNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Siguiente"
          >
            <FaStepForward size={18} />
          </motion.button>

          <motion.button
            className={`control-btn ${repeatMode !== 0 ? 'active' : ''}`}
            onClick={toggleRepeat}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={repeatMode === 0 ? 'Sin repetición' : repeatMode === 1 ? 'Repetir todo' : 'Repetir uno'}
          >
            <FaRedoAlt size={16} />
            {repeatMode === 2 && <span className="repeat-one">1</span>}
          </motion.button>
        </div>

        <div className="progress-container">
          <span className="time-current">{formatTime(currentTime)}</span>
          <motion.input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="progress-bar"
            whileHover={{ scaleY: 1.5 }}
          />
          <span className="time-total">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right side - Volume and extras */}
      <div className="player-right">
        <motion.button
          className="player-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Cola"
        >
          <FaListUl size={18} />
        </motion.button>

        <div className="volume-control">
          <motion.button
            className="volume-btn"
            onClick={toggleMute}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted || volume === 0 ? (
              <FaVolumeMute size={16} />
            ) : (
              <FaVolumeUp size={16} />
            )}
          </motion.button>

          <motion.input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-bar"
            whileHover={{ scaleY: 1.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;