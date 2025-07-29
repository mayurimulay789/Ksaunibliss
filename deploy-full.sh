#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting KsauniBliss Full Stack Deployment${NC}"

# Set variables
PROJECT_DIR="/var/www/ksaunibliss"
BACKUP_DIR="/var/backups/ksaunibliss"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo -e "${YELLOW}📦 Creating backup...${NC}"
sudo mkdir -p $BACKUP_DIR
sudo tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $PROJECT_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Backend Deployment
echo -e "${BLUE}🔧 Deploying Backend...${NC}"
cd $PROJECT_DIR/server

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
npm install --production

# Copy production environment file
cp .env.production .env

# Create necessary directories
mkdir -p uploads logs

# Restart backend with PM2
echo -e "${YELLOW}🔄 Restarting backend...${NC}"
pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

# Frontend Deployment
echo -e "${BLUE}🎨 Deploying Frontend...${NC}"
cd $PROJECT_DIR/frontend

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install

# Copy production environment file
cp .env.production .env

# Build frontend for production
echo -e "${YELLOW}🏗️ Building frontend...${NC}"
npm run build:prod

# Set proper permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod -R 777 $PROJECT_DIR/server/uploads

# Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ Full Stack Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is now running at: https://yourdomain.com${NC}"
echo -e "${GREEN}🔗 API Health Check: https://yourdomain.com/api/health${NC}"

# Show status
echo -e "${BLUE}📊 Application Status:${NC}"
pm2 status
