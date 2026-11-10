<?php

namespace App\Enums;

enum DifyBotType: string
{
    case ChatBot       = 'chatBot';
    case TextGenerator = 'textGenerator';
    case Agent         = 'agent';
    case Workflow      = 'workflow';
}
