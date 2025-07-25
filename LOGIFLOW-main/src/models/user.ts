// src/models/user.ts
import { query } from '@/lib/db';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Creates the users table if it doesn't exist
 */
export async function createUsersTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create an index on the email field for faster lookups
    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
  `;
  
  await query(createTableQuery);
}

/**
 * Creates a new user
 * @param email User's email
 * @param name User's name
 * @returns The created user
 */
export async function createUser(email: string, name: string): Promise<User> {
  const result = await query(
    'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
    [email, name]
  );
  return result.rows[0] as User;
}

/**
 * Finds a user by email
 * @param email Email to search for
 * @returns The user if found, null otherwise
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return (result.rows[0] as User) || null;
}

/**
 * Finds a user by ID
 * @param id User ID to search for
 * @returns The user if found, null otherwise
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return (result.rows[0] as User) || null;
}

/**
 * Updates a user's information
 * @param id User ID
 * @param updates Object containing fields to update
 * @returns The updated user
 */
export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'email'>>
): Promise<User> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Build the SET part of the query dynamically based on provided fields
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields provided for update');
  }

  // Add the updated_at timestamp
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  // Add the id for the WHERE clause
  values.push(id);
  
  const queryText = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await query(queryText, values);
  
  if (result.rows.length === 0) {
    throw new Error(`User with id ${id} not found`);
  }
  
  return result.rows[0] as User;
}

/**
 * Deletes a user by ID
 * @param id User ID to delete
 * @returns true if the user was deleted, false otherwise
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM users WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
