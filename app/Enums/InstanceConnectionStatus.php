<?php

namespace App\Enums;

enum InstanceConnectionStatus: string
{
    case Open = 'open';
    case Close = 'close';
    case Connecting = 'connecting';

    public function label(): string
    {
        return match($this) {
            self::Open       => 'Connected',
            self::Close      => 'Disconnected',
            self::Connecting => 'Connecting',
        };
    }

    public function isConnected(): bool
    {
        return $this === self::Open;
    }
}
