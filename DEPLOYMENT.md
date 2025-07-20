# Self-Hosting Deployment Guide

This guide will help you deploy the Somali Learning PWA on your own server. The app consists of a React frontend, FastAPI backend, and MongoDB database.

## Prerequisites

- **Server**: Linux server (Ubuntu 20.04+ recommended) with root access
- **Domain**: A domain name pointed to your server
- **Resources**: Minimum 2GB RAM, 10GB storage
- **Google Cloud Account**: For Text-to-Speech API access

## Required Software

Install these on your server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect

# Install Node.js (for building frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.9+ and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y
```

## Step 1: Clone and Setup the Application

```bash
# Clone the repository
git clone https://github.com/yourusername/somali-learning-pwa.git
cd somali-learning-pwa

# Create directories for data persistence
sudo mkdir -p /opt/somali-app/mongodb-data
sudo mkdir -p /opt/somali-app/logs
sudo chown -R $USER:$USER /opt/somali-app
```

## Step 2: Get Google Text-to-Speech API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Text-to-Speech API**
4. Go to **Credentials** → **Create API Key**
5. Restrict the API key to Text-to-Speech API only
6. Save the API key securely

## Step 3: Configure Environment Variables

### Backend Configuration
```bash
# Create backend environment file
cat > backend/.env << 'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="somali_learning_pwa"
GOOGLE_TTS_API_KEY="your-google-tts-api-key-here"
EOF

# Replace with your actual API key
sed -i 's/your-google-tts-api-key-here/YOUR_ACTUAL_API_KEY/' backend/.env
```

### Frontend Configuration
```bash
# Create frontend environment file
cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF

# Replace with your actual domain
sed -i 's/yourdomain.com/your-actual-domain.com/' frontend/.env
```

## Step 4: Docker Deployment (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: somali-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - /opt/somali-app/mongodb-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=somali_learning_pwa

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: somali-backend
    restart: unless-stopped
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=somali_learning_pwa
      - GOOGLE_TTS_API_KEY=${GOOGLE_TTS_API_KEY}
    volumes:
      - ./backend:/app
      - /opt/somali-app/logs:/app/logs

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    container_name: somali-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_BACKEND_URL=https://yourdomain.com

networks:
  default:
    name: somali-network
```

### Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx config for frontend** (`frontend/nginx.conf`):
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Enable gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;
    }
}
```

## Step 5: Deploy with Docker

```bash
# Set your Google API key as environment variable
export GOOGLE_TTS_API_KEY="your-actual-api-key"

# Build and start services
docker-compose up -d --build

# Check if services are running
docker-compose ps

# View logs if needed
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Step 6: Configure Reverse Proxy

### Option A: Nginx (Manual Configuration)

Create `/etc/nginx/sites-available/somali-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL configuration (you'll need to obtain certificates)
    ssl_certificate /path/to/your/certificate.pem;
    ssl_certificate_key /path/to/your/private-key.pem;

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/somali-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Using Nginx Proxy Manager (Like your setup)

In your Nginx Proxy Manager web interface:

1. **Add Proxy Host**:
   - Domain: `yourdomain.com`
   - Forward Hostname: `localhost` (or your server IP)
   - Forward Port: `3000`
   - Enable "Cache Assets"
   - Enable "Block Common Exploits"

2. **Add API Proxy Host**:
   - Domain: `api.yourdomain.com` (subdomain for API)
   - Forward Hostname: `localhost`
   - Forward Port: `8001`
   - Add Custom Location: `/api/` → Forward to `http://localhost:8001/api/`

## Step 7: SSL Certificate (Let's Encrypt)

If using manual Nginx:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is usually set up automatically
sudo certbot renew --dry-run
```

If using Nginx Proxy Manager, SSL certificates can be obtained through the web interface.

## Step 8: Initialize the Database

```bash
# Seed the database with vocabulary
curl -X POST "https://yourdomain.com/api/somali/words/seed"

# Check if data was loaded
curl "https://yourdomain.com/api/somali/words" | jq length
```

## Step 9: Monitoring and Maintenance

### Check Application Health
```bash
# Check Docker containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Check disk usage
df -h
du -sh /opt/somali-app/
```

### Backup Database
```bash
# Create backup script
cat > /opt/somali-app/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec somali-mongodb mongodump --db somali_learning_pwa --out /data/backup_$DATE
EOF

chmod +x /opt/somali-app/backup.sh

# Run backup
/opt/somali-app/backup.sh

# Add to crontab for automatic backups
echo "0 2 * * * /opt/somali-app/backup.sh" | sudo crontab -
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Clear browser cache for users
# Consider versioning your static assets
```

## Step 10: Security Considerations

1. **Firewall Setup**:
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **Environment Security**:
- Keep your `.env` files out of version control
- Use strong passwords for any admin interfaces
- Regularly update Docker images
- Monitor logs for suspicious activity

3. **API Key Security**:
- Rotate your Google TTS API key periodically
- Monitor API usage in Google Cloud Console
- Set up billing alerts

## Troubleshooting

### Common Issues

1. **Can't connect to MongoDB**:
```bash
docker-compose logs mongodb
# Check if port 27017 is available
sudo netstat -tlnp | grep :27017
```

2. **Frontend won't load**:
```bash
# Check if React app built successfully
docker-compose logs frontend
# Verify nginx configuration
docker exec somali-frontend nginx -t
```

3. **API calls failing**:
```bash
# Test backend directly
curl http://localhost:8001/api/
# Check backend logs
docker-compose logs backend
```

4. **TTS not working**:
- Verify your Google API key is correct
- Check API quotas in Google Cloud Console
- Ensure billing is enabled for your Google Cloud project

### Performance Optimization

1. **Enable caching** in your reverse proxy
2. **Use CDN** for static assets (optional)
3. **Monitor resource usage** with `htop` or similar
4. **Database indexing** is already handled by the application

## Support

If you encounter issues:
1. Check the application logs first
2. Verify all environment variables are set correctly
3. Ensure your domain DNS is pointing to your server
4. Test API endpoints individually

The application should now be accessible at `https://yourdomain.com` with full functionality including real Somali pronunciation via Google Text-to-Speech!