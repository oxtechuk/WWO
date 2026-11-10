<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for creating a new WhatsApp instance.
 * Mirrors Wox-Ox JSONSchema7 validation schema.
 */
class CreateInstanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by ApiKeyAuth middleware
    }

    public function rules(): array
    {
        return [
            'instanceName'    => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_\-\.]+$/'],
            'token'           => ['nullable', 'string', 'max:255'],
            'number'          => ['nullable', 'string', 'max:100'],
            'businessId'      => ['nullable', 'string', 'max:100'],
            'integration'     => ['nullable', 'in:WHATSAPP-BAILEYS,WHATSAPP-BUSINESS,EVOLUTION'],
            'qrcode'          => ['nullable', 'boolean'],
            'rejectCall'      => ['nullable', 'boolean'],
            'msgCall'         => ['nullable', 'string', 'max:500'],
            'groupsIgnore'    => ['nullable', 'boolean'],
            'alwaysOnline'    => ['nullable', 'boolean'],
            'readMessages'    => ['nullable', 'boolean'],
            'readStatus'      => ['nullable', 'boolean'],
            'syncFullHistory' => ['nullable', 'boolean'],
            'webhook'         => ['nullable', 'array'],
            'webhook.url'     => ['nullable', 'url', 'max:500'],
            'webhook.enabled' => ['nullable', 'boolean'],
            'webhook.events'  => ['nullable', 'array'],
            'webhook.webhookByEvents' => ['nullable', 'boolean'],
            'webhook.webhookBase64'   => ['nullable', 'boolean'],
            'proxy'           => ['nullable', 'array'],
            'proxy.host'      => ['nullable', 'string', 'max:100'],
            'proxy.port'      => ['nullable', 'string', 'max:20'],
            'proxy.protocol'  => ['nullable', 'in:http,https,socks4,socks5'],
            'proxy.username'  => ['nullable', 'string', 'max:100'],
            'proxy.password'  => ['nullable', 'string', 'max:255'],
            'chatwoot'        => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'instanceName.required' => 'Instance name is required.',
            'instanceName.regex'    => 'Instance name can only contain letters, numbers, hyphens, underscores, and dots.',
            'instanceName.max'      => 'Instance name cannot exceed 255 characters.',
            'integration.in'        => 'Integration must be one of: WHATSAPP-BAILEYS, WHATSAPP-BUSINESS, EVOLUTION.',
        ];
    }
}
