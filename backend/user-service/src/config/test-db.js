import { pool, checkDatabaseHealth } from './database.js';

const testDatabase = async () => {
  console.log('🧪 Testing database connection...');
  
  try {
    // Test connection
    const health = await checkDatabaseHealth();
    console.log('✅ Database health:', health);

    // Test basic queries
    const client = await pool.connect();
    
    // Count users
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Total users: ${usersResult.rows[0].count}`);

    // Count playlists
    const playlistsResult = await client.query('SELECT COUNT(*) FROM playlists');
    console.log(`🎵 Total playlists: ${playlistsResult.rows[0].count}`);

    // List tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Available tables:', tablesResult.rows.map(row => row.table_name));

    client.release();
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
};

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase();
}

export default testDatabase;