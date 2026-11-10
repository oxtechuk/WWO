<?php

namespace App\Enums;

enum TriggerOperator: string
{
    case Contains   = 'contains';
    case Equals     = 'equals';
    case StartsWith = 'startsWith';
    case EndsWith   = 'endsWith';
    case Regex      = 'regex';
}
