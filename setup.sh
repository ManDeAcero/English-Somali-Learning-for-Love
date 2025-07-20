#!/bin/bash

set -e

echo "🌍 Somali Learning PWA - Quick Setup Script"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and add your Google TTS API key"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file from template..."
    cp frontend/.env.example frontend/.env
    echo "ℹ️  Frontend environment configured for development"
fi

echo ""
echo "🔑 IMPORTANT: Google TTS API Key Required"
echo "============================================"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a project and enable Cloud Text-to-Speech API"
echo "3. Create an API key and restrict it to Text-to-Speech API"
echo "4. Edit backend/.env and replace 'your-google-tts-api-key-here' with your key"
echo ""

read -p "Have you added your Google TTS API key to backend/.env? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please add your API key to backend/.env before continuing"
    echo "   Then run this script again or use: docker-compose up -d --build"
    exit 1
fi

echo "🚀 Starting the Somali Learning PWA..."
echo "======================================"

# Build and start containers
docker-compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are starting up!"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi

# Seed the database
echo "🌱 Seeding database with Somali vocabulary..."
sleep 5  # Wait a bit more for backend to be ready

# Try to seed database (retry a few times as backend might still be starting)
for i in {1..5}; do
    if curl -s -f -X POST "http://localhost:8001/api/somali/words/seed" > /dev/null 2>&1; then
        echo "✅ Database seeded successfully!"
        break
    else
        if [ $i -eq 5 ]; then
            echo "⚠️  Database seeding failed. You can try manually:"
            echo "   curl -X POST 'http://localhost:8001/api/somali/words/seed'"
        else
            echo "⏳ Waiting for backend to be ready... (attempt $i/5)"
            sleep 3
        fi
    fi
done

echo ""
echo "🎉 Somali Learning PWA is ready!"
echo "================================"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8001"
echo "📚 API Docs: http://localhost:8001/docs"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop app: docker-compose down"
echo "  • Rebuild: docker-compose up -d --build"
echo ""
echo "📖 For production deployment, see DEPLOYMENT.md"
echo ""
echo "Happy learning Somali! 🇸🇴"