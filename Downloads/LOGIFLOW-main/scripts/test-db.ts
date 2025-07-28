import { testConnection } from '../src/lib/db';

const testDatabaseConnection = async () => {
  console.log('🔍 Testing PostgreSQL database connection...');
  
  try {
    const result = await testConnection();
    
    if (result.success) {
      console.log('✅ Database connection successful!');
      console.log(`📅 Server timestamp: ${result.timestamp}`);
      console.log('🚀 Your LOGIFLOW application is ready to connect to PostgreSQL!');
    } else {
      console.error('❌ Database connection failed!');
      console.error('Error details:', result.error);
      
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure PostgreSQL is running on your system');
      console.log('2. Check your environment variables:');
      console.log('   - DATABASE_URL or individual DB_* variables');
      console.log('3. Verify database credentials');
      console.log('4. Ensure the database exists');
    }
  } catch (error) {
    console.error('💥 Unexpected error during connection test:', error);
  }
};

// Run test if this script is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export default testDatabaseConnection;
