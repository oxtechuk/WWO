<?php

namespace App\Traits;

/**
 * Provides API Key authentication helper methods for controllers.
 */
trait HasApiKey
{
    /**
     * Get the resolved instance from the current request.
     */
    protected function getInstance(): ?\App\Models\Instance
    {
        return request()->get('wox_instance');
    }

    /**
     * Get the API key from the current request headers.
     */
    protected function getApiKey(): ?string
    {
        return request()->header('apikey')
            ?? request()->header('Authorization')
            ?? request()->query('apikey');
    }

    /**
     * Check if the current request uses the global API key.
     */
    protected function isGlobalKey(): bool
    {
        return $this->getApiKey() === config('evolution.authentication.api_key');
    }
}
