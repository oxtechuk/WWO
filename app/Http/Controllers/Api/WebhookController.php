<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instance;
use App\Services\Webhook\WebhookService;
use App\Traits\HasApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Webhook Controller — manages webhook configuration per instance.
 */
class WebhookController extends Controller
{
    use HasApiKey;

    public function __construct(
        private readonly WebhookService $webhookService,
    ) {}

    /**
     * POST /api/webhook/set/{instanceName}
     */
    public function set(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'url'             => ['required', 'url', 'max:500'],
            'enabled'         => ['sometimes', 'boolean'],
            'events'          => ['sometimes', 'array'],
            'events.*'        => ['string'],
            'webhookByEvents' => ['sometimes', 'boolean'],
            'webhookBase64'   => ['sometimes', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');
        $webhook  = $this->webhookService->set($instance, $data);

        return response()->json([
            'webhook' => [
                'instanceName'   => $instanceName,
                'webhook'        => [
                    'url'             => $webhook->url,
                    'enabled'         => $webhook->enabled,
                    'events'          => $webhook->events,
                    'webhookByEvents' => $webhook->webhookByEvents,
                    'webhookBase64'   => $webhook->webhookBase64,
                ],
            ],
        ]);
    }

    /**
     * GET /api/webhook/find/{instanceName}
     */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $webhook  = $this->webhookService->find($instance);

        return response()->json([
            'webhook' => $webhook ? [
                'instanceName'   => $instanceName,
                'webhook'        => [
                    'url'             => $webhook->url,
                    'enabled'         => $webhook->enabled,
                    'events'          => $webhook->events ?? [],
                    'webhookByEvents' => $webhook->webhookByEvents,
                    'webhookBase64'   => $webhook->webhookBase64,
                ],
            ] : null,
        ]);
    }
}
