<?php

namespace App\Services\Chatbot;

use App\Models\Instance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Visus\Cuid2\Cuid2;

/**
 * OpenAI Service — manages OpenAI bot integration per instance.
 */
class OpenAiService
{
    /**
     * Create or update OpenAI credentials.
     */
    public function createCreds(Instance $instance, array $data): array
    {
        $existing = DB::table('openai_creds')
            ->where('instanceId', $instance->id)
            ->where('name', $data['name'])
            ->first();

        if ($existing) {
            DB::table('openai_creds')
                ->where('id', $existing->id)
                ->update(['apiKey' => $data['apiKey'], 'updated_at' => now()]);
            return ['creds' => (array) DB::table('openai_creds')->where('id', $existing->id)->first()];
        }

        $id = (new Cuid2())->toString();
        DB::table('openai_creds')->insert([
            'id'         => $id,
            'instanceId' => $instance->id,
            'name'       => $data['name'],
            'apiKey'     => $data['apiKey'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return ['creds' => (array) DB::table('openai_creds')->where('id', $id)->first()];
    }

    /**
     * Find all OpenAI credentials.
     */
    public function findCreds(Instance $instance): array
    {
        return ['creds' => DB::table('openai_creds')->where('instanceId', $instance->id)->get()->toArray()];
    }

    /**
     * Delete OpenAI credential.
     */
    public function deleteCreds(Instance $instance, string $credId): bool
    {
        return (bool) DB::table('openai_creds')->where('id', $credId)->where('instanceId', $instance->id)->delete();
    }

    /**
     * Create OpenAI bot config.
     */
    public function create(Instance $instance, array $data): array
    {
        $id = (new Cuid2())->toString();

        DB::table('openai_bots')->insert([
            'id'                 => $id,
            'instanceId'         => $instance->id,
            'openaiCredsId'      => $data['openaiCredsId'],
            'enabled'            => $data['enabled'] ?? true,
            'botType'            => $data['botType'] ?? 'ASSISTANT',
            'assistantId'        => $data['assistantId'] ?? null,
            'functionUrl'        => $data['functionUrl'] ?? null,
            'model'              => $data['model'] ?? 'gpt-3.5-turbo',
            'systemMessages'     => json_encode($data['systemMessages'] ?? []),
            'assistantMessages'  => json_encode($data['assistantMessages'] ?? []),
            'userMessages'       => json_encode($data['userMessages'] ?? []),
            'maxTokens'          => $data['maxTokens'] ?? 300,
            'expire'             => $data['expire'] ?? 0,
            'keyword_finish'     => $data['keywordFinish'] ?? null,
            'delay_message'      => $data['delayMessage'] ?? 1000,
            'unknown_message'    => $data['unknownMessage'] ?? null,
            'listening_from_me'  => $data['listeningFromMe'] ?? false,
            'stop_bot_from_me'   => $data['stopBotFromMe'] ?? false,
            'keep_open'          => $data['keepOpen'] ?? false,
            'debounce_time'      => $data['debounceTime'] ?? 0,
            'trigger_type'       => $data['triggerType'] ?? 'all',
            'trigger_operator'   => $data['triggerOperator'] ?? null,
            'trigger_value'      => $data['triggerValue'] ?? null,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);

        Log::info('OpenAI bot created', ['instance' => $instance->name, 'id' => $id]);

        return ['openaiBot' => (array) DB::table('openai_bots')->where('id', $id)->first()];
    }

    /**
     * Find all OpenAI bots for an instance.
     */
    public function find(Instance $instance): array
    {
        return ['openaiBot' => DB::table('openai_bots')->where('instanceId', $instance->id)->get()->toArray()];
    }

    /**
     * Find a specific OpenAI bot.
     */
    public function findOne(Instance $instance, string $botId): ?array
    {
        $bot = DB::table('openai_bots')->where('id', $botId)->where('instanceId', $instance->id)->first();
        return $bot ? (array) $bot : null;
    }

    /**
     * Update an OpenAI bot.
     */
    public function update(Instance $instance, string $botId, array $data): array
    {
        DB::table('openai_bots')->where('id', $botId)->where('instanceId', $instance->id)->update(array_merge($data, ['updated_at' => now()]));
        return ['openaiBot' => (array) DB::table('openai_bots')->where('id', $botId)->first()];
    }

    /**
     * Delete an OpenAI bot.
     */
    public function delete(Instance $instance, string $botId): bool
    {
        return (bool) DB::table('openai_bots')->where('id', $botId)->where('instanceId', $instance->id)->delete();
    }
}
