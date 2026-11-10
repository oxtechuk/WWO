<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chatbot\N8nService;
use App\Services\Chatbot\FlowiseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * N8N Controller — manages N8N workflow integration.
 */
class N8nController extends Controller
{
    public function __construct(
        private readonly N8nService $n8nService,
    ) {}

    /** POST /api/n8n/create/{instanceName} */
    public function create(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'enabled'          => ['nullable', 'boolean'],
            'description'      => ['nullable', 'string'],
            'apiUrl'           => ['required', 'url'],
            'apiKey'           => ['nullable', 'string'],
            'expire'           => ['nullable', 'integer', 'min:0'],
            'keywordFinish'    => ['nullable', 'string'],
            'delayMessage'     => ['nullable', 'integer', 'min:0'],
            'unknownMessage'   => ['nullable', 'string'],
            'listeningFromMe'  => ['nullable', 'boolean'],
            'stopBotFromMe'    => ['nullable', 'boolean'],
            'keepOpen'         => ['nullable', 'boolean'],
            'debounceTime'     => ['nullable', 'integer', 'min:0'],
            'triggerType'      => ['nullable', 'in:all,keyword'],
            'triggerOperator'  => ['nullable', 'string'],
            'triggerValue'     => ['nullable', 'string'],
        ]);

        $instance = $request->get('wox_instance');
        return response()->json($this->n8nService->create($instance, $data), 201);
    }

    /** GET /api/n8n/find/{instanceName} */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->n8nService->find($instance));
    }

    /** GET /api/n8n/findOne/{instanceName}/{n8nId} */
    public function findOne(Request $request, string $instanceName, string $n8nId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $result   = $this->n8nService->findOne($instance, $n8nId);
        if (!$result) {
            return response()->json(['error' => 'N8N not found'], 404);
        }
        return response()->json(['n8n' => $result]);
    }

    /** PUT /api/n8n/update/{instanceName}/{n8nId} */
    public function update(Request $request, string $instanceName, string $n8nId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->n8nService->update($instance, $n8nId, $request->except(['_method'])));
    }

    /** DELETE /api/n8n/delete/{instanceName}/{n8nId} */
    public function delete(Request $request, string $instanceName, string $n8nId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json(['deleted' => $this->n8nService->delete($instance, $n8nId)]);
    }
}
