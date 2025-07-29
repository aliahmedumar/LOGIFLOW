# LOGIFLOW Setup Guide

This guide will help you set up LOGIFLOW with PostgreSQL database connection.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Git** (to clone the repository)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd LOGIFLOW-main

# Install dependencies
npm install
```

## Step 2: PostgreSQL Setup

### Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (enter your password when prompted)
CREATE DATABASE logiflow_db;

# Exit PostgreSQL
\q
```

## Step 3: Environment Configuration

### Create .env.local file
Create a `.env.local` file in the project root with:

```env
# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/logiflow_db

# Alternative: Individual connection parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logiflow_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:9002

# AI Configuration (if needed)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

**Replace `your_password` with your actual PostgreSQL password**

## Step 4: Test Database Connection

```bash
# Test the connection
npm run db:test
```

You should see: `✅ Database connection successful!`

## Step 5: Initialize Database Tables

```bash
# Create all necessary tables
npm run db:init
```

You should see: `✅ Database initialization completed successfully!`

## Step 6: Start Development Server

```bash
# Start the application
npm run dev
```

Access the application at: http://localhost:9002

## Troubleshooting

### Connection Issues
1. **PostgreSQL not running**: Start the service
2. **Wrong password**: Check your PostgreSQL password
3. **Database doesn't exist**: Create it with `CREATE DATABASE logiflow_db;`
4. **Port issues**: Ensure PostgreSQL is running on port 5432

### Common Commands
```bash
# Check if PostgreSQL is running
net start | findstr postgres  # Windows
sudo service postgresql status  # Linux/macOS

# Connect to PostgreSQL
psql -U postgres -d logiflow_db

# List databases
\l

# List tables
\dt
```

## Database Schema

The application creates these tables:
- `users` - User authentication
- `air_export_jobs` - Air export shipments
- `sea_export_jobs` - Sea export shipments
- `invoices` - Financial records
- `tracking` - Shipment tracking
- `contracts` - Client contracts
- `chart_of_accounts` - General ledger

## Available Scripts

- `npm run dev` - Start development server
- `npm run db:test` - Test database connection
- `npm run db:init` - Initialize database tables
- `npm run build` - Build for production

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for production
- Enable SSL in production environments
- Regularly backup your database

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your environment variables
3. Test PostgreSQL connection manually
4. Check PostgreSQL logs for detailed errors 