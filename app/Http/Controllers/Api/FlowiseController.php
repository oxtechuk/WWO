<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chatbot\FlowiseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Flowise Controller — manages Flowise AI chatbot integration.
 */
class FlowiseController extends Controller
{
    public function __construct(
        private readonly FlowiseService $flowiseService,
    ) {}

    /** POST /api/flowise/create/{instanceName} */
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
        return response()->json($this->flowiseService->create($instance, $data), 201);
    }

    /** GET /api/flowise/find/{instanceName} */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->flowiseService->find($instance));
    }

    /** GET /api/flowise/findOne/{instanceName}/{flowiseId} */
    public function findOne(Request $request, string $instanceName, string $flowiseId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $result   = $this->flowiseService->findOne($instance, $flowiseId);
        if (!$result) {
            return response()->json(['error' => 'Flowise not found'], 404);
        }
        return response()->json(['flowise' => $result]);
    }

    /** PUT /api/flowise/update/{instanceName}/{flowiseId} */
    public function update(Request $request, string $instanceName, string $flowiseId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->flowiseService->update($instance, $flowiseId, $request->except(['_method'])));
    }

    /** DELETE /api/flowise/delete/{instanceName}/{flowiseId} */
    public function delete(Request $request, string $instanceName, string $flowiseId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json(['deleted' => $this->flowiseService->delete($instance, $flowiseId)]);
    }
}
