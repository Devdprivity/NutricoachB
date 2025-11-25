# Multi-stage build para Laravel con FrankenPHP
FROM php:8.2-fpm-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    postgresql-dev \
    nodejs \
    npm \
    supervisor \
    nginx

# Instalar extensiones PHP
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos de configuración de Composer y package.json primero (para cache de Docker)
COPY composer.json composer.lock package.json package-lock.json ./

# Instalar dependencias PHP (sin dev para producción)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Instalar dependencias Node
RUN npm ci --only=production

# Copiar el resto de los archivos
COPY . .

# Completar instalación de Composer
RUN composer dump-autoload --optimize --classmap-authoritative

# Construir assets de frontend
RUN npm run build

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Stage de producción
FROM base AS production

# Limpiar archivos innecesarios
RUN rm -rf node_modules \
    && rm -rf tests \
    && rm -rf .git \
    && rm -rf .github

# Configurar PHP-FPM
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php.ini /usr/local/etc/php/php.ini

# Configurar Nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Scripts de inicio
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/start.sh

# Exponer puerto
EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/local/bin/start.sh"]

