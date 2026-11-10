<?php

namespace App\Services\Message;

use App\Models\Instance;
use App\Models\Message;
use App\Services\Webhook\WebhookService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Message Service — handles sending and retrieving WhatsApp messages.
 * Delegates to the Evolution API bridge (Baileys) for actual delivery.
 */
class MessageService
{
    public function __construct(
        private readonly WebhookService $webhookService,
    ) {}

    // ─── Send Methods ─────────────────────────────────────────────

    /**
     * Send a plain text message.
     */
    public function sendText(Instance $instance, array $data): array
    {
        $payload = [
            'number'  => $this->normalizeNumber($data['number']),
            'text'    => $data['text'],
            'delay'   => $data['delay'] ?? 0,
            'quoted'  => $data['quoted'] ?? null,
            'mention' => $data['mentionsEveryOne'] ?? false,
        ];

        return $this->forwardToBridge($instance, 'message/sendText', $payload);
    }

    /**
     * Send a media message (image / video / gif).
     */
    public function sendMedia(Instance $instance, array $data): array
    {
        $payload = [
            'number'    => $this->normalizeNumber($data['number']),
            'mediatype' => $data['mediatype'],
            'mimetype'  => $data['mimetype'] ?? null,
            'caption'   => $data['caption'] ?? null,
            'media'     => $data['media'],
            'fileName'  => $data['fileName'] ?? null,
            'delay'     => $data['delay'] ?? 0,
            'quoted'    => $data['quoted'] ?? null,
        ];

        return $this->forwardToBridge($instance, 'message/sendMedia', $payload);
    }

    /**
     * Send an audio/PTT message.
     */
    public function sendAudio(Instance $instance, array $data): array
    {
        $payload = [
            'number' => $this->normalizeNumber($data['number']),
            'audio'  => $data['audio'],
            'delay'  => $data['delay'] ?? 0,
            'quoted' => $data['quoted'] ?? null,
            'ptt'    => $data['ptt'] ?? false,
        ];

        return $this->forwardToBridge($instance, 'message/sendWhatsAppAudio', $payload);
    }

    /**
     * Send a document (PDF, DOCX, etc.)
     */
    public function sendDocument(Instance $instance, array $data): array
    {
        $payload = [
            'number'    => $this->normalizeNumber($data['number']),
            'media'     => $data['media'],
            'mimetype'  => $data['mimetype'],
            'fileName'  => $data['fileName'],
            'caption'   => $data['caption'] ?? null,
            'delay'     => $data['delay'] ?? 0,
            'quoted'    => $data['quoted'] ?? null,
        ];

        return $this->forwardToBridge($instance, 'message/sendMedia', $payload);
    }

    /**
     * Send a location pin.
     */
    public function sendLocation(Instance $instance, array $data): array
    {
        $payload = [
            'number'      => $this->normalizeNumber($data['number']),
            'name'        => $data['name'] ?? '',
            'address'     => $data['address'] ?? '',
            'latitude'    => $data['latitude'],
            'longitude'   => $data['longitude'],
            'delay'       => $data['delay'] ?? 0,
            'quoted'      => $data['quoted'] ?? null,
        ];

        return $this->forwardToBridge($instance, 'message/sendLocation', $payload);
    }

    /**
     * Send a vCard contact.
     */
    public function sendContact(Instance $instance, array $data): array
    {
        $payload = [
            'number'   => $this->normalizeNumber($data['number']),
            'contact'  => $data['contact'],
            'delay'    => $data['delay'] ?? 0,
        ];

        return $this->forwardToBridge($instance, 'message/sendContact', $payload);
    }

    /**
     * Send a reaction emoji to a message.
     */
    public function sendReaction(Instance $instance, array $data): array
    {
        $payload = [
            'key'      => $data['key'],
            'reaction' => $data['reaction'],
        ];

        return $this->forwardToBridge($instance, 'message/sendReaction', $payload);
    }

    /**
     * Send a list message (interactive).
     */
    public function sendList(Instance $instance, array $data): array
    {
        $payload = [
            'number'      => $this->normalizeNumber($data['number']),
            'title'       => $data['title'],
            'description' => $data['description'] ?? '',
            'buttonText'  => $data['buttonText'],
            'footerText'  => $data['footerText'] ?? '',
            'sections'    => $data['sections'],
            'delay'       => $data['delay'] ?? 0,
            'quoted'      => $data['quoted'] ?? null,
        ];

        return $this->forwardToBridge($instance, 'message/sendList', $payload);
    }

    /**
     * Send button reply message.
     */
    public function sendButtons(Instance $instance, array $data): array
    {
        $payload = [
            'number'      => $this->normalizeNumber($data['number']),
            'title'       => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'footer'      => $data['footer'] ?? '',
            'buttons'     => $data['buttons'],
            'delay'       => $data['delay'] ?? 0,
            'quoted'      => $data['quoted'] ?? null,
        ];

        return $this->forwardToBridge($instance, 'message/sendButtons', $payload);
    }

    /**
     * Send a link preview message.
     */
    public function sendLink(Instance $instance, array $data): array
    {
        $payload = [
            'number'       => $this->normalizeNumber($data['number']),
            'text'         => $data['text'],
            'linkPreview'  => true,
            'delay'        => $data['delay'] ?? 0,
            'quoted'       => $data['quoted'] ?? null,
        ];

        return $this->forwardToBridge($instance, 'message/sendText', $payload);
    }

    /**
     * Send a sticker.
     */
    public function sendSticker(Instance $instance, array $data): array
    {
        $payload = [
            'number'  => $this->normalizeNumber($data['number']),
            'sticker' => $data['sticker'],
            'delay'   => $data['delay'] ?? 0,
        ];

        return $this->forwardToBridge($instance, 'message/sendSticker', $payload);
    }

    /**
     * Send a poll.
     */
    public function sendPoll(Instance $instance, array $data): array
    {
        $payload = [
            'number'               => $this->normalizeNumber($data['number']),
            'name'                 => $data['name'],
            'selectableCount'      => $data['selectableCount'] ?? 1,
            'values'               => $data['values'],
            'delay'                => $data['delay'] ?? 0,
        ];

        return $this->forwardToBridge($instance, 'message/sendPoll', $payload);
    }

    /**
     * Mark messages as read.
     */
    public function readMessages(Instance $instance, array $data): array
    {
        return $this->forwardToBridge($instance, 'chat/readMessages', $data);
    }

    /**
     * Update a message.
     */
    public function updateMessage(Instance $instance, array $data): array
    {
        return $this->forwardToBridge($instance, 'message/updateMessage', $data);
    }

    /**
     * Delete a message for everyone.
     */
    public function deleteForEveryone(Instance $instance, array $data): array
    {
        return $this->forwardToBridge($instance, 'message/delete', $data);
    }

    // ─── Forward to Bridge ────────────────────────────────────────

    /**
     * Forward request to the Node.js Evolution API bridge.
     * Falls back to storing locally if bridge is not configured.
     */
    private function forwardToBridge(Instance $instance, string $path, array $payload): array
    {
        $bridgeUrl = config('evolution.bridge.url');

        if (!$bridgeUrl) {
            // Bridge not configured — return mock response for testing
            Log::warning('Evolution bridge not configured', ['instance' => $instance->name, 'path' => $path]);
            return $this->mockResponse($instance->name, $payload);
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'apikey'       => $instance->token,
                    'Content-Type' => 'application/json',
                ])
                ->post("{$bridgeUrl}/{$path}/{$instance->name}", $payload);

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::error('Bridge error', [
                'instance' => $instance->name,
                'path'     => $path,
                'status'   => $response->status(),
                'body'     => $response->body(),
            ]);

            return ['error' => $response->json('message', 'Bridge error'), 'status' => $response->status()];
        } catch (\Exception $e) {
            Log::error('Bridge exception', [
                'instance' => $instance->name,
                'path'     => $path,
                'message'  => $e->getMessage(),
            ]);

            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Normalize phone number: strip non-digits, ensure @s.whatsapp.net suffix.
     */
    private function normalizeNumber(string $number): string
    {
        // Remove spaces, dashes, parentheses
        $clean = preg_replace('/\D/', '', $number);

        // Keep JID format if already provided
        if (str_contains($number, '@')) {
            return $number;
        }

        return $clean;
    }

    /**
     * Mock response when bridge is not configured (dev/test environment).
     */
    private function mockResponse(string $instanceName, array $payload): array
    {
        return [
            'key' => [
                'remoteJid' => ($payload['number'] ?? 'unknown') . '@s.whatsapp.net',
                'fromMe'    => true,
                'id'        => strtoupper(bin2hex(random_bytes(11))),
            ],
            'message'          => ['conversation' => $payload['text'] ?? ''],
            'messageTimestamp' => now()->timestamp,
            'status'           => 'PENDING',
            'instance'         => $instanceName,
        ];
    }
}
