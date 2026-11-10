<?php

namespace App\Enums;

enum TriggerType: string
{
    case All      = 'all';
    case Keyword  = 'keyword';
    case None     = 'none';
    case Advanced = 'advanced';
}
