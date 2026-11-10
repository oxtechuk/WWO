<?php

namespace App\Services;

use Closure;
use Exception;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

/**
 * Circuit Breaker pattern implementation for external service calls
 * (WhatsApp bridges, external webhooks, LLM APIs).
 * Prevents cascading failures when external services are down.
 */
class CircuitBreaker
{
    private const FAILURE_THRESHOLD = 5;
    private const COOLDOWN_SECONDS   = 300; // 5 minutes

    /**
     * Execute a callback protected by the circuit breaker.
     *
     * @template T
     * @param string $service Unique identifier for the external service
     * @param Closure(): T $callback
     * @return T
     * @throws ServiceUnavailableHttpException|Exception
     */
    public function call(string $service, Closure $callback)
    {
        $failuresKey = "circuit:{$service}:failures";
        $failures = (int) Cache::get($failuresKey, 0);

        if ($failures >= self::FAILURE_THRESHOLD) {
            throw new ServiceUnavailableHttpException(
                self::COOLDOWN_SECONDS,
                "Circuit breaker is OPEN for [{$service}]. Service temporarily unavailable."
            );
        }

        try {
            $result = $callback();
            if ($failures > 0) {
                Cache::forget($failuresKey);
            }
            return $result;
        } catch (Exception $e) {
            $failures++;
            Cache::put($failuresKey, $failures, self::COOLDOWN_SECONDS);
            throw $e;
        }
    }

    /**
     * Reset circuit breaker state for a service.
     */
    public function reset(string $service): void
    {
        Cache::forget("circuit:{$service}:failures");
    }

    /**
     * Check if circuit breaker is open.
     */
    public function isOpen(string $service): bool
    {
        return (int) Cache::get("circuit:{$service}:failures", 0) >= self::FAILURE_THRESHOLD;
    }
}
