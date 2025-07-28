import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL Version:', result.rows[0].version);
    
    // Test users table
    try {
      const users = await client.query('SELECT * FROM users LIMIT 1');
      console.log('Users table exists with', users.rowCount, 'rows');
    } catch (error) {
      console.log('Users table does not exist yet');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
  } finally {
    if (client) client.release();
    await pool.end();
    process.exit(0);
  }
}

testConnection();
