<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chatbot\DifyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Dify Controller — manages Dify AI chatbot integration.
 */
class DifyController extends Controller
{
    public function __construct(
        private readonly DifyService $difyService,
    ) {}

    /** POST /api/dify/create/{instanceName} */
    public function create(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'enabled'          => ['nullable', 'boolean'],
            'description'      => ['nullable', 'string'],
            'botType'          => ['nullable', 'in:chatBot,textGenerator,agent,workflow'],
            'apiUrl'           => ['required', 'url'],
            'apiKey'           => ['required', 'string'],
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
        return response()->json($this->difyService->create($instance, $data), 201);
    }

    /** GET /api/dify/find/{instanceName} */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->difyService->find($instance));
    }

    /** GET /api/dify/findOne/{instanceName}/{difyId} */
    public function findOne(Request $request, string $instanceName, string $difyId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $result   = $this->difyService->findOne($instance, $difyId);

        if (!$result) {
            return response()->json(['error' => 'Dify bot not found'], 404);
        }

        return response()->json(['dify' => $result]);
    }

    /** PUT /api/dify/update/{instanceName}/{difyId} */
    public function update(Request $request, string $instanceName, string $difyId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->difyService->update($instance, $difyId, $request->except(['_method'])));
    }

    /** DELETE /api/dify/delete/{instanceName}/{difyId} */
    public function delete(Request $request, string $instanceName, string $difyId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json(['deleted' => $this->difyService->delete($instance, $difyId)]);
    }
}
