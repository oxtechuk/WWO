<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * ConnectionStatusChanged — broadcast when an instance connection status changes.
 */
class ConnectionStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $instanceName,
        public readonly string $state,    // open | close | connecting
        public readonly ?string $statusReason = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("instance.{$this->instanceName}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'connection.update';
    }

    public function broadcastWith(): array
    {
        return [
            'event'    => 'CONNECTION_UPDATE',
            'instance' => $this->instanceName,
            'data'     => [
                'state'        => $this->state,
                'statusReason' => $this->statusReason,
            ],
        ];
    }
}
