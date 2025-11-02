import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  updateProfile,
  createPlaylist,
  getPlaylists 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected routes
router.get('/users/profile', authenticateToken, getProfile);
router.put('/users/profile', authenticateToken, updateProfile);
router.post('/playlists', authenticateToken, createPlaylist);
router.get('/playlists', authenticateToken, getPlaylists);

export default router;