import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/users.js';
import { initDB, checkDatabaseHealth, closeDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({
      status: 'OK',
      service: 'user-service',
      database: dbHealth.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      service: 'user-service',
      error: error.message
    });
  }
});

// Database info endpoint (for debugging)
app.get('/api/database/info', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json(dbHealth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await initDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`👤 User Service running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database info: http://localhost:${PORT}/api/database/info`);
    });
  } catch (error) {
    console.error('❌ Failed to start user service:', error);
    process.exit(1);
  }
};

startServer();