// src/services/api.js
import axios from 'axios';

// ============================================
// 🌐 Configuración de API Gateway en GCP
// ============================================
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY 
  || 'https://musicstream-gateway-7h7kd74n.uc.gateway.dev';

console.log('🌐 API Gateway configurado:', API_GATEWAY_URL);

// Crear instancia única con API Gateway
const apiClient = axios.create({
  baseURL: `${API_GATEWAY_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Interceptor global para agregar token a TODAS las peticiones
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// SONGS API (Catalog Service)
// ============================================
export const songsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/songs', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/songs/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/songs/search', { params: { q: query } });
    return response.data;
  },

  create: async (songData) => {
    const response = await apiClient.post('/songs', songData);
    return response.data;
  },

  update: async (id, songData) => {
    const response = await apiClient.put(`/songs/${id}`, songData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/songs/${id}`);
    return response.data;
  },
};

// ============================================
// ALBUMS API (Catalog Service)
// ============================================
export const albumsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/albums', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/albums/${id}`);
    return response.data;
  },

  getByArtist: async (artistId) => {
    const response = await apiClient.get(`/albums/artist/${artistId}`);
    return response.data;
  },

  create: async (albumData) => {
    const response = await apiClient.post('/albums', albumData);
    return response.data;
  },

  update: async (id, albumData) => {
    const response = await apiClient.put(`/albums/${id}`, albumData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/albums/${id}`);
    return response.data;
  },
};

// ============================================
// ARTISTS API (Catalog Service)
// ============================================
export const artistsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/artists', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
  },

  create: async (artistData) => {
    const response = await apiClient.post('/artists', artistData);
    return response.data;
  },

  update: async (id, artistData) => {
    const response = await apiClient.put(`/artists/${id}`, artistData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/artists/${id}`);
    return response.data;
  },
};

// ============================================
// USERS API (User Service)
// ============================================
export const usersAPI = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  },

  addFavorite: async (songId) => {
    const response = await apiClient.post('/favorites', { song_id: songId });
    return response.data;
  },

  getFavorites: async () => {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  removeFavorite: async (songId) => {
    const response = await apiClient.delete(`/favorites/${songId}`);
    return response.data;
  },

  recordPlay: async (playData) => {
    const response = await apiClient.post('/auth/play', playData);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await apiClient.get('/history', { params });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const payload = { currentPassword, newPassword };
    const response = await apiClient.post('/users/change-password', payload);
    return response.data;
  },
};

// ============================================
// PLAYLISTS API (User Service)
// ============================================
export const playlistsAPI = {
  // Obtener todas las playlists del usuario
  getAll: async () => {
    const response = await apiClient.get('/playlists');
    return response.data;
  },

  // Crear nueva playlist
  create: async (playlistData) => {
    const response = await apiClient.post('/playlists', playlistData);
    return response.data;
  },

  // Obtener canciones de una playlist
  getSongs: async (playlistId) => {
    const response = await apiClient.get(`/playlists/${playlistId}/songs`);
    return response.data;
  },

  // Agregar canción a playlist
  addSong: async (playlistId, songId) => {
    if (playlistId === 'favorites') {
      const response = await apiClient.post(`/favorites`, { song_id: songId });
      return response.data;
    }
    
    const response = await apiClient.post(`/playlists/${playlistId}/songs`, { song_id: songId });
    return response.data;
  },

  // Remover canción de playlist
  removeSong: async (playlistId, songId) => {
    const response = await apiClient.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Eliminar playlist
  delete: async (playlistId) => {
    const response = await apiClient.delete(`/playlists/${playlistId}`);
    return response.data;
  },

  // Actualizar playlist
  update: async (playlistId, playlistData) => {
    const response = await apiClient.put(`/playlists/${playlistId}`, playlistData);
    return response.data;
  },
};

// ============================================
// SEARCH API (Catalog Service)
// ============================================
export const searchAPI = {
  searchAll: async (query) => {
    const response = await apiClient.get('/search', { params: { q: query } });
    return response.data;
  },

  searchSongs: async (query) => {
    const response = await apiClient.get('/songs/search', { params: { q: query } });
    return response.data;
  },

  searchArtists: async (query) => {
    const response = await apiClient.get('/artists', { params: { q: query } });
    return response.data;
  },

  searchAlbums: async (query) => {
    const response = await apiClient.get('/albums', { params: { q: query } });
    return response.data;
  },
};

// ============================================
// ANALYTICS API (Analytics Service)
// ============================================
export const analyticsAPI = {
  trackPlay: async (data) => {
    const response = await apiClient.post('/plays', data);
    return response.data;
  },

  getTrending: async () => {
    const response = await apiClient.get('/trending');
    return response.data;
  },

  getUserHistory: async (userId) => {
    const response = await apiClient.get(`/analytics/users/${userId}/history`);
    return response.data;
  },
};

// Exportar instancia por defecto
export default apiClient;