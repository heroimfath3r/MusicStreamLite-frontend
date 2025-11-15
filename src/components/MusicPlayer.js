// src/components/MusicPlayer.js
// ✅ CON FUNCIONALIDAD DE FAVORITOS INTEGRADA

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSongStream } from '../hooks/useSongStream.js';
import { usePlayer } from '../contexts/PlayerContext.jsx';
import { motion } from 'framer-motion';
import analyticsService from '../services/analyticsservice.js';
import { usersAPI } from '../services/api.js';
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
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const { url: streamUrl, loading: urlLoading, error: streamError } = useSongStream(currentSong?.song_id);
  const playEventTrackedRef = useRef(false); // 📊 ANALYTICS

  // ============================================
  // CARGAR FAVORITOS AL MONTAR
  // ============================================
  useEffect(() => {
    loadFavorites();
  }, []);

  // ============================================
  // CARGAR FAVORITOS
  // ============================================
  const loadFavorites = useCallback(async () => {
    try {
      const response = await usersAPI.getFavorites();
      
      let favArray = [];
      
      if (Array.isArray(response)) {
        favArray = response;
      } else if (response.favorites && Array.isArray(response.favorites)) {
        favArray = response.favorites;
      } else if (response.data && Array.isArray(response.data)) {
        favArray = response.data;
      }

      setFavorites(favArray);
      console.log(`❤️ Cargados ${favArray.length} favoritos`);
    } catch (err) {
      console.error('⚠️ Error cargando favoritos:', err);
      setFavorites([]);
    }
  }, []);

  // ============================================
  // VERIFICAR SI LA CANCIÓN ACTUAL ES FAVORITA
  // ============================================
  useEffect(() => {
    if (currentSong?.song_id) {
      const isFav = favorites.some(f => f.song_id === currentSong.song_id || f.songId === currentSong.song_id);
      setIsFavorite(isFav);
    } else {
      setIsFavorite(false);
    }
  }, [currentSong, favorites]);

  // ============================================
  // AGREGAR/REMOVER DE FAVORITOS
  // ============================================
  const handleToggleFavorite = useCallback(async () => {
    if (!currentSong?.song_id) {
      console.warn('⚠️ No hay canción actual');
      return;
    }

    try {
      setLoadingFavorite(true);

      if (isFavorite) {
        // Remover de favoritos
        console.log('❤️ Removiendo de favoritos...');
        await usersAPI.removeFavorite(currentSong.song_id);
        setFavorites(prev => prev.filter(f => f.song_id !== currentSong.song_id && f.songId !== currentSong.song_id));
        setIsFavorite(false);
        console.log('✅ Eliminado de favoritos');
      } else {
        // Agregar a favoritos
        console.log('❤️ Agregando a favoritos...');
        await usersAPI.addFavorite(currentSong.song_id);
        await loadFavorites();
        setIsFavorite(true);
        console.log('✅ Agregado a favoritos');
      }
    } catch (err) {
      console.error('❌ Error al toggle favorite:', err);
      // Revertir estado si hay error
      setIsFavorite(!isFavorite);
    } finally {
      setLoadingFavorite(false);
    }
  }, [currentSong, isFavorite, loadFavorites]);

  // ============================================
  // ✅ MEJORADO: Cargar y reproducir cuando streamUrl esté listo
  // ============================================
  useEffect(() => {
    console.log('🎬 [MusicPlayer] useEffect ejecutado');
    console.log('  - streamUrl:', streamUrl);
    console.log('  - urlLoading:', urlLoading);
    console.log('  - streamError:', streamError);
    console.log('  - currentSong:', currentSong?.title);
    console.log('  - isPlaying:', isPlaying);

    if (!currentSong) {
      console.warn('⚠️ [MusicPlayer] No hay currentSong');
      return;
    }

    if (urlLoading) {
      console.log('⏳ [MusicPlayer] Esperando URL de stream...');
      return;
    }

    if (streamError) {
      console.error('❌ [MusicPlayer] Error en stream:', streamError);
      return;
    }

    if (!streamUrl) {
      console.error('❌ [MusicPlayer] streamUrl es NULL/undefined');
      console.error('  - urlLoading:', urlLoading);
      console.error('  - streamError:', streamError);
      return;
    }

    if (!audioRef.current) {
      console.error('❌ [MusicPlayer] audioRef.current no existe');
      return;
    }

    const audio = audioRef.current;
    
    console.log('🔄 [MusicPlayer] Verificando si necesita recargar');
    console.log('  - audio.src actual:', audio.src);
    console.log('  - streamUrl nuevo:', streamUrl);
    console.log('  - ¿Son diferentes?:', audio.src !== streamUrl);

    if (audio.src !== streamUrl) {
      console.log('📝 [MusicPlayer] Sí necesita recargar');
      console.log('🔄 [MusicPlayer] Cargando canción:', currentSong.title);
      
      if (!audio.paused) {
        console.log('⏹️  [MusicPlayer] Pausando audio anterior');
        audio.pause();
      }
      
      console.log('🔗 [MusicPlayer] Estableciendo src a:', streamUrl.substring(0, 100) + '...');
      audio.src = streamUrl;
      
      console.log('📦 [MusicPlayer] Llamando audio.load()');
      audio.load();
      
      const handleCanPlay = () => {
        console.log('✅ [MusicPlayer] Audio está listo (canplay event)');
        console.log('  - audio.readyState:', audio.readyState);
        console.log('  - audio.duration:', audio.duration);
        console.log('  - isPlaying desde estado:', isPlaying);
        
        if (isPlaying) {
          console.log('▶️  [MusicPlayer] Iniciando reproducción (isPlaying=true)');
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ [MusicPlayer] Reproducción iniciada exitosamente');
              })
              .catch(error => {
                console.error('❌ [MusicPlayer] Error al reproducir:', error);
                console.error('  - Tipo de error:', error.name);
                console.error('  - Mensaje:', error.message);
                setIsPlaying(false);
              });
          }
        } else {
          console.log('⏸️  [MusicPlayer] No iniciando reproducción (isPlaying=false)');
        }
        
        audio.removeEventListener('canplay', handleCanPlay);
      };
      
      console.log('👂 [MusicPlayer] Agregando listener "canplay"');
      audio.addEventListener('canplay', handleCanPlay);
      
      return () => {
        console.log('🧹 [MusicPlayer] Cleanup: removiendo listener canplay');
        audio.removeEventListener('canplay', handleCanPlay);
      };
    } else {
      console.log('⏭️  [MusicPlayer] URL no cambió, no necesita recargar');
    }
  }, [streamUrl, urlLoading, currentSong, isPlaying, streamError]);

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
      console.log('✅ [MusicPlayer] Metadata cargada');
      console.log('  - Duración:', audioRef.current.duration);
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
          console.log('▶️  [MusicPlayer] onPlay event fired');
          setIsPlaying(true);
          
          if (!playEventTrackedRef.current && currentSong?.song_id) {
            playEventTrackedRef.current = true;
            
            const userId = currentSong.user_id || 'anonymous';
            
            console.log('📊 [MusicPlayer] Registrando reproducción');
            console.log('  - userId:', userId);
            console.log('  - songId:', currentSong.song_id);
            console.log('  - duración:', Math.round(duration));
            
            analyticsService.trackPlay(
              userId,
              currentSong.song_id,
              Math.round(duration)
            );
          }
        }}
        onPause={() => {
          console.log('⏸️  [MusicPlayer] onPause event fired');
          setIsPlaying(false);
        }}
        onError={(e) => {
          console.error('❌ [MusicPlayer] Audio error event:', e.target.error);
          console.error('  - Error code:', e.target.error?.code);
          console.error('  - Error message:', e.target.error?.message);
        }}
        onLoadStart={() => {
          console.log('📥 [MusicPlayer] onLoadStart event fired');
        }}
        onCanPlay={() => {
          console.log('✅ [MusicPlayer] onCanPlay event fired');
        }}
        onCanPlayThrough={() => {
          console.log('✅ [MusicPlayer] onCanPlayThrough event fired');
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
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          title={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
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