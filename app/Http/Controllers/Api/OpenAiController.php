<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chatbot\OpenAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * OpenAI Controller — manages OpenAI chatbot integration.
 */
class OpenAiController extends Controller
{
    public function __construct(
        private readonly OpenAiService $openAiService,
    ) {}

    // ─── Credentials ──────────────────────────────────────────────

    /** POST /api/openai/creds/create/{instanceName} */
    public function createCreds(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'name'   => ['required', 'string', 'max:255'],
            'apiKey' => ['required', 'string'],
        ]);

        $instance = $request->get('wox_instance');
        return response()->json($this->openAiService->createCreds($instance, $data), 201);
    }

    /** GET /api/openai/creds/{instanceName} */
    public function findCreds(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->openAiService->findCreds($instance));
    }

    /** DELETE /api/openai/creds/{instanceName}/{credId} */
    public function deleteCreds(Request $request, string $instanceName, string $credId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json(['deleted' => $this->openAiService->deleteCreds($instance, $credId)]);
    }

    // ─── Bots ─────────────────────────────────────────────────────

    /** POST /api/openai/create/{instanceName} */
    public function create(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'enabled'           => ['nullable', 'boolean'],
            'openaiCredsId'     => ['required', 'string'],
            'botType'           => ['nullable', 'in:ASSISTANT,CHATCOMPLETION'],
            'assistantId'       => ['nullable', 'string'],
            'functionUrl'       => ['nullable', 'url'],
            'model'             => ['nullable', 'string'],
            'systemMessages'    => ['nullable', 'array'],
            'assistantMessages' => ['nullable', 'array'],
            'userMessages'      => ['nullable', 'array'],
            'maxTokens'         => ['nullable', 'integer', 'min:1'],
            'expire'            => ['nullable', 'integer', 'min:0'],
            'keywordFinish'     => ['nullable', 'string'],
            'delayMessage'      => ['nullable', 'integer', 'min:0'],
            'unknownMessage'    => ['nullable', 'string'],
            'listeningFromMe'   => ['nullable', 'boolean'],
            'stopBotFromMe'     => ['nullable', 'boolean'],
            'keepOpen'          => ['nullable', 'boolean'],
            'debounceTime'      => ['nullable', 'integer', 'min:0'],
            'triggerType'       => ['nullable', 'in:all,keyword'],
            'triggerOperator'   => ['nullable', 'string'],
            'triggerValue'      => ['nullable', 'string'],
        ]);

        $instance = $request->get('wox_instance');
        return response()->json($this->openAiService->create($instance, $data), 201);
    }

    /** GET /api/openai/find/{instanceName} */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->openAiService->find($instance));
    }

    /** GET /api/openai/findOne/{instanceName}/{botId} */
    public function findOne(Request $request, string $instanceName, string $botId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $result   = $this->openAiService->findOne($instance, $botId);

        if (!$result) {
            return response()->json(['error' => 'OpenAI bot not found'], 404);
        }

        return response()->json(['openaiBot' => $result]);
    }

    /** PUT /api/openai/update/{instanceName}/{botId} */
    public function update(Request $request, string $instanceName, string $botId): JsonResponse
    {
        $data     = $request->except(['_method']);
        $instance = $request->get('wox_instance');
        return response()->json($this->openAiService->update($instance, $botId, $data));
    }

    /** DELETE /api/openai/delete/{instanceName}/{botId} */
    public function delete(Request $request, string $instanceName, string $botId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json(['deleted' => $this->openAiService->delete($instance, $botId)]);
    }
}
