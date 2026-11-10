<?php

namespace App\Services\Chatbot;

use App\Models\Instance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * N8N Service — manages N8N workflow integration per instance.
 */
class N8nService
{
    public function create(Instance $instance, array $data): array
    {
        $id = (new Cuid2())->toString();

        DB::table('n8ns')->insert([
            'id'                => $id,
            'instanceId'        => $instance->id,
            'enabled'           => $data['enabled'] ?? true,
            'description'       => $data['description'] ?? null,
            'apiUrl'            => $data['apiUrl'],
            'apiKey'            => $data['apiKey'] ?? null,
            'expire'            => $data['expire'] ?? 0,
            'keyword_finish'    => $data['keywordFinish'] ?? null,
            'delay_message'     => $data['delayMessage'] ?? 1000,
            'unknown_message'   => $data['unknownMessage'] ?? null,
            'listening_from_me' => $data['listeningFromMe'] ?? false,
            'stop_bot_from_me'  => $data['stopBotFromMe'] ?? false,
            'keep_open'         => $data['keepOpen'] ?? false,
            'debounce_time'     => $data['debounceTime'] ?? 0,
            'trigger_type'      => $data['triggerType'] ?? 'all',
            'trigger_operator'  => $data['triggerOperator'] ?? null,
            'trigger_value'     => $data['triggerValue'] ?? null,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        Log::info('N8N integration created', ['instance' => $instance->name, 'id' => $id]);

        return ['n8n' => (array) DB::table('n8ns')->where('id', $id)->first()];
    }

    public function find(Instance $instance): array
    {
        return ['n8n' => DB::table('n8ns')->where('instanceId', $instance->id)->get()->toArray()];
    }

    public function findOne(Instance $instance, string $n8nId): ?array
    {
        $n8n = DB::table('n8ns')->where('id', $n8nId)->where('instanceId', $instance->id)->first();
        return $n8n ? (array) $n8n : null;
    }

    public function update(Instance $instance, string $n8nId, array $data): array
    {
        DB::table('n8ns')->where('id', $n8nId)->where('instanceId', $instance->id)->update(array_merge($data, ['updated_at' => now()]));
        return ['n8n' => (array) DB::table('n8ns')->where('id', $n8nId)->first()];
    }

    public function delete(Instance $instance, string $n8nId): bool
    {
        return (bool) DB::table('n8ns')->where('id', $n8nId)->where('instanceId', $instance->id)->delete();
    }
}
