<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Message\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Message Controller — handles all WhatsApp message sending endpoints.
 * Delegates to MessageService for actual delivery via Evolution Bridge.
 */
class MessageController extends Controller
{
    public function __construct(
        private readonly MessageService $messageService,
    ) {}

    /**
     * POST /api/message/sendText/{instanceName}
     */
    public function sendText(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'          => ['required', 'string'],
            'text'            => ['required', 'string'],
            'delay'           => ['nullable', 'integer', 'min:0'],
            'quoted'          => ['nullable', 'array'],
            'mentionsEveryOne'=> ['nullable', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendText($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendMedia/{instanceName}
     */
    public function sendMedia(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'    => ['required', 'string'],
            'mediatype' => ['required', 'in:image,video,gif'],
            'mimetype'  => ['nullable', 'string'],
            'caption'   => ['nullable', 'string', 'max:1024'],
            'media'     => ['required', 'string'],          // URL or Base64
            'fileName'  => ['nullable', 'string', 'max:255'],
            'delay'     => ['nullable', 'integer', 'min:0'],
            'quoted'    => ['nullable', 'array'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendMedia($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendWhatsAppAudio/{instanceName}
     */
    public function sendAudio(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number' => ['required', 'string'],
            'audio'  => ['required', 'string'],             // URL or Base64
            'delay'  => ['nullable', 'integer', 'min:0'],
            'quoted' => ['nullable', 'array'],
            'ptt'    => ['nullable', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendAudio($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendDocument/{instanceName}
     */
    public function sendDocument(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'   => ['required', 'string'],
            'media'    => ['required', 'string'],
            'mimetype' => ['required', 'string'],
            'fileName' => ['required', 'string', 'max:255'],
            'caption'  => ['nullable', 'string', 'max:1024'],
            'delay'    => ['nullable', 'integer', 'min:0'],
            'quoted'   => ['nullable', 'array'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendDocument($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendLocation/{instanceName}
     */
    public function sendLocation(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'    => ['required', 'string'],
            'name'      => ['nullable', 'string', 'max:255'],
            'address'   => ['nullable', 'string', 'max:255'],
            'latitude'  => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'delay'     => ['nullable', 'integer', 'min:0'],
            'quoted'    => ['nullable', 'array'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendLocation($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendContact/{instanceName}
     */
    public function sendContact(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'            => ['required', 'string'],
            'contact'           => ['required', 'array'],
            'contact.*.fullName'=> ['required', 'string'],
            'contact.*.wuid'    => ['required', 'string'],
            'contact.*.phoneNumber' => ['required', 'string'],
            'delay'             => ['nullable', 'integer', 'min:0'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendContact($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendReaction/{instanceName}
     */
    public function sendReaction(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'key'      => ['required', 'array'],
            'key.id'   => ['required', 'string'],
            'key.remoteJid' => ['required', 'string'],
            'key.fromMe'    => ['required', 'boolean'],
            'reaction' => ['required', 'string', 'max:10'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendReaction($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendList/{instanceName}
     */
    public function sendList(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'                          => ['required', 'string'],
            'title'                           => ['required', 'string', 'max:255'],
            'description'                     => ['nullable', 'string'],
            'buttonText'                      => ['required', 'string', 'max:20'],
            'footerText'                      => ['nullable', 'string'],
            'sections'                        => ['required', 'array', 'min:1'],
            'sections.*.title'                => ['required', 'string'],
            'sections.*.rows'                 => ['required', 'array', 'min:1'],
            'sections.*.rows.*.title'         => ['required', 'string'],
            'sections.*.rows.*.rowId'         => ['required', 'string'],
            'sections.*.rows.*.description'   => ['nullable', 'string'],
            'delay'                           => ['nullable', 'integer', 'min:0'],
            'quoted'                          => ['nullable', 'array'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendList($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendButtons/{instanceName}
     */
    public function sendButtons(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'                   => ['required', 'string'],
            'title'                    => ['nullable', 'string'],
            'description'              => ['nullable', 'string'],
            'footer'                   => ['nullable', 'string'],
            'buttons'                  => ['required', 'array', 'min:1', 'max:3'],
            'buttons.*.buttonId'       => ['required', 'string'],
            'buttons.*.buttonText.displayText' => ['required', 'string'],
            'delay'                    => ['nullable', 'integer', 'min:0'],
            'quoted'                   => ['nullable', 'array'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendButtons($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendSticker/{instanceName}
     */
    public function sendSticker(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'  => ['required', 'string'],
            'sticker' => ['required', 'string'],
            'delay'   => ['nullable', 'integer', 'min:0'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendSticker($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/sendPoll/{instanceName}
     */
    public function sendPoll(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'number'          => ['required', 'string'],
            'name'            => ['required', 'string', 'max:255'],
            'selectableCount' => ['nullable', 'integer', 'min:1'],
            'values'          => ['required', 'array', 'min:2', 'max:12'],
            'values.*'        => ['required', 'string', 'max:100'],
            'delay'           => ['nullable', 'integer', 'min:0'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->sendPoll($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/updateMessage/{instanceName}
     */
    public function updateMessage(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'key'       => ['required', 'array'],
            'key.id'    => ['required', 'string'],
            'key.remoteJid' => ['required', 'string'],
            'text'      => ['required', 'string'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->updateMessage($instance, $data);

        return response()->json($result);
    }

    /**
     * DELETE /api/message/delete/{instanceName}
     */
    public function deleteForEveryone(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'key'           => ['required', 'array'],
            'key.id'        => ['required', 'string'],
            'key.remoteJid' => ['required', 'string'],
            'key.fromMe'    => ['required', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->deleteForEveryone($instance, $data);

        return response()->json($result);
    }

    /**
     * POST /api/message/readMessages/{instanceName}
     */
    public function readMessages(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'readMessages'           => ['required', 'array', 'min:1'],
            'readMessages.*.id'      => ['required', 'string'],
            'readMessages.*.remoteJid' => ['required', 'string'],
            'readMessages.*.fromMe'  => ['required', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');
        $result   = $this->messageService->readMessages($instance, $data);

        return response()->json($result);
    }
}
