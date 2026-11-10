<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Contact;
use App\Models\Message;
use App\Traits\HasApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Chat Controller — retrieves chats, messages and contacts for an instance.
 */
class ChatController extends Controller
{
    use HasApiKey;

    /**
     * GET /api/chat/findChats/{instanceName}
     */
    public function findChats(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');

        $chats = Chat::where('instanceId', $instance->id)
            ->when($request->query('remoteJid'), fn($q, $jid) => $q->where('remoteJid', $jid))
            ->orderBy('updatedAt', 'desc')
            ->paginate($request->integer('limit', 50));

        return response()->json($chats);
    }

    /**
     * GET /api/chat/findMessages/{instanceName}
     */
    public function findMessages(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');

        $messages = Message::where('instanceId', $instance->id)
            ->when($request->query('remoteJid'), function ($q, $jid) {
                $q->whereJsonContains('key->remoteJid', $jid);
            })
            ->orderBy('messageTimestamp', 'desc')
            ->paginate($request->integer('limit', 20));

        return response()->json($messages);
    }

    /**
     * GET /api/chat/findContacts/{instanceName}
     */
    public function findContacts(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');

        $contacts = Contact::where('instanceId', $instance->id)
            ->when($request->query('remoteJid'), fn($q, $jid) => $q->where('remoteJid', $jid))
            ->when($request->query('pushName'), fn($q, $name) => $q->where('pushName', 'like', "%{$name}%"))
            ->paginate($request->integer('limit', 50));

        return response()->json($contacts);
    }

    /**
     * DELETE /api/chat/deleteMessage/{instanceName}
     */
    public function deleteMessage(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'id'        => ['required', 'string'],
            'remoteJid' => ['required', 'string'],
            'fromMe'    => ['required', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');

        Message::where('instanceId', $instance->id)
            ->whereJsonContains('key->id', $data['id'])
            ->delete();

        return response()->json(['del' => true]);
    }
}
