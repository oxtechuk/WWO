<?php

namespace App\Services\Chatbot;

use App\Models\Instance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * Chatwoot Service — manages Chatwoot CRM integration per instance.
 */
class ChatwootService
{
    /**
     * Create or update Chatwoot configuration.
     */
    public function set(Instance $instance, array $data): array
    {
        $existing = DB::table('Chatwoot')->where('instanceId', $instance->id)->first();

        $record = [
            'instanceId'              => $instance->id,
            'enabled'                 => (bool) ($data['enabled'] ?? true),
            'accountId'               => (string) $data['accountId'],
            'token'                   => (string) $data['token'],
            'url'                     => (string) $data['url'],
            'nameInbox'               => (bool) ($data['nameInbox'] ?? false),
            'signMsg'                 => (bool) ($data['signMsg'] ?? false),
            'signDelimiter'           => isset($data['signDelimiter']) ? (bool) $data['signDelimiter'] : null,
            'reopenConversation'      => (bool) ($data['reopenConversation'] ?? false),
            'conversationPending'     => (bool) ($data['conversationPending'] ?? false),
            'mergeBrazilContacts'     => $data['mergeBrazilContacts'] ?? null,
            'importContacts'          => isset($data['importContacts']) ? (bool) $data['importContacts'] : null,
            'importMessages'          => isset($data['importMessages']) ? (bool) $data['importMessages'] : null,
            'daysLimitImportMessages' => isset($data['daysLimitImportMessages']) ? (int) $data['daysLimitImportMessages'] : null,
            'organization'            => $data['organization'] ?? null,
            'logo'                    => $data['logo'] ?? null,
        ];

        if ($existing) {
            DB::table('Chatwoot')->where('id', $existing->id)->update($record);
            return ['chatwoot' => (array) DB::table('Chatwoot')->where('id', $existing->id)->first()];
        }

        $id = (new Cuid2())->toString();
        $record['id'] = $id;
        DB::table('Chatwoot')->insert($record);

        Log::info('Chatwoot configured', ['instance' => $instance->name]);

        return ['chatwoot' => (array) DB::table('Chatwoot')->where('id', $id)->first()];
    }

    /**
     * Find Chatwoot config for an instance.
     */
    public function find(Instance $instance): ?array
    {
        $chatwoot = DB::table('Chatwoot')->where('instanceId', $instance->id)->first();
        return $chatwoot ? (array) $chatwoot : null;
    }
}
