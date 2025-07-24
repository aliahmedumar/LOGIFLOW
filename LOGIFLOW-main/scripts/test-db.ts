import { query } from '../src/lib/db';
import { createUsersTable } from '../src/models/user';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Create users table
    console.log('Creating users table if not exists...');
    await createUsersTable();
    console.log('✅ Users table ready!');
    
    // Test user creation
    const testEmail = `test-${Date.now()}@example.com`;
    const newUser = await query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [testEmail, 'Test User']
    );
    console.log('✅ Test user created:', newUser.rows[0]);
    
    // Clean up
    await query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testConnection();
