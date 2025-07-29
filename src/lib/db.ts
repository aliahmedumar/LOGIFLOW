// src/lib/db.ts
import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database configuration
const getDatabaseConfig = (): PoolConfig => {
  // Check if DATABASE_URL is provided
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }

  // Fallback to individual parameters
  const config: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'logiflow_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };

  // Add SSL configuration for production
  if (process.env.NODE_ENV === 'production') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
};

// Create connection pool
const pool = new Pool(getDatabaseConfig());

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

/**
 * Executes a SQL query against the database.
 * @param text The SQL query string.
 * @param params Optional array of parameters for the query.
 * @returns A promise that resolves with the query result.
 */
export const query = (text: string, params?: any[]) => pool.query(text, params);

/**
 * Gets a client from the pool for transactions.
 * @returns A promise that resolves with a database client.
 */
export const getClient = () => pool.connect();

/**
 * Tests the database connection.
 * @returns A promise that resolves with connection status.
 */
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    return { success: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error };
  }
};

export default pool; 