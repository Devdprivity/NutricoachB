# Laravel Cloud Configuration Guide

## Environment Variables Required

### Basic App Configuration
```
APP_NAME=NutriCoach
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.laravelcloud.com
```

### Database Configuration
```
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=nuticoach
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

### Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.laravelcloud.com/auth/google/callback
```

### Sanctum Configuration
```
SANCTUM_STATEFUL_DOMAINS=your-app.laravelcloud.com
```

## Build Configuration

The project is configured to build successfully with:
- Vite 7.1.5
- React 18.x
- TypeScript 5.x
- Laravel 11.x

## Deployment Steps

1. Set environment variables in Laravel Cloud dashboard
2. Configure Google OAuth credentials
3. Set up database connection
4. Deploy the application

## Build Commands

The following commands are used for building:
- `composer install --no-dev --optimize-autoloader`
- `npm ci`
- `npm run build`
- `php artisan migrate --force`
- `php artisan db:seed --force`
