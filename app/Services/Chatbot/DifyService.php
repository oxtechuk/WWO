<?php

namespace App\Services\Chatbot;

use App\Models\Instance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * Dify Service — manages Dify AI chatbot integration per instance.
 */
class DifyService
{
    public function create(Instance $instance, array $data): array
    {
        $id = (new Cuid2())->toString();

        DB::table('difys')->insert([
            'id'                => $id,
            'instanceId'        => $instance->id,
            'enabled'           => $data['enabled'] ?? true,
            'description'       => $data['description'] ?? null,
            'botType'           => $data['botType'] ?? 'chatBot',
            'apiUrl'            => $data['apiUrl'],
            'apiKey'            => $data['apiKey'],
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

        Log::info('Dify bot created', ['instance' => $instance->name, 'id' => $id]);

        return ['dify' => (array) DB::table('difys')->where('id', $id)->first()];
    }

    public function find(Instance $instance): array
    {
        return ['dify' => DB::table('difys')->where('instanceId', $instance->id)->get()->toArray()];
    }

    public function findOne(Instance $instance, string $difyId): ?array
    {
        $dify = DB::table('difys')->where('id', $difyId)->where('instanceId', $instance->id)->first();
        return $dify ? (array) $dify : null;
    }

    public function update(Instance $instance, string $difyId, array $data): array
    {
        DB::table('difys')->where('id', $difyId)->where('instanceId', $instance->id)->update(array_merge($data, ['updated_at' => now()]));
        return ['dify' => (array) DB::table('difys')->where('id', $difyId)->first()];
    }

    public function delete(Instance $instance, string $difyId): bool
    {
        return (bool) DB::table('difys')->where('id', $difyId)->where('instanceId', $instance->id)->delete();
    }
}
