<?php

namespace App\Services\Cache;

use App\Models\Instance;
use Illuminate\Support\Facades\Cache;

/**
 * Instance Cache Service.
 * Reduces DB queries by caching instance data.
 * TTL matches Wox-Ox Redis TTL: 7 days.
 */
class InstanceCacheService
{
    private const TTL = 604800; // 7 days in seconds

    public function getInstance(string $name): ?Instance
    {
        return Cache::remember(
            $this->key($name),
            self::TTL,
            fn() => Instance::where('name', $name)->first()
        );
    }

    public function invalidate(string $name): void
    {
        Cache::forget($this->key($name));
    }

    public function invalidateAll(): void
    {
        // Flush only wox_lv prefixed keys if using Redis tags
        Cache::flush();
    }

    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        return Cache::remember("wox_lv:{$key}", $ttl, $callback);
    }

    public function forget(string $key): void
    {
        Cache::forget("wox_lv:{$key}");
    }

    private function key(string $name): string
    {
        return "wox_lv:instance:{$name}";
    }
}
