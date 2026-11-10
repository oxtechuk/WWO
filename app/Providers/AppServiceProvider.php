<?php

namespace App\Providers;

use App\Services\Cache\InstanceCacheService;
use App\Services\Chatbot\DifyService;
use App\Services\Chatbot\FlowiseService;
use App\Services\Chatbot\N8nService;
use App\Services\Chatbot\OpenAiService;
use App\Services\Chatbot\TypebotService;
use App\Services\Instance\InstanceService;
use App\Services\Message\MessageService;
use App\Services\SettingsService;
use App\Services\Webhook\WebhookService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Spatie\Health\Checks\Checks\DatabaseCheck;
use Spatie\Health\Checks\Checks\DebugModeCheck;
use Spatie\Health\Checks\Checks\EnvironmentCheck;
use Spatie\Health\Checks\Checks\UsedDiskSpaceCheck;
use Spatie\Health\Facades\Health;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register application services (DI bindings).
     */
    public function register(): void
    {
        // Cache Service
        $this->app->singleton(InstanceCacheService::class);

        // Instance Service
        $this->app->singleton(InstanceService::class, function ($app) {
            return new InstanceService($app->make(InstanceCacheService::class));
        });

        // Webhook Service
        $this->app->singleton(WebhookService::class);

        // Message Service
        $this->app->singleton(MessageService::class, function ($app) {
            return new MessageService($app->make(WebhookService::class));
        });

        // Campaign Service
        $this->app->singleton(\App\Services\CampaignService::class, function ($app) {
            return new \App\Services\CampaignService($app->make(MessageService::class));
        });

        // Settings Service
        $this->app->singleton(SettingsService::class);

        // Chatbot Services
        $this->app->singleton(TypebotService::class);
        $this->app->singleton(OpenAiService::class);
        $this->app->singleton(DifyService::class);
        $this->app->singleton(N8nService::class);
        $this->app->singleton(FlowiseService::class);
        $this->app->singleton(\App\Services\Chatbot\ChatwootService::class);

        // Channel Services
        $this->app->singleton(\App\Services\Channel\BaileysService::class);
        $this->app->singleton(\App\Services\Channel\BusinessApiService::class);
        $this->app->singleton(\App\Services\Channel\EvolutionService::class);
    }

    /**
     * Bootstrap application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);

        // ── Rate Limiters ──────────────────────────────────────────
        $this->configureRateLimiting();

        // ── Health Checks ──────────────────────────────────────────
        $this->configureHealthChecks();
    }

    private function configureRateLimiting(): void
    {
        $apiLimit = (int) env('API_RATE_LIMIT_PER_MINUTE', 120);

        // API rate limit: configurable per API key / IP
        RateLimiter::for('api', function (Request $request) use ($apiLimit) {
            $key = $request->header('apikey')
                ?? $request->header('Authorization')
                ?? $request->ip();

            return [
                Limit::perMinute($apiLimit)->by("apikey:{$key}"),
                Limit::perMinute($apiLimit * 2)->by("ip:{$request->ip()}"),
            ];
        });

        // Dedicated Rate Limiter for WordPress / WooCommerce Integrations
        RateLimiter::for('wordpress', function (Request $request) {
            $key = $request->header('apikey')
                ?? $request->header('Authorization')
                ?? $request->ip();

            $limit = (int) env('WP_RATE_LIMIT_PER_MINUTE', 300);

            return [
                Limit::perMinute($limit)->by("wp:{$key}"),
                Limit::perMinute($limit * 2)->by("ip:{$request->ip()}"),
            ];
        });

        // Webhook rate limit: stricter for inbound webhooks
        RateLimiter::for('webhook', function (Request $request) {
            return Limit::perSecond(10)->by($request->ip());
        });
    }

    private function configureHealthChecks(): void
    {
        Health::checks([
            DatabaseCheck::new(),
            DebugModeCheck::new(),
            EnvironmentCheck::new()->expectEnvironment('production'),
            UsedDiskSpaceCheck::new()
                ->warnWhenUsedSpaceIsAbovePercentage(
                    (int) env('HEALTH_DISK_WARN_PERCENTAGE', 70)
                )
                ->failWhenUsedSpaceIsAbovePercentage(
                    (int) env('HEALTH_DISK_FAIL_PERCENTAGE', 90)
                ),
        ]);
    }
}
