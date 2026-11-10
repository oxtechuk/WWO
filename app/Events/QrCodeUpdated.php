<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * QrCodeUpdated — broadcast when a new QR code is generated for an instance.
 * Clients listen on: instance.{instanceName}
 */
class QrCodeUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $instanceName,
        public readonly string $qrCode,       // Base64 QR code image or raw string
        public readonly ?string $pairingCode = null,
        public readonly int $count = 0,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("instance.{$this->instanceName}"),
        ];
    }

    /**
     * The event's broadcast name — matches Wox-Ox event naming.
     */
    public function broadcastAs(): string
    {
        return 'qrcode.updated';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event'    => 'QRCODE_UPDATED',
            'instance' => $this->instanceName,
            'data'     => [
                'qrcode'      => $this->qrCode,
                'pairingCode' => $this->pairingCode,
                'count'       => $this->count,
            ],
        ];
    }
}
