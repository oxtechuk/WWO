<?php

namespace App\Services\Channel;

use App\Models\Instance;
use Illuminate\Support\Facades\Log;

/**
 * Evolution Channel Service — channel orchestrator that routes requests to
 * the correct provider (Baileys vs Meta Business Cloud API).
 */
class EvolutionService
{
    public function __construct(
        private readonly BaileysService     $baileysService,
        private readonly BusinessApiService $businessApiService,
    ) {}

    /**
     * Connect instance based on its configured integration.
     */
    public function connect(Instance $instance): array
    {
        if ($instance->integration === 'WHATSAPP-BUSINESS') {
            return [
                'instance' => [
                    'instanceName' => $instance->name,
                    'status'       => 'open',
                ],
                'qrcode'      => null,
                'pairingCode' => null,
            ];
        }

        return $this->baileysService->connect($instance);
    }

    /**
     * Get connection state for an instance.
     */
    public function getConnectionState(Instance $instance): string
    {
        if ($instance->integration === 'WHATSAPP-BUSINESS') {
            return 'open';
        }

        return $this->baileysService->getConnectionState($instance);
    }

    /**
     * Logout and destroy session.
     */
    public function logout(Instance $instance): bool
    {
        return $this->baileysService->logout($instance);
    }

    /**
     * Restart instance.
     */
    public function restart(Instance $instance): bool
    {
        return $this->baileysService->restart($instance);
    }

    public function getBaileys(): BaileysService
    {
        return $this->baileysService;
    }

    public function getBusinessApi(): BusinessApiService
    {
        return $this->businessApiService;
    }
}
