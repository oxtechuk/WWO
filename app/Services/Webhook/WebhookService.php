<?php

namespace App\Services\Webhook;

use App\Models\Instance;
use App\Models\Webhook;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Webhook Service — delivers events to configured webhook URLs.
 * Mirrors Wox-Ox webhook delivery logic with exponential backoff.
 */
class WebhookService
{
    /**
     * Dispatch a webhook event (queued for reliability).
     */
    public function dispatch(Instance $instance, string $event, array $data): void
    {
        $webhook = $instance->webhook;

        if (!$webhook || !$webhook->enabled) {
            return;
        }

        // Check if event is enabled
        $events = $webhook->events ?? [];
        if (!empty($events) && !in_array($event, $events)) {
            return;
        }

        // Queue the webhook delivery
        \App\Jobs\SendWebhookJob::dispatch($webhook->url, $event, $data, $instance->name)
            ->onQueue('webhooks');

        // Also send to global webhook if configured
        if (config('evolution.webhook.global.enabled') && config('evolution.webhook.global.url')) {
            \App\Jobs\SendWebhookJob::dispatch(
                config('evolution.webhook.global.url'),
                $event,
                $data,
                $instance->name
            )->onQueue('webhooks');
        }
    }

    /**
     * Send webhook synchronously (for immediate delivery).
     */
    public function send(string $url, string $event, array $data, string $instanceName): bool
    {
        try {
            $payload = [
                'event'        => $event,
                'instance'     => $instanceName,
                'data'         => $data,
                'destination'  => $url,
                'date_time'    => now()->toISOString(),
                'sender'       => $instanceName,
                'server_url'   => config('evolution.server.url'),
                'apikey'       => config('evolution.authentication.api_key'),
            ];

            $response = Http::timeout(config('evolution.webhook.timeout_ms', 60000) / 1000)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'User-Agent'   => 'Wox-Lv/1.0',
                ])
                ->post($url, $payload);

            if ($response->successful()) {
                Log::debug('Webhook delivered', ['event' => $event, 'url' => $url, 'instance' => $instanceName]);
                return true;
            }

            Log::warning('Webhook failed', [
                'event'    => $event,
                'url'      => $url,
                'status'   => $response->status(),
                'instance' => $instanceName,
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Webhook exception', [
                'event'     => $event,
                'url'       => $url,
                'message'   => $e->getMessage(),
                'instance'  => $instanceName,
            ]);
            return false;
        }
    }

    /**
     * Set/update webhook configuration for an instance.
     */
    public function set(Instance $instance, array $data): Webhook
    {
        return Webhook::updateOrCreate(
            ['instanceId' => $instance->id],
            [
                'url'             => $data['url'],
                'enabled'         => $data['enabled'] ?? true,
                'events'          => $data['events'] ?? [],
                'webhookByEvents' => $data['webhookByEvents'] ?? false,
                'webhookBase64'   => $data['webhookBase64'] ?? false,
            ]
        );
    }

    /**
     * Find webhook for an instance.
     */
    public function find(Instance $instance): ?Webhook
    {
        return $instance->webhook;
    }
}
