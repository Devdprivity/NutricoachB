#!/bin/bash

# NutriCoach Deployment Script for Laravel Cloud
# This script handles the migration issue where tables already exist

echo "🚀 Starting NutriCoach deployment..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader
npm ci

# Step 2: Build assets
echo "🔨 Building assets..."
npm run build

# Step 3: Handle migrations carefully
echo "🗄️ Handling database migrations..."

# First, run the migration that marks existing tables as run
php artisan migrate --path=database/migrations/2025_10_14_162354_mark_existing_migrations_as_run.php

# Then run any remaining migrations
php artisan migrate --force

# Step 4: Seed the database
echo "🌱 Seeding database..."
php artisan db:seed --force

# Step 5: Clear caches
echo "🧹 Clearing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Deployment completed successfully!"
