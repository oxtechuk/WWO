<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Settings Controller — manages per-instance WhatsApp configuration.
 */
class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    /**
     * POST /api/settings/set/{instanceName}
     */
    public function set(Request $request, string $instanceName): JsonResponse
    {
        $data = $request->validate([
            'rejectCall'      => ['nullable', 'boolean'],
            'msgCall'         => ['nullable', 'string', 'max:500'],
            'groupsIgnore'    => ['nullable', 'boolean'],
            'alwaysOnline'    => ['nullable', 'boolean'],
            'readMessages'    => ['nullable', 'boolean'],
            'readStatus'      => ['nullable', 'boolean'],
            'syncFullHistory' => ['nullable', 'boolean'],
        ]);

        $instance = $request->get('wox_instance');
        $setting  = $this->settingsService->set($instance, $data);

        return response()->json([
            'settings' => [
                'instanceName' => $instanceName,
                'settings'     => $setting,
            ],
        ]);
    }

    /**
     * GET /api/settings/find/{instanceName}
     */
    public function find(Request $request, string $instanceName): JsonResponse
    {
        $instance = $request->get('wox_instance');
        $setting  = $this->settingsService->find($instance);

        return response()->json([
            'settings' => $setting,
        ]);
    }
}
