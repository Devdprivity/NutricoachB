# Laravel Cloud Deployment Configuration

## Problem
The `nutritional_data` table already exists in the database, but Laravel is trying to create it again because the migration wasn't properly recorded in the `migrations` table.

## Solution

### Option 1: Use the migration fix (Recommended)
Run this command in Laravel Cloud's deploy commands:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --path=database/migrations/2025_10_14_162354_mark_existing_migrations_as_run.php
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Option 2: Manual database fix (If Option 1 doesn't work)
If the migration approach doesn't work, you can manually insert the migration records:

```sql
INSERT INTO migrations (migration, batch) VALUES 
('2025_10_11_144100_create_food_items_table', 1),
('2025_10_11_144119_create_nutritional_data_table', 1),
('2025_10_11_144137_create_user_profiles_table', 1),
('2025_10_11_144936_create_hydration_records_table', 1),
('2025_10_11_144944_create_coaching_messages_table', 1),
('2025_10_11_145005_create_user_alerts_table', 1),
('2025_10_11_145704_create_user_contexts_table', 1),
('2025_10_11_145711_create_meal_plans_table', 1),
('2025_10_11_145751_create_medical_disclaimers_table', 1);
```

### Option 3: Fresh start (Nuclear option)
If you want to start completely fresh:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate:fresh --seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Recommended Approach
Use **Option 1** as it's the safest and most Laravel-friendly approach. The migration will mark existing tables as already migrated without trying to recreate them.
