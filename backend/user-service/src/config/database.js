import pkg from 'pg';
const { Pool } = pkg;

// Database connection pool
export const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'musicstream',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  connectionTimeout: 20000,
  allowExitOnIdle: false
});

// Event listeners for the pool
pool.on('connect', () => {
  console.log('🟢 Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('🔴 Database pool error:', err);
});

pool.on('remove', () => {
  console.log('🔵 Client removed from pool');
});

// Initialize database tables
export const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing user database tables...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create playlists table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url VARCHAR(500),
        is_public BOOLEAN DEFAULT false,
        song_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create playlist_songs junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
        song_id INTEGER NOT NULL,
        position INTEGER DEFAULT 0,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(playlist_id, song_id)
      );
    `);

    // Create user_favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        song_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, song_id)
      );
    `);

    // Create user_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        song_id INTEGER NOT NULL,
        played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        play_duration INTEGER DEFAULT 0
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
      CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);
      
      CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_favorites_song_id ON user_favorites(song_id);
      
      CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_history_played_at ON user_history(played_at DESC);
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
      CREATE TRIGGER update_playlists_updated_at
        BEFORE UPDATE ON playlists
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ User database tables initialized successfully');

    // Insert sample admin user for testing (optional)
    try {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.query(`
        INSERT INTO users (email, password, name, avatar_url) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `, ['admin@musicstream.com', hashedPassword, 'Admin User', 'https://via.placeholder.com/150/007AFF/FFFFFF?text=Admin']);

      console.log('👤 Sample admin user created');
    } catch (error) {
      console.log('⚠️  Could not create sample user (bcrypt not available in init)');
    }

  } catch (error) {
    console.error('❌ User database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version
    };
  } catch (error) {
    console.error('🔴 Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('🔵 Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

// Utility functions for common operations
export const databaseUtils = {
  // Execute transaction
  async executeTransaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Pagination helper
  paginate(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return {
      query: `${query} LIMIT $1 OFFSET $2`,
      params: [limit, offset]
    };
  },

  // Build WHERE clause for dynamic filters
  buildWhereClause(filters) {
    const conditions = [];
    const values = [];
    let paramCount = 0;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        paramCount++;
        conditions.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    return {
      where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values
    };
  }
};