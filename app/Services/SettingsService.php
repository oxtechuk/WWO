<?php

namespace App\Services;

use App\Models\Instance;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

/**
 * Settings Service — manages per-instance WhatsApp settings.
 */
class SettingsService
{
    /**
     * Create or update settings for an instance.
     */
    public function set(Instance $instance, array $data): Setting
    {
        $setting = Setting::updateOrCreate(
            ['instanceId' => $instance->id],
            array_filter([
                'rejectCall'      => $data['rejectCall'] ?? null,
                'msgCall'         => $data['msgCall'] ?? null,
                'groupsIgnore'    => $data['groupsIgnore'] ?? null,
                'alwaysOnline'    => $data['alwaysOnline'] ?? null,
                'readMessages'    => $data['readMessages'] ?? null,
                'readStatus'      => $data['readStatus'] ?? null,
                'syncFullHistory' => $data['syncFullHistory'] ?? null,
            ], fn($v) => !is_null($v))
        );

        Log::info('Settings updated', ['instance' => $instance->name]);

        return $setting;
    }

    /**
     * Find settings for an instance.
     */
    public function find(Instance $instance): ?Setting
    {
        return $instance->setting;
    }
}
