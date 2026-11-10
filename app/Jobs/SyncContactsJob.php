<?php

namespace App\Jobs;

use App\Models\Instance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SyncContactsJob — syncs contacts for an instance from the WhatsApp bridge.
 */
class SyncContactsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;
    public array $backoff = [30, 60, 120];

    public function __construct(
        private readonly string $instanceId,
        private readonly string $instanceName,
    ) {}

    public function handle(): void
    {
        $bridgeUrl = config('evolution.bridge.url');

        if (!$bridgeUrl) {
            Log::warning('SyncContactsJob: bridge not configured', ['instance' => $this->instanceName]);
            return;
        }

        $instance = Instance::find($this->instanceId);
        if (!$instance) {
            Log::warning('SyncContactsJob: instance not found', ['id' => $this->instanceId]);
            return;
        }

        try {
            $response = Http::timeout(60)
                ->withHeaders(['apikey' => $instance->token])
                ->get("{$bridgeUrl}/chat/findContacts/{$this->instanceName}");

            if (!$response->successful()) {
                Log::warning('SyncContactsJob: bridge returned error', [
                    'instance' => $this->instanceName,
                    'status'   => $response->status(),
                ]);
                return;
            }

            $contacts = $response->json() ?? [];

            foreach ($contacts as $contact) {
                \App\Models\Contact::updateOrCreate(
                    [
                        'instanceId' => $instance->id,
                        'remoteJid'  => $contact['id'] ?? $contact['remoteJid'] ?? '',
                    ],
                    [
                        'pushName'      => $contact['pushName'] ?? $contact['name'] ?? null,
                        'profilePicUrl' => $contact['profilePicUrl'] ?? null,
                    ]
                );
            }

            Log::info('SyncContactsJob: contacts synced', [
                'instance' => $this->instanceName,
                'count'    => count($contacts),
            ]);
        } catch (\Exception $e) {
            Log::error('SyncContactsJob failed', [
                'instance' => $this->instanceName,
                'error'    => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncContactsJob permanently failed', [
            'instance' => $this->instanceName,
            'error'    => $exception->getMessage(),
        ]);
    }
}
