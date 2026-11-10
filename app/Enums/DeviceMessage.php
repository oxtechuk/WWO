<?php

namespace App\Enums;

enum DeviceMessage: string
{
    case Ios     = 'ios';
    case Android = 'android';
    case Web     = 'web';
    case Unknown = 'unknown';
    case Desktop = 'desktop';
}
