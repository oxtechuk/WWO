#!/bin/bash
set -e

echo "🚀 Starting Production Deployment for Wox-Lv..."

# 1. Enable maintenance mode
php artisan down --retry=60 || true

# 2. Pull latest code (if using Git repository)
if [ -d ".git" ]; then
    echo "📦 Pulling latest changes from repository..."
    git pull origin main
fi

# 3. Install production PHP dependencies
echo "📦 Installing production composer dependencies..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 4. Run database migrations safely
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 5. Clear old caches & optimize Laravel caches
echo "⚡ Optimizing application caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 6. Ensure storage directory link
php artisan storage:link || true

# 7. Restart Queue Workers & Reverb
echo "🔄 Restarting Queue Workers..."
php artisan queue:restart

# If running supervisor, restart workers:
if command -v supervisorctl &> /dev/null; then
    echo "🔄 Reloading Supervisor workers..."
    sudo supervisorctl restart wox-queue:* || true
    sudo supervisorctl restart wox-reverb:* || true
fi

# 8. Disable maintenance mode
php artisan up

echo "✅ Deployment finished successfully! Wox-Lv is live and ready."

