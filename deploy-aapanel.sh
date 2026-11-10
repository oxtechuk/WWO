#!/bin/bash
set -e

# =====================================================================
# Wox-Lv Deployment Script for Ubuntu + aaPanel
# =====================================================================

PHP_BIN="/www/server/php/84/bin/php"
COMPOSER_BIN="/usr/bin/composer"

if [ ! -f "$PHP_BIN" ]; then
    echo "⚠️ aaPanel PHP 8.4 not found at $PHP_BIN, falling back to system php..."
    PHP_BIN="php"
fi

echo "🚀 Starting aaPanel Deployment for Wox-Lv..."

# 1. Enable maintenance mode
$PHP_BIN artisan down --retry=60 || true

# 2. Pull updates from git (if using git)
if [ -d ".git" ]; then
    echo "📦 Pulling latest changes from git..."
    git pull origin main
fi

# 3. Install production dependencies
echo "📦 Installing composer packages..."
$PHP_BIN $(which composer) install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 4. Migrate database
echo "🗄️ Running migrations..."
$PHP_BIN artisan migrate --force

# 5. Clear and recreate production caches
echo "⚡ Caching config, routes, and views..."
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache
$PHP_BIN artisan event:cache

# 6. Ensure storage permissions in aaPanel (user www)
echo "🔒 Fixing file permissions..."
chown -R www:www storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
$PHP_BIN artisan storage:link || true

# 7. Restart queues
echo "🔄 Restarting queue workers..."
$PHP_BIN artisan queue:restart

# 8. Disable maintenance mode
$PHP_BIN artisan up

echo "✅ Deployment on aaPanel completed successfully!"

