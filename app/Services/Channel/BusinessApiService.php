<?php

namespace App\Services\Channel;

use App\Models\Instance;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp Business Cloud API Service — interacts with official Meta Graph API.
 */
class BusinessApiService
{
    private string $graphApiVersion;

    public function __construct()
    {
        $this->graphApiVersion = config('evolution.whatsapp_business.api_version', 'v20.0');
    }

    /**
     * Send a template message via Meta Graph API.
     */
    public function sendTemplate(Instance $instance, array $data): array
    {
        $businessId = $instance->businessId ?: config('evolution.whatsapp_business.business_id');
        $token = $instance->token ?: config('evolution.whatsapp_business.token');

        if (!$token || !$businessId) {
            return [
                'error'   => 'Meta credentials not configured',
                'status'  => 400,
            ];
        }

        try {
            $response = Http::withToken($token)
                ->post("https://graph.facebook.com/{$this->graphApiVersion}/{$businessId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to'                => $data['number'],
                    'type'              => 'template',
                    'template'          => [
                        'name'     => $data['name'],
                        'language' => ['code' => $data['language'] ?? 'en_US'],
                        'components' => $data['components'] ?? [],
                    ],
                ]);

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('Meta Business API sendTemplate error: ' . $e->getMessage());
            return ['error' => $e->getMessage(), 'status' => 500];
        }
    }

    /**
     * Verify Meta Webhook signature.
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $appSecret = config('evolution.whatsapp_business.app_secret');
        if (!$appSecret) {
            return true;
        }

        $expected = 'sha256=' . hash_hmac('sha256', $payload, $appSecret);
        return hash_equals($expected, $signature);
    }
}
