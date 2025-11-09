// src/services/api.js
import axios from 'axios';

// ============================================
// 🔥 Configuración de URLs según el entorno
// ============================================
const API_URLS = {
  user: process.env.REACT_APP_USER_API || 'http://localhost:3002',
  catalog: process.env.REACT_APP_CATALOG_API || 'http://localhost:3001',
  analytics: process.env.REACT_APP_ANALYTICS_API || 'http://localhost:3003'
};

console.log('🌐 APIs Configuradas:', API_URLS);

// Crear instancia de axios para User Service
const userAPI = axios.create({
  baseURL: `${API_URLS.user}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Crear instancia de axios para Catalog Service
const catalogAPI = axios.create({
  baseURL: `${API_URLS.catalog}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Crear instancia de axios para Analytics Service
const analyticsAxios = axios.create({
  baseURL: `${API_URLS.analytics}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Interceptor para agregar token a TODAS las peticiones
// ============================================
[userAPI, catalogAPI, analyticsAxios].forEach(api => {
  api.interceptors.request.use(
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
});

// ============================================
// SONGS API (usa Catalog Service)
// ============================================
export const songsAPI = {
  getAll: async (params = {}) => {
    const response = await catalogAPI.get('/songs', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await catalogAPI.get(`/songs/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await catalogAPI.get('/songs/search', { params: { q: query } });
    return response.data;
  },

  create: async (songData) => {
    const response = await catalogAPI.post('/songs', songData);
    return response.data;
  },

  update: async (id, songData) => {
    const response = await catalogAPI.put(`/songs/${id}`, songData);
    return response.data;
  },

  delete: async (id) => {
    const response = await catalogAPI.delete(`/songs/${id}`);
    return response.data;
  },
};

// ============================================
// USERS API (usa User Service)
// ============================================
export const usersAPI = {
  register: async (userData) => {
    const response = await userAPI.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await userAPI.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await userAPI.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await userAPI.put('/users/profile', userData);
    return response.data;
  },

  addFavorite: async (songId) => {
    const response = await userAPI.post('/users/favorites', { song_id: songId });
    return response.data;
  },

  getFavorites: async () => {
    const response = await userAPI.get('/users/favorites');
    return response.data;
  },

  removeFavorite: async (songId) => {
    const response = await userAPI.delete(`/users/favorites/${songId}`);
    return response.data;
  },

  recordPlay: async (playData) => {
    const response = await userAPI.post('/users/play', playData);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await userAPI.get('/users/history', { params });
    return response.data;
  },
};

// ============================================
// PLAYLISTS API (usa User Service)
// ============================================
export const playlistsAPI = {
  getAll: async () => {
    const response = await userAPI.get('/playlists');
    return response.data;
  },

  create: async (playlistData) => {
    const response = await userAPI.post('/playlists', playlistData);
    return response.data;
  },

  getSongs: async (playlistId) => {
    const response = await userAPI.get(`/playlists/${playlistId}`);
    return response.data;
  },

  addSong: async (playlistId, songId) => {
    const response = await userAPI.post(`/playlists/${playlistId}/songs`, { song_id: songId });
    return response.data;
  },

  removeSong: async (playlistId, songId) => {
    const response = await userAPI.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  delete: async (playlistId) => {
    const response = await userAPI.delete(`/playlists/${playlistId}`);
    return response.data;
  },
};

// ============================================
// SEARCH API (usa Catalog Service)
// ============================================
export const searchAPI = {
  searchAll: async (query) => {
    const response = await catalogAPI.get('/search', { params: { q: query } });
    return response.data;
  },

  searchSongs: async (query) => {
    const response = await catalogAPI.get('/search/songs', { params: { q: query } });
    return response.data;
  },

  searchArtists: async (query) => {
    const response = await catalogAPI.get('/search/artists', { params: { q: query } });
    return response.data;
  },

  searchAlbums: async (query) => {
    const response = await catalogAPI.get('/search/albums', { params: { q: query } });
    return response.data;
  },
};

// ============================================
// ANALYTICS API (usa Analytics Service)
// ============================================
export const analyticsAPI = {
  trackPlay: async (data) => {
    const response = await analyticsAxios.post('/plays', data);
    return response.data;
  },

  getTrending: async () => {
    const response = await analyticsAxios.get('/trending');
    return response.data;
  },

  getUserHistory: async (userId) => {
    const response = await analyticsAxios.get(`/users/${userId}/history`);
    return response.data;
  },
};

// Exportar instancia por defecto (para uso directo)
export default userAPI;