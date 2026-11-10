<?php

namespace App\Services\Instance;

use App\Enums\InstanceConnectionStatus;
use App\Models\Instance;
use App\Services\Cache\InstanceCacheService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * Instance Service — core business logic for instance management.
 * Mirrors Wox-Ox InstanceService pattern.
 */
class InstanceService
{
    public function __construct(
        private readonly InstanceCacheService $cache
    ) {}

    /**
     * Create a new WhatsApp instance.
     */
    public function create(array $data): array
    {
        $instanceName = $data['instanceName'];

        // Check if already exists
        $existing = Instance::where('name', $instanceName)->first();
        if ($existing) {
            return [
                'instance' => $this->formatInstance($existing),
                'hash'     => $existing->token,
                'status'   => 'existing',
            ];
        }

        $token = $data['token'] ?? (new Cuid2())->toString();

        $instance = DB::transaction(function () use ($instanceName, $token, $data) {
            $inst = Instance::create([
                'name'             => $instanceName,
                'connectionStatus' => InstanceConnectionStatus::Close,
                'token'            => $token,
                'integration'      => $data['integration'] ?? 'WHATSAPP-BAILEYS',
                'number'           => $data['number'] ?? null,
            ]);

            // Create default Setting
            \App\Models\Setting::create([
                'instanceId'      => $inst->id,
                'rejectCall'      => $data['rejectCall'] ?? false,
                'msgCall'         => $data['msgCall'] ?? null,
                'groupsIgnore'    => $data['groupsIgnore'] ?? false,
                'alwaysOnline'    => $data['alwaysOnline'] ?? false,
                'readMessages'    => $data['readMessages'] ?? false,
                'readStatus'      => $data['readStatus'] ?? false,
                'syncFullHistory' => $data['syncFullHistory'] ?? false,
            ]);

            // Create Webhook if provided
            if (!empty($data['webhook']['url'])) {
                \App\Models\Webhook::create([
                    'instanceId'      => $inst->id,
                    'url'             => $data['webhook']['url'],
                    'enabled'         => true,
                    'events'          => $data['webhook']['events'] ?? $this->defaultWebhookEvents(),
                    'webhookByEvents' => $data['webhook']['webhookByEvents'] ?? false,
                    'webhookBase64'   => $data['webhook']['webhookBase64'] ?? false,
                ]);
            }

            return $inst;
        });

        Log::info('Instance created', ['name' => $instanceName, 'id' => $instance->id]);

        return [
            'instance' => $this->formatInstance($instance),
            'hash'     => $token,
            'status'   => 'created',
        ];
    }

    /**
     * Find all instances (global) or single instance.
     */
    public function findAll(?string $instanceName = null): array
    {
        $query = Instance::with(['setting', 'webhook']);

        if ($instanceName) {
            $query->where('name', $instanceName);
        }

        return $query->get()->map(fn($inst) => $this->formatInstance($inst))->toArray();
    }

    /**
     * Find a single instance by name.
     */
    public function findOne(string $instanceName): ?Instance
    {
        return $this->cache->getInstance($instanceName);
    }

    /**
     * Delete an instance and all its data.
     */
    public function delete(string $instanceName): bool
    {
        $instance = Instance::where('name', $instanceName)->first();

        if (!$instance) {
            return false;
        }

        $instance->delete(); // Cascades to all related tables
        $this->cache->invalidate($instanceName);

        Log::info('Instance deleted', ['name' => $instanceName]);
        return true;
    }

    /**
     * Update connection status.
     */
    public function updateConnectionStatus(string $instanceName, InstanceConnectionStatus $status): void
    {
        Instance::where('name', $instanceName)->update([
            'connectionStatus' => $status,
            'updatedAt'        => now(),
        ]);

        $this->cache->invalidate($instanceName);
    }

    /**
     * Format instance for API response — matches Wox-Ox response structure.
     */
    public function formatInstance(Instance $instance): array
    {
        return [
            'instanceName'     => $instance->name,
            'instanceId'       => $instance->id,
            'status'           => $instance->connectionStatus->value,
            'integration'      => $instance->integration,
            'owner'            => $instance->ownerJid,
            'profileName'      => $instance->profileName,
            'profilePicUrl'    => $instance->profilePicUrl,
            'profileStatus'    => null,
            'serverUrl'        => config('evolution.server.url'),
            'apikey'           => $instance->token,
            'token'            => $instance->token,
            'number'           => $instance->number,
            'businessId'       => $instance->businessId,
            'clientName'       => $instance->clientName,
        ];
    }

    private function defaultWebhookEvents(): array
    {
        $events = config('evolution.webhook.events', []);
        return array_keys(array_filter($events));
    }
}
