<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * MessageReceived — broadcast when a new WhatsApp message is received.
 * Clients listen on: instance.{instanceName}
 */
class MessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $instanceName,
        public readonly array  $message,
        public readonly string $messageType = 'conversation',
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("instance.{$this->instanceName}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'messages.upsert';
    }

    public function broadcastWith(): array
    {
        return [
            'event'    => 'MESSAGES_UPSERT',
            'instance' => $this->instanceName,
            'data'     => [
                'messages'    => [$this->message],
                'type'        => 'notify',
                'messageType' => $this->messageType,
            ],
        ];
    }
}
