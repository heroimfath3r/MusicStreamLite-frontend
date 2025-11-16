// src/services/api.js
import axios from 'axios';

// ============================================
// 🔥 Configuración de URLs para CLOUD RUN
// ============================================
const API_URLS = {
  user: process.env.REACT_APP_USER_API || 'https://user-service-586011919703.us-central1.run.app',
  catalog: process.env.REACT_APP_CATALOG_API || 'https://catalog-service-586011919703.us-central1.run.app',
  analytics: process.env.REACT_APP_ANALYTICS_API || 'https://analytics-service-586011919703.us-central1.run.app'
};

console.log('🌐 APIs Configuradas:', API_URLS);

// Crear instancia de axios para User Service
const userAPI = axios.create({
  baseURL: `${API_URLS.user}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ FIXED: Crear instancia de axios para Catalog Service
export const catalogAPI = axios.create({
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
// ALBUMS API (usa Catalog Service)
// ============================================
export const albumsAPI = {
  getAll: async (params = {}) => {
    const response = await catalogAPI.get('/albums', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await catalogAPI.get(`/albums/${id}`);
    return response.data;
  },

  getByArtist: async (artistId) => {
    const response = await catalogAPI.get(`/albums/artist/${artistId}`);
    return response.data;
  },

  create: async (albumData) => {
    const response = await catalogAPI.post('/albums', albumData);
    return response.data;
  },

  update: async (id, albumData) => {
    const response = await catalogAPI.put(`/albums/${id}`, albumData);
    return response.data;
  },

  delete: async (id) => {
    const response = await catalogAPI.delete(`/albums/${id}`);
    return response.data;
  },
};

// ============================================
// ARTISTS API (usa Catalog Service)
// ============================================
export const artistsAPI = {
  getAll: async (params = {}) => {
    const response = await catalogAPI.get('/artists', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await catalogAPI.get(`/artists/${id}`);
    return response.data;
  },

  create: async (artistData) => {
    const response = await catalogAPI.post('/artists', artistData);
    return response.data;
  },

  update: async (id, artistData) => {
    const response = await catalogAPI.put(`/artists/${id}`, artistData);
    return response.data;
  },

  delete: async (id) => {
    const response = await catalogAPI.delete(`/artists/${id}`);
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
    const response = await userAPI.post('/favorites', { song_id: songId });
    return response.data;
  },

  getFavorites: async () => {
    const response = await userAPI.get('/favorites');
    return response.data;
  },

  removeFavorite: async (songId) => {
    const response = await userAPI.delete(`/favorites/${songId}`);
    return response.data;
  },

  recordPlay: async (playData) => {
    const response = await userAPI.post('/auth/play', playData);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await userAPI.get('/history', { params });
    return response.data;
  },
};

// ============================================
// PLAYLISTS API (usa User Service)
// ============================================
export const playlistsAPI = {
  // Obtener todas las playlists del usuario
  getAll: async () => {
    const response = await userAPI.get('/playlists');
    return response.data;
  },

  // Crear nueva playlist
  create: async (playlistData) => {
    const response = await userAPI.post('/playlists', playlistData);
    return response.data;
  },

  // Obtener canciones de una playlist
  getSongs: async (playlistId) => {
    const response = await userAPI.get(`/playlists/${playlistId}/songs`);
    return response.data;
  },

  // Agregar canción a playlist
addSong: async (playlistId, songId) => {
  if (playlistId === 'favorites') {
    const response = await userAPI.post(`/favorites`, { song_id: songId });
    return response.data;
  }
  
  const response = await userAPI.post(`/playlists/${playlistId}/songs`, { song_id: songId });
  return response.data;
},

  // Remover canción de playlist
  removeSong: async (playlistId, songId) => {
    const response = await userAPI.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Eliminar playlist
  delete: async (playlistId) => {
    const response = await userAPI.delete(`/playlists/${playlistId}`);
    return response.data;
  },

  // Actualizar playlist
  update: async (playlistId, playlistData) => {
    const response = await userAPI.put(`/playlists/${playlistId}`, playlistData);
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
    const response = await catalogAPI.get('/songs/search', { params: { q: query } });
    return response.data;
  },

  searchArtists: async (query) => {
    const response = await catalogAPI.get('/artists', { params: { q: query } });
    return response.data;
  },

  searchAlbums: async (query) => {
    const response = await catalogAPI.get('/albums', { params: { q: query } });
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
    const response = await analyticsAxios.get(`/analytics/users/${userId}/history`);
    return response.data;
  },
};

// Exportar instancia por defecto (para uso directo)
export default userAPI;