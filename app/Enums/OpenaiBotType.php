<?php

namespace App\Enums;

enum OpenaiBotType: string
{
    case Assistant      = 'assistant';
    case ChatCompletion = 'chatCompletion';
}
