<?php

use App\Http\Controllers\Api\WordPressController;
use App\Http\Middleware\ApiKeyAuth;
use App\Http\Middleware\ResolveInstance;
use Illuminate\Support\Facades\Route;
use Spatie\Health\Http\Controllers\HealthCheckResultsController;

/*
|--------------------------------------------------------------------------
| Wox-Lv API Routes
| Mirrors Wox-Ox (Evolution API) endpoint structure exactly.
| Authentication: apikey header (global or instance-level token)
|--------------------------------------------------------------------------
*/

// ─── Health Check (no auth) ───────────────────────────────────
Route::get('/', function () {
    return response()->json([
        'status' => 200,
        'message' => 'Wox-Lv is running',
        'version' => '1.0.0',
        'docs' => url('/docs/api'),
    ]);
});

Route::get('/health', HealthCheckResultsController::class);

// ─── WhatsApp Business Webhook Verification (no auth) ─────────
Route::get('/webhook/meta', function () {
    $mode = request('hub_mode');
    $token = request('hub_verify_token');
    $challenge = request('hub_challenge');

    if ($mode === 'subscribe' && $token === config('evolution.whatsapp_business.token_webhook')) {
        return response($challenge, 200);
    }

    return response()->json(['error' => 'Verification failed'], 403);
});

// ─── Authenticated Evolution API Routes ───────────────────────
require __DIR__.'/evolution_routes.php';

// ─── Dedicated WordPress & WooCommerce API Routes ─────────────
Route::prefix('v1/wp')->middleware([ApiKeyAuth::class, ResolveInstance::class, 'throttle:wordpress'])->group(function () {
    Route::match(['get', 'post'], 'test-connection/{instanceName}', [WordPressController::class, 'testConnection']);
    Route::post('order-notification/{instanceName}', [WordPressController::class, 'sendOrderNotification']);
    Route::post('send-otp/{instanceName}', [WordPressController::class, 'sendOtp']);
    Route::post('abandoned-cart/{instanceName}', [WordPressController::class, 'sendAbandonedCart']);
    Route::post('send-message/{instanceName}', [WordPressController::class, 'sendMessage']);
});
