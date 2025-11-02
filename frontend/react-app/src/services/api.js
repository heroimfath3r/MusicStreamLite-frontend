import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('musicstream_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('musicstream_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const catalogAPI = {
  getArtists: () => api.get('/api/artists'),
  getSongs: (params) => api.get('/api/songs', { params }),
  searchSongs: (query) => api.get(`/api/search?q=${query}`),
  getArtistById: (id) => api.get(`/api/artists/${id}`),
  getStreamUrl: (songId) => api.get(`/api/songs/${songId}/stream-url`),
};

export const userAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/users/profile'),
  createPlaylist: (playlistData) => api.post('/api/playlists', playlistData),
};

export default api;