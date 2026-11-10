<?php

use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ChatwootController;
use App\Http\Controllers\Api\DifyController;
use App\Http\Controllers\Api\FlowiseController;
use App\Http\Controllers\Api\InstanceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\N8nController;
use App\Http\Controllers\Api\OpenAiController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TypebotController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Middleware\ApiKeyAuth;
use App\Http\Middleware\ResolveInstance;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Evolution API Core Endpoints
| Shared between /api/* (API clients) and /* (Frontend / SPA direct calls)
|--------------------------------------------------------------------------
*/

Route::middleware([ApiKeyAuth::class])->group(function () {

    // ── Instance Management ──────────────────────────────────────
    Route::prefix('instance')->group(function () {
        Route::post('create', [InstanceController::class, 'create']);
        Route::get('fetchInstances', [InstanceController::class, 'fetchInstances']);

        Route::middleware(ResolveInstance::class)->group(function () {
            Route::get('connect/{instanceName}',          [InstanceController::class, 'connect']);
            Route::get('restart/{instanceName}',          [InstanceController::class, 'restart']);
            Route::get('logout/{instanceName}',           [InstanceController::class, 'logout']);
            Route::delete('delete/{instanceName}',        [InstanceController::class, 'delete']);
            Route::get('connectionState/{instanceName}',  [InstanceController::class, 'connectionState']);
            Route::put('setPresence/{instanceName}',      [InstanceController::class, 'setPresence']);
        });
    });

    // ── Message Routes ────────────────────────────────────────────
    Route::prefix('message')->middleware(ResolveInstance::class)->group(function () {
        Route::post('sendText/{instanceName}',           [MessageController::class, 'sendText']);
        Route::post('sendMedia/{instanceName}',          [MessageController::class, 'sendMedia']);
        Route::post('sendWhatsAppAudio/{instanceName}',  [MessageController::class, 'sendAudio']);
        Route::post('sendDocument/{instanceName}',       [MessageController::class, 'sendDocument']);
        Route::post('sendLocation/{instanceName}',       [MessageController::class, 'sendLocation']);
        Route::post('sendContact/{instanceName}',        [MessageController::class, 'sendContact']);
        Route::post('sendReaction/{instanceName}',       [MessageController::class, 'sendReaction']);
        Route::post('sendList/{instanceName}',           [MessageController::class, 'sendList']);
        Route::post('sendButtons/{instanceName}',        [MessageController::class, 'sendButtons']);
        Route::post('sendSticker/{instanceName}',        [MessageController::class, 'sendSticker']);
        Route::post('sendPoll/{instanceName}',           [MessageController::class, 'sendPoll']);
        Route::put('updateMessage/{instanceName}',       [MessageController::class, 'updateMessage']);
        Route::delete('delete/{instanceName}',           [MessageController::class, 'deleteForEveryone']);
        Route::post('readMessages/{instanceName}',       [MessageController::class, 'readMessages']);
    });

    // ── Chat Routes ───────────────────────────────────────────────
    Route::prefix('chat')->middleware(ResolveInstance::class)->group(function () {
        Route::get('findChats/{instanceName}',        [ChatController::class, 'findChats']);
        Route::get('findMessages/{instanceName}',     [ChatController::class, 'findMessages']);
        Route::get('findContacts/{instanceName}',     [ChatController::class, 'findContacts']);
        Route::delete('deleteMessage/{instanceName}', [ChatController::class, 'deleteMessage']);
    });

    // ── Webhook Routes ────────────────────────────────────────────
    Route::prefix('webhook')->middleware(ResolveInstance::class)->group(function () {
        Route::post('set/{instanceName}',  [WebhookController::class, 'set']);
        Route::get('find/{instanceName}',  [WebhookController::class, 'find']);
    });

    // ── Settings Routes ───────────────────────────────────────────
    Route::prefix('settings')->middleware(ResolveInstance::class)->group(function () {
        Route::post('set/{instanceName}',  [SettingsController::class, 'set']);
        Route::get('find/{instanceName}',  [SettingsController::class, 'find']);
    });

    // ── Typebot Routes ────────────────────────────────────────────
    Route::prefix('typebot')->middleware(ResolveInstance::class)->group(function () {
        Route::post('create/{instanceName}',               [TypebotController::class, 'create']);
        Route::get('find/{instanceName}',                  [TypebotController::class, 'find']);
        Route::get('findOne/{instanceName}/{typebotId}',   [TypebotController::class, 'findOne']);
        Route::put('update/{instanceName}/{typebotId}',    [TypebotController::class, 'update']);
        Route::delete('delete/{instanceName}/{typebotId}', [TypebotController::class, 'delete']);
    });

    // ── OpenAI Routes ─────────────────────────────────────────────
    Route::prefix('openai')->middleware(ResolveInstance::class)->group(function () {
        Route::post('creds/create/{instanceName}',         [OpenAiController::class, 'createCreds']);
        Route::get('creds/{instanceName}',                 [OpenAiController::class, 'findCreds']);
        Route::delete('creds/{instanceName}/{credId}',     [OpenAiController::class, 'deleteCreds']);
        Route::post('create/{instanceName}',               [OpenAiController::class, 'create']);
        Route::get('find/{instanceName}',                  [OpenAiController::class, 'find']);
        Route::get('findOne/{instanceName}/{botId}',       [OpenAiController::class, 'findOne']);
        Route::put('update/{instanceName}/{botId}',        [OpenAiController::class, 'update']);
        Route::delete('delete/{instanceName}/{botId}',     [OpenAiController::class, 'delete']);
    });

    // ── Dify Routes ───────────────────────────────────────────────
    Route::prefix('dify')->middleware(ResolveInstance::class)->group(function () {
        Route::post('create/{instanceName}',               [DifyController::class, 'create']);
        Route::get('find/{instanceName}',                  [DifyController::class, 'find']);
        Route::get('findOne/{instanceName}/{difyId}',      [DifyController::class, 'findOne']);
        Route::put('update/{instanceName}/{difyId}',       [DifyController::class, 'update']);
        Route::delete('delete/{instanceName}/{difyId}',    [DifyController::class, 'delete']);
    });

    // ── N8N Routes ────────────────────────────────────────────────
    Route::prefix('n8n')->middleware(ResolveInstance::class)->group(function () {
        Route::post('create/{instanceName}',               [N8nController::class, 'create']);
        Route::get('find/{instanceName}',                  [N8nController::class, 'find']);
        Route::get('findOne/{instanceName}/{n8nId}',       [N8nController::class, 'findOne']);
        Route::put('update/{instanceName}/{n8nId}',        [N8nController::class, 'update']);
        Route::delete('delete/{instanceName}/{n8nId}',     [N8nController::class, 'delete']);
    });

    // ── Flowise Routes ────────────────────────────────────────────
    Route::prefix('flowise')->middleware(ResolveInstance::class)->group(function () {
        Route::post('create/{instanceName}',               [FlowiseController::class, 'create']);
        Route::get('find/{instanceName}',                  [FlowiseController::class, 'find']);
        Route::get('findOne/{instanceName}/{flowiseId}',   [FlowiseController::class, 'findOne']);
        Route::put('update/{instanceName}/{flowiseId}',    [FlowiseController::class, 'update']);
        Route::delete('delete/{instanceName}/{flowiseId}', [FlowiseController::class, 'delete']);
    });

    // ── Chatwoot Routes ───────────────────────────────────────────
    Route::prefix('chatwoot')->middleware(ResolveInstance::class)->group(function () {
        Route::post('set/{instanceName}',  [ChatwootController::class, 'set']);
        Route::get('find/{instanceName}',  [ChatwootController::class, 'find']);
    });

    // ── Group Routes ──────────────────────────────────────────────
    Route::prefix('group')->middleware(ResolveInstance::class)->group(function () {
        Route::post('create/{instanceName}',               fn () => response()->json(['status' => 'bridge_required'], 501));
        Route::get('fetchAllGroups/{instanceName}',        fn () => response()->json(['groups' => []]));
        Route::get('findGroupInfos/{instanceName}',        fn () => response()->json(['group' => null]));
        Route::put('updateGroupSubject/{instanceName}',    fn () => response()->json(['update' => true]));
        Route::put('updateGroupDescription/{instanceName}',fn () => response()->json(['update' => true]));
        Route::post('inviteCode/{instanceName}',           fn () => response()->json(['inviteCode' => null]));
        Route::post('revokeInviteCode/{instanceName}',     fn () => response()->json(['revoked' => true]));
        Route::post('updateParticipant/{instanceName}',    fn () => response()->json(['updated' => true]));
        Route::post('updateSetting/{instanceName}',        fn () => response()->json(['updated' => true]));
        Route::put('toggleEphemeral/{instanceName}',       fn () => response()->json(['updated' => true]));
        Route::delete('leaveGroup/{instanceName}',         fn () => response()->json(['left' => true]));
    });

    // ── Label Routes ──────────────────────────────────────────────
    Route::prefix('label')->middleware(ResolveInstance::class)->group(function () {
        Route::get('findLabels/{instanceName}',            fn () => response()->json(['labels' => []]));
        Route::post('handleLabel/{instanceName}',          fn () => response()->json(['label' => true]));
    });
});
