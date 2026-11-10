<?php

namespace App\Services\Chatbot;

use App\Models\Instance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * Flowise Service — manages Flowise AI chatbot integration per instance.
 */
class FlowiseService
{
    public function create(Instance $instance, array $data): array
    {
        $id = (new Cuid2())->toString();

        DB::table('flowises')->insert([
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

        Log::info('Flowise bot created', ['instance' => $instance->name, 'id' => $id]);

        return ['flowise' => (array) DB::table('flowises')->where('id', $id)->first()];
    }

    public function find(Instance $instance): array
    {
        return ['flowise' => DB::table('flowises')->where('instanceId', $instance->id)->get()->toArray()];
    }

    public function findOne(Instance $instance, string $flowiseId): ?array
    {
        $flowise = DB::table('flowises')->where('id', $flowiseId)->where('instanceId', $instance->id)->first();
        return $flowise ? (array) $flowise : null;
    }

    public function update(Instance $instance, string $flowiseId, array $data): array
    {
        DB::table('flowises')->where('id', $flowiseId)->where('instanceId', $instance->id)->update(array_merge($data, ['updated_at' => now()]));
        return ['flowise' => (array) DB::table('flowises')->where('id', $flowiseId)->first()];
    }

    public function delete(Instance $instance, string $flowiseId): bool
    {
        return (bool) DB::table('flowises')->where('id', $flowiseId)->where('instanceId', $instance->id)->delete();
    }
}
