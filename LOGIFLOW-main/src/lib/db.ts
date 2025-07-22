// src/lib/db.ts
import { Pool } from 'pg';

// Ensure the DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Executes a SQL query against the database.
 * @param text The SQL query string.
 * @param params Optional array of parameters for the query.
 * @returns A promise that resolves with the query result.
 */
export const query = (text: string, params?: any[]) => pool.query(text, params); 