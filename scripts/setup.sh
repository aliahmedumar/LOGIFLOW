#!/bin/bash

echo "🚀 LOGIFLOW Setup Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found!"
    echo "📝 Please create .env.local file with your database credentials:"
    echo ""
    echo "DATABASE_URL=postgresql://postgres:your_password@localhost:5432/logiflow_db"
    echo "DB_HOST=localhost"
    echo "DB_PORT=5432"
    echo "DB_NAME=logiflow_db"
    echo "DB_USER=postgres"
    echo "DB_PASSWORD=your_password"
    echo "NEXTAUTH_SECRET=your-secret-key"
    echo "NEXTAUTH_URL=http://localhost:9002"
    echo ""
    echo "After creating .env.local, run: npm run db:test"
else
    echo "✅ .env.local file found"
    
    # Test database connection
    echo "🔍 Testing database connection..."
    npm run db:test
    
    if [ $? -eq 0 ]; then
        echo "✅ Database connection successful!"
        
        # Initialize database
        echo "🗄️  Initializing database tables..."
        npm run db:init
        
        if [ $? -eq 0 ]; then
            echo "✅ Database initialization complete!"
            echo ""
            echo "🎉 Setup complete! You can now run: npm run dev"
        else
            echo "❌ Database initialization failed"
        fi
    else
        echo "❌ Database connection failed"
        echo "Please check your PostgreSQL installation and credentials"
    fi
fi

echo ""
echo "📚 For more information, see SETUP_GUIDE.md" 