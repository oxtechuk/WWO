<?php

namespace App\Enums;

enum SessionStatus: string
{
    case Opened = 'opened';
    case Closed = 'closed';
    case Paused = 'paused';
}
