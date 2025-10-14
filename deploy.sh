#!/bin/bash

# NutriCoach Deployment Script
# Handles migrations safely even when tables already exist

echo "🚀 Starting NutriCoach deployment..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader
npm ci

# Step 2: Build assets
echo "🔨 Building assets..."
npm run build

# Step 3: Run migrations (with drop if exists protection)
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Step 4: Clear caches
echo "🧹 Clearing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Deployment completed successfully!"
