<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instance;
use App\Services\Chatbot\ChatwootService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Chatwoot Controller — handles Chatwoot CRM integration endpoints.
 */
class ChatwootController extends Controller
{
    public function __construct(
        private readonly ChatwootService $chatwootService,
    ) {}

    /**
     * POST /api/chatwoot/set/{instanceName}
     */
    public function set(Request $request, string $instanceName): JsonResponse
    {
        $validated = $request->validate([
            'enabled'                 => ['nullable', 'boolean'],
            'accountId'               => ['required', 'string'],
            'token'                   => ['required', 'string'],
            'url'                     => ['required', 'url'],
            'nameInbox'               => ['nullable', 'boolean'],
            'signMsg'                 => ['nullable', 'boolean'],
            'signDelimiter'           => ['nullable', 'boolean'],
            'reopenConversation'      => ['nullable', 'boolean'],
            'conversationPending'     => ['nullable', 'boolean'],
            'mergeBrazilContacts'     => ['nullable', 'string'],
            'importContacts'          => ['nullable', 'boolean'],
            'importMessages'          => ['nullable', 'boolean'],
            'daysLimitImportMessages' => ['nullable', 'integer'],
            'organization'            => ['nullable', 'string'],
            'logo'                    => ['nullable', 'url'],
        ]);

        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        $result = $this->chatwootService->set($instance, $validated);

        return response()->json($result);
    }

    /**
     * GET /api/chatwoot/find/{instanceName}
     */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        $chatwoot = $this->chatwootService->find($instance);

        return response()->json(['chatwoot' => $chatwoot]);
    }
}
