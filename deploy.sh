#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting KsauniBliss Backend Deployment${NC}"

# Set variables
PROJECT_DIR="/var/www/ksaunibliss"
BACKUP_DIR="/var/backups/ksaunibliss"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo -e "${YELLOW}📦 Creating backup...${NC}"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $PROJECT_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Navigate to server directory
cd server

# Install/update dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Copy production environment file
echo -e "${YELLOW}⚙️ Setting up production environment...${NC}"
cp .env.production .env

# Create necessary directories
mkdir -p uploads logs

# Set proper permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 777 $PROJECT_DIR/server/uploads

# Restart application with PM2
echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your backend is now running at: http://your-domain.com/api${NC}"
