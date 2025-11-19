// frontend/src/hooks/useSongStream.js
import { useState, useEffect, useRef } from 'react';
import  { streamAPI } from '../services/api.js';

export const useSongStream = (songId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const renewTimeoutRef = useRef(null);

  useEffect(() => {
    if (!songId) {
      console.warn('⚠️ [useSongStream] songId es undefined/null');
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchStreamUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎵 [useSongStream] Obteniendo URL para canción:', songId);
        console.log('📍 [useSongStream] Endpoint: /api/stream/songs/' + songId + '/stream-url');

        // Hacer la petición
        const response = await streamAPI.get(`/api/stream/songs/${songId}/stream-url`);

        console.log('📦 [useSongStream] Respuesta completa:', response);
        console.log('📦 [useSongStream] Response.data:', response.data);

        const { url: newUrl, expiresIn, success, error: apiError } = response.data;

        if (!success) {
          console.error('❌ [useSongStream] API retornó success:false', response.data);
          setError(apiError || 'Error desconocido del servidor');
          setUrl(null);
          setLoading(false);
          return;
        }

        if (!newUrl) {
          console.error('❌ [useSongStream] API retornó url vacía');
          setError('URL vacía recibida del servidor');
          setUrl(null);
          setLoading(false);
          return;
        }

        console.log('✅ [useSongStream] URL obtenida exitosamente');
        console.log('🔗 [useSongStream] URL (primeros 100 chars):', newUrl.substring(0, 100) + '...');
        console.log('⏱️  [useSongStream] Expira en:', expiresIn, 'segundos');

        setUrl(newUrl);
        setError(null);
        setLoading(false);

        // Programar renovación
        const timeUntilExpiration = expiresIn * 1000;
        const renewTime = timeUntilExpiration - (60 * 60 * 1000);

        console.log('🔄 [useSongStream] Renovación programada en:', Math.round(renewTime / 1000), 'segundos');

        if (renewTimeoutRef.current) {
          clearTimeout(renewTimeoutRef.current);
        }

        renewTimeoutRef.current = setTimeout(() => {
          console.log('🔄 [useSongStream] Renovando URL automáticamente...');
          fetchStreamUrl();
        }, renewTime);

      } catch (err) {
        console.error('❌ [useSongStream] Error completo:', err);
        console.error('📋 [useSongStream] Error message:', err.message);
        console.error('📋 [useSongStream] Error status:', err.response?.status);
        console.error('📋 [useSongStream] Error data:', err.response?.data);
        
        const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
        console.error('📋 [useSongStream] Error final:', errorMessage);
        
        setError(errorMessage);
        setUrl(null);
        setLoading(false);
      }
    };

    fetchStreamUrl();

    return () => {
      if (renewTimeoutRef.current) {
        clearTimeout(renewTimeoutRef.current);
      }
    };
  }, [songId]);

  return { url, loading, error };
};