import axios from 'axios';

const ANALYTICS_URL = process.env.REACT_APP_ANALYTICS_API || 'https://analytics-service-586011919703.us-central1.run.app';

/**
 * Servicio para registrar eventos de reproducción de canciones
 */
const analyticsService = {
  /**
   * Registra un evento de "play" en el servidor de analíticas
   * @param {string} userId - ID del usuario
   * @param {string} songId - ID de la canción
   * @param {number} duration - Duración total de la canción en segundos
   * @returns {Promise} - Respuesta del servidor
   */
  trackPlay: async (userId, songId, duration) => {
    try {
      const payload = {
        userId,
        songId,
        duration,
        timestamp: new Date().toISOString(),
      };

      console.log('📊 Enviando evento de play:', payload);

      const response = await axios.post(`${ANALYTICS_URL}/api/plays`, payload, {
        timeout: 5000, // Espera máximo 5 segundos
      });

      console.log('✅ Evento registrado correctamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al registrar el evento de play:', error.message);
      // No lanzamos el error para que no interrumpa la reproducción
      return null;
    }
  },

  /**
   * Registra el tiempo que el usuario realmente escuchó
   * (Opcional: llamar cuando pausa o termina)
   * @param {string} userId - ID del usuario
   * @param {string} songId - ID de la canción
   * @param {number} secondsListened - Segundos que escuchó realmente
   * @returns {Promise} - Respuesta del servidor
   */
  trackPlayDuration: async (userId, songId, secondsListened) => {
    try {
      const payload = {
        userId,
        songId,
        duration: secondsListened,
        timestamp: new Date().toISOString(),
        event: 'pause', // O 'ended' dependiendo de dónde se llame
      };

      console.log('📊 Enviando duración escuchada:', payload);

      const response = await axios.post(`${ANALYTICS_URL}/api/plays`, payload, {
        timeout: 5000,
      });

      console.log('✅ Duración registrada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al registrar duración:', error.message);
      return null;
    }
  },
};

export default analyticsService;