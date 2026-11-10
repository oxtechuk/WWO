<?php

namespace App\Services\Chatbot;

use App\Models\Instance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * Typebot Service — manages Typebot chatbot integration per instance.
 */
class TypebotService
{
    /**
     * Create or update a Typebot session config.
     */
    public function create(Instance $instance, array $data): array
    {
        $id = (new Cuid2())->toString();

        $typebot = DB::table('typebots')->updateOrInsert(
            ['instanceId' => $instance->id, 'url' => $data['url']],
            [
                'id'              => $id,
                'instanceId'      => $instance->id,
                'enabled'         => $data['enabled'] ?? true,
                'url'             => $data['url'],
                'typebot'         => $data['typebot'],
                'expire'          => $data['expire'] ?? 0,
                'keyword_finish'  => $data['keywordFinish'] ?? null,
                'delay_message'   => $data['delayMessage'] ?? 1000,
                'unknown_message' => $data['unknownMessage'] ?? null,
                'listening_from_me' => $data['listeningFromMe'] ?? false,
                'stop_bot_from_me'  => $data['stopBotFromMe'] ?? false,
                'keep_open'         => $data['keepOpen'] ?? false,
                'debounce_time'     => $data['debounceTime'] ?? 0,
                'trigger_type'      => $data['triggerType'] ?? 'all',
                'trigger_operator'  => $data['triggerOperator'] ?? null,
                'trigger_value'     => $data['triggerValue'] ?? null,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]
        );

        Log::info('Typebot created', ['instance' => $instance->name, 'url' => $data['url']]);

        return ['typebot' => DB::table('typebots')->where('instanceId', $instance->id)->where('url', $data['url'])->first() ? (array) DB::table('typebots')->where('instanceId', $instance->id)->where('url', $data['url'])->first() : []];
    }

    /**
     * Find all typebots for an instance.
     */
    public function find(Instance $instance): array
    {
        $typebots = DB::table('typebots')->where('instanceId', $instance->id)->get();
        return ['typebot' => $typebots->toArray()];
    }

    /**
     * Find a specific typebot.
     */
    public function findOne(Instance $instance, string $typebotId): ?array
    {
        $typebot = DB::table('typebots')->where('id', $typebotId)->where('instanceId', $instance->id)->first();
        return $typebot ? (array) $typebot : null;
    }

    /**
     * Update a typebot.
     */
    public function update(Instance $instance, string $typebotId, array $data): array
    {
        DB::table('typebots')->where('id', $typebotId)->where('instanceId', $instance->id)->update(array_merge($data, ['updated_at' => now()]));
        $typebot = DB::table('typebots')->where('id', $typebotId)->first();
        return ['typebot' => $typebot ? (array) $typebot : []];
    }

    /**
     * Delete a typebot.
     */
    public function delete(Instance $instance, string $typebotId): bool
    {
        return (bool) DB::table('typebots')->where('id', $typebotId)->where('instanceId', $instance->id)->delete();
    }
}
