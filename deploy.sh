#!/bin/bash

# -----------------------------
# EduOps Deployment Script
# -----------------------------

# Paths (change if needed)
API_PATH="/root/EduOps/api"          # Path to your API
CLIENT_PATH="/root/EduOps/client"    # Path to your React app
FRONTEND_BUILD_PATH="/var/www/eduops" # Where Nginx serves frontend

# PM2 process name
API_PROCESS_NAME="eduops-api"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

echo "===================================="
echo "   EDUOPS DEPLOYMENT STARTED"
echo "===================================="
echo "Branch: $CURRENT_BRANCH"
echo "Time: $(date)"
echo ""

# 1️⃣ Stop and delete old PM2 process
echo "→ Stopping old PM2 process..."
pm2 stop $API_PROCESS_NAME 2>/dev/null
pm2 delete $API_PROCESS_NAME 2>/dev/null
echo "✓ PM2 process stopped"
echo ""

# 2️⃣ Pull latest updates for API
echo "→ Pulling latest updates for API..."
cd $API_PATH || { echo "✗ API path not found!"; exit 1; }
git pull origin $CURRENT_BRANCH || { echo "✗ Failed to pull API updates!"; exit 1; }
echo "✓ API updates pulled"
echo ""

# 3️⃣ Install API dependencies
echo "→ Installing API dependencies..."
npm install || { echo "✗ Failed to install API dependencies!"; exit 1; }
echo "✓ API dependencies installed"
echo ""

# 4️⃣ Run Prisma migrations (if any)
echo "→ Running Prisma migrations..."
npx prisma migrate deploy 2>/dev/null || echo "⚠ No migrations needed or Prisma not configured"
echo ""

# 5️⃣ Generate Prisma Client
echo "→ Generating Prisma Client..."
npx prisma generate || echo "⚠ Prisma client generation failed or not configured"
echo ""

# 6️⃣ Start new API process
echo "→ Starting new PM2 process..."
pm2 start index.js --name $API_PROCESS_NAME
echo "✓ API started"
echo ""

# 7️⃣ Pull latest updates for Client
echo "→ Pulling latest updates for Client..."
cd $CLIENT_PATH || { echo "✗ Client path not found!"; exit 1; }
git pull origin $CURRENT_BRANCH || { echo "✗ Failed to pull Client updates!"; exit 1; }
echo "✓ Client updates pulled"
echo ""

# 8️⃣ Install Client dependencies
echo "→ Installing Client dependencies..."
npm install --force || { echo "✗ Failed to install Client dependencies!"; exit 1; }
echo "✓ Client dependencies installed"
echo ""

# 9️⃣ Build React frontend
echo "→ Building React frontend..."
npm run build || { echo "✗ Failed to build frontend!"; exit 1; }
echo "✓ Frontend build completed"
echo ""

# 🔟 Copy build to Nginx folder
echo "→ Copying build to Nginx folder..."
sudo rm -rf $FRONTEND_BUILD_PATH/*
sudo cp -r build/* $FRONTEND_BUILD_PATH/
echo "✓ Build copied to Nginx"
echo ""

# 1️⃣1️⃣ Reload Nginx
echo "→ Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

# 1️⃣2️⃣ Save PM2 process list
echo "→ Saving PM2 process list..."
pm2 save
echo "✓ PM2 saved"
echo ""

echo "===================================="
echo "   DEPLOYMENT COMPLETE"
echo "===================================="
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Deployment finished at: $(date)"

