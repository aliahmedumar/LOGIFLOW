# PostgreSQL Database Setup for LOGIFLOW

This guide will help you set up and connect PostgreSQL database to your LOGIFLOW application.

## Prerequisites

1. **PostgreSQL Server** - Make sure PostgreSQL is installed and running on your system
2. **Node.js** - Version 16 or higher
3. **npm** or **yarn** package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# PostgreSQL Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/logiflow_db

# Alternative: Individual connection parameters
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=logiflow_db
# DB_USER=username
# DB_PASSWORD=password

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:9002

# AI Configuration (if needed)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### 3. Create PostgreSQL Database

Connect to PostgreSQL and create the database:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE logiflow_db;

-- Create user (optional)
CREATE USER logiflow_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE logiflow_db TO logiflow_user;

-- Connect to the new database
\c logiflow_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO logiflow_user;
```

### 4. Test Database Connection

```bash
npm run db:test
```

This will test the connection and show you if everything is working correctly.

### 5. Initialize Database Tables

```bash
npm run db:init
```

This will create all the necessary tables for the LOGIFLOW application.

## Database Schema

The application creates the following tables:

- **users** - User authentication and profiles
- **air_export_jobs** - Air export shipment data
- **sea_export_jobs** - Sea export shipment data
- **invoices** - Financial invoice records
- **tracking** - Shipment tracking information
- **contracts** - Client contract management
- **chart_of_accounts** - General ledger accounts

## Available Scripts

- `npm run db:test` - Test database connection
- `npm run db:init` - Initialize database tables
- `npm run db:reset` - Reset database (recreate tables)

## Troubleshooting

### Connection Issues

1. **"Connection refused"**
   - Ensure PostgreSQL is running
   - Check if the port (default: 5432) is correct
   - Verify firewall settings

2. **"Authentication failed"**
   - Check username and password
   - Verify user has proper permissions
   - Ensure pg_hba.conf allows your connection method

3. **"Database does not exist"**
   - Create the database first
   - Check database name in connection string

### Common Commands

```bash
# Start PostgreSQL service (Windows)
net start postgresql

# Start PostgreSQL service (macOS/Linux)
sudo service postgresql start
# or
brew services start postgresql

# Connect to PostgreSQL
psql -U username -d database_name

# List databases
\l

# List tables
\dt

# Exit PostgreSQL
\q
```

## Production Deployment

For production deployment:

1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. Set `NODE_ENV=production` in your environment
3. Use SSL connections
4. Implement connection pooling
5. Set up proper backup strategies

## Security Best Practices

1. Use strong passwords
2. Limit database user permissions
3. Enable SSL in production
4. Regularly update PostgreSQL
5. Monitor database access logs
6. Use environment variables for sensitive data

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify your environment variables
3. Test the connection manually with `psql`
4. Check PostgreSQL logs for detailed error information

## Next Steps

After successful database setup:

1. Start the development server: `npm run dev`
2. Access the application at: `http://localhost:9002`
3. Create your first user account
4. Begin using the LOGIFLOW features 