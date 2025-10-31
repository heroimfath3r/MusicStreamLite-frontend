import React, { useState, useRef } from 'react';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // CANCIÓN PÚBLICA DE PRUEBA - FUNCIONA 100%
  const demoSong = {
    title: "XXXTENTACION - Find Me",
    artist: "XXXTENTACION", 
    url: "https://storage.googleapis.com/music-stream-lite-bucket/xxxtentacion-Find-Me.mp3?x-goog-signature=345ffe5f07a1fd3b4732addac70e45910be042114605eb10cc79bbe3e6625452bcb164dafa97043e2b8d33370d3f431061e4a69fc869c579c843588112d9a5a17dad665bd4e1c05a91082746bbdd7c2a43efa00f8b37c52c00ab05f993e7a519c34082571386b27bc6c344886318ff3abf778d5c4bd6b839463ca07862e4be031df1c0ec059aa824e5444c0ebd2e3cbea938c5bf8f14fca5aad8365151214012101401e8ddd3ed38ef5457b7cf81d3754bf5a00a7d4ec7d45b4a0a36942077b57041ed5ec893d437fdc4298fd63b98ee146090ad132044c1eabf284d6a84415e7f402a4af34b4c0a428329550886739d70131e9c267b58511f50e63f8b4acdd3&x-goog-algorithm=GOOG4-RSA-SHA256&x-goog-credential=musicstream-catalog-service%40musicstreamlite.iam.gserviceaccount.com%2F20251031%2Fus-central1%2Fstorage%2Fgoog4_request&x-goog-date=20251031T052834Z&x-goog-expires=600&x-goog-signedheaders=host"
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="music-player">
      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        src={demoSong.url}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Información de la canción */}
      <div className="song-info">
        <h4 className="song-title">{demoSong.title}</h4>
        <p className="song-artist">{demoSong.artist}</p>
      </div>

      {/* Controles */}
      <div className="player-controls">
        <button className="control-btn" onClick={togglePlay}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
        </div>
      </div>

      {/* Volumen */}
      <div className="volume-control">
        <button className="volume-btn">🔊</button>
      </div>
    </div>
  );
};

export default MusicPlayer;