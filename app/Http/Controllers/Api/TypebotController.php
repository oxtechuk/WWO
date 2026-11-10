<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Chatbot\TypebotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Typebot Controller — manages Typebot chatbot integration.
 */
class TypebotController extends Controller
{
    public function __construct(
        private readonly TypebotService $typebotService,
    ) {}

    /**
     * POST /api/typebot/create/{instanceName}
     */
    public function create(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'enabled'          => ['nullable', 'boolean'],
            'url'              => ['required', 'url'],
            'typebot'          => ['required', 'string'],
            'expire'           => ['nullable', 'integer', 'min:0'],
            'keywordFinish'    => ['nullable', 'string'],
            'delayMessage'     => ['nullable', 'integer', 'min:0'],
            'unknownMessage'   => ['nullable', 'string'],
            'listeningFromMe'  => ['nullable', 'boolean'],
            'stopBotFromMe'    => ['nullable', 'boolean'],
            'keepOpen'         => ['nullable', 'boolean'],
            'debounceTime'     => ['nullable', 'integer', 'min:0'],
            'triggerType'      => ['nullable', 'in:all,keyword'],
            'triggerOperator'  => ['nullable', 'in:contains,equals,startsWith,endsWith,regex'],
            'triggerValue'     => ['nullable', 'string'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->typebotService->create($instance, $data);

        return response()->json($result, 201);
    }

    /**
     * GET /api/typebot/find/{instanceName}
     */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        return response()->json($this->typebotService->find($instance));
    }

    /**
     * GET /api/typebot/findOne/{instanceName}/{typebotId}
     */
    public function findOne(Request $request, string $instanceName, string $typebotId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $result   = $this->typebotService->findOne($instance, $typebotId);

        if (!$result) {
            return response()->json(['error' => 'Typebot not found'], 404);
        }

        return response()->json(['typebot' => $result]);
    }

    /**
     * PUT /api/typebot/update/{instanceName}/{typebotId}
     */
    public function update(Request $request, string $instanceName, string $typebotId): JsonResponse
    {
        $data     = $request->only(['enabled', 'expire', 'keywordFinish', 'delayMessage', 'unknownMessage', 'listeningFromMe', 'triggerType', 'triggerOperator', 'triggerValue']);
        $instance = $request->get('wox_instance');

        return response()->json($this->typebotService->update($instance, $typebotId, $data));
    }

    /**
     * DELETE /api/typebot/delete/{instanceName}/{typebotId}
     */
    public function delete(Request $request, string $instanceName, string $typebotId): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $deleted  = $this->typebotService->delete($instance, $typebotId);

        return response()->json(['deleted' => $deleted]);
    }
}
