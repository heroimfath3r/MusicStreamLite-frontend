// src/services/api.js
import axios from 'axios';

// ============================================
// 🔥 GATEWAY CENTRALIZADO EN GCP
// ============================================
const GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'https://musicstream-gateway-7h7kd74n.uc.gateway.dev';

console.log('🌐 API Gateway:', GATEWAY_URL);

// Crear instancia única de axios para el Gateway
const apiClient = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Interceptor para agregar token a TODAS las peticiones
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
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
    const response = await apiClient.get('/api/songs', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/songs/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/api/songs/search', { params: { q: query } });
    return response.data;
  },

  create: async (songData) => {
    const response = await apiClient.post('/api/songs', songData);
    return response.data;
  },

  update: async (id, songData) => {
    const response = await apiClient.put(`/api/songs/${id}`, songData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/songs/${id}`);
    return response.data;
  },
};

// ============================================
// ALBUMS API (Catalog Service)
// ============================================
export const albumsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/albums', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/albums/${id}`);
    return response.data;
  },

  getByArtist: async (artistId) => {
    const response = await apiClient.get(`/api/albums/artist/${artistId}`);
    return response.data;
  },

  getSongs: async (albumId) => {
    const response = await apiClient.get(`/api/albums/${albumId}/songs`);
    return response.data;
  },

  create: async (albumData) => {
    const response = await apiClient.post('/api/albums', albumData);
    return response.data;
  },

  update: async (id, albumData) => {
    const response = await apiClient.put(`/api/albums/${id}`, albumData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/albums/${id}`);
    return response.data;
  },
};

// ============================================
// ARTISTS API (Catalog Service)
// ============================================
export const artistsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/api/artists', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/artists/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/api/artists', { params: { q: query } });
    return response.data;
  },

  create: async (artistData) => {
    const response = await apiClient.post('/api/artists', artistData);
    return response.data;
  },

  update: async (id, artistData) => {
    const response = await apiClient.put(`/api/artists/${id}`, artistData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/api/artists/${id}`);
    return response.data;
  },
};

// ============================================
// USERS API (User Service)
// ============================================
export const usersAPI = {
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/api/users/profile', userData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const payload = { currentPassword, newPassword };
    const response = await apiClient.post('/api/users/change-password', payload);
    return response.data;
  },

  addFavorite: async (songId) => {
    const response = await apiClient.post('/api/favorites', { song_id: songId });
    return response.data;
  },

  getFavorites: async () => {
    const response = await apiClient.get('/api/favorites');
    return response.data;
  },

  removeFavorite: async (songId) => {
    const response = await apiClient.delete(`/api/favorites/${songId}`);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await apiClient.get('/api/users/history', { params });
    return response.data;
  },

  recordPlay: async (data) => {
    const response = await apiClient.post('/api/plays', data);
    return response.data;
  },
};

// ============================================
// PLAYLISTS API (User Service)
// ============================================
export const playlistsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/playlists');
    return response.data;
  },

  create: async (playlistData) => {
    const response = await apiClient.post('/api/playlists', playlistData);
    return response.data;
  },

  getSongs: async (playlistId) => {
    const response = await apiClient.get(`/api/playlists/${playlistId}/songs`);
    return response.data;
  },

  addSong: async (playlistId, songId) => {
    if (playlistId === 'favorites') {
      const response = await apiClient.post(`/api/favorites`, { song_id: songId });
      return response.data;
    }
    
    const response = await apiClient.post(`/api/playlists/${playlistId}/songs`, { song_id: songId });
    return response.data;
  },

  removeSong: async (playlistId, songId) => {
    const response = await apiClient.delete(`/api/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  delete: async (playlistId) => {
    const response = await apiClient.delete(`/api/playlists/${playlistId}`);
    return response.data;
  },

  update: async (playlistId, playlistData) => {
    const response = await apiClient.put(`/api/playlists/${playlistId}`, playlistData);
    return response.data;
  },
};

// ============================================
// SEARCH API (Catalog Service)
// ============================================
export const searchAPI = {
  searchAll: async (query) => {
    const response = await apiClient.get('/api/search', { params: { q: query } });
    return response.data;
  },

  searchSongs: async (query) => {
    const response = await apiClient.get('/api/songs/search', { params: { q: query } });
    return response.data;
  },

  searchArtists: async (query) => {
    const response = await apiClient.get('/api/artists', { params: { q: query } });
    return response.data;
  },

  searchAlbums: async (query) => {
    const response = await apiClient.get('/api/albums', { params: { q: query } });
    return response.data;
  },
};

// ============================================
// ANALYTICS API (Analytics Service)
// ============================================
export const analyticsAPI = {
  trackPlay: async (data) => {
    const response = await apiClient.post('/api/plays', data);
    return response.data;
  },

  getTrending: async (params = {}) => {
    const response = await apiClient.get('/api/trending', { params });
    return response.data;
  },

  getUserHistory: async (userId, params = {}) => {
    const response = await apiClient.get(`/api/users/${userId}/history`, { params });
    return response.data;
  },

  recordEngagement: async (data) => {
    const response = await apiClient.post('/api/engagement', data);
    return response.data;
  },

  getRecommendations: async (userId, params = {}) => {
    const response = await apiClient.get(`/api/recommendations/${userId}`, { params });
    return response.data;
  },

  getSongAnalytics: async (songId, params = {}) => {
    const response = await apiClient.get(`/api/songs/${songId}/analytics`, { params });
    return response.data;
  },
};

// Exportar instancia por defecto
export default apiClient;