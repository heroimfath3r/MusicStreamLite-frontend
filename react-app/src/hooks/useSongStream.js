// frontend/react-app/src/hooks/useSongStream.js
import { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';  // ⭐ Importar instancia centralizada

export const useSongStream = (songId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const renewTimeoutRef = useRef(null);

  useEffect(() => {
    if (!songId) {
      setUrl(null);
      return;
    }

    const fetchStreamUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎵 Obteniendo URL de stream para canción:', songId);

        // ⭐ Usar instancia centralizada de api.js
        // Esta instancia ya tiene el token automáticamente
        const response = await api.get(`/songs/${songId}/stream-url`);
        const { url: newUrl, expiresIn } = response.data;

        console.log('✅ URL de stream obtenida');
        setUrl(newUrl);

        // Programar renovación 1 hora antes de que expire
        // expiresIn viene en segundos (86400 = 24h)
        const timeUntilExpiration = expiresIn * 1000; // Convertir a ms
        const renewTime = timeUntilExpiration - (60 * 60 * 1000); // Restar 1 hora

        // Limpiar timeout anterior si existe
        if (renewTimeoutRef.current) {
          clearTimeout(renewTimeoutRef.current);
        }

        // Programar nueva renovación
        renewTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Renovando URL de canción...');
          fetchStreamUrl(); // Recursivo: se llamará a sí mismo
        }, renewTime);

      } catch (err) {
        console.error('❌ Error obteniendo URL de stream:', err);
        setError(err.response?.data?.error || 'Error al cargar la canción');
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamUrl();

    // Cleanup: limpiar timeout al desmontar o cambiar songId
    return () => {
      if (renewTimeoutRef.current) {
        clearTimeout(renewTimeoutRef.current);
      }
    };
  }, [songId]);

  return { url, loading, error };
};