<?php

namespace App\Http\Middleware;

use App\Models\Instance;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * API Key Authentication Middleware.
 * Mirrors Wox-Ox auth.guard.ts exactly — supports global key & instance-level key.
 */
class ApiKeyAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $this->extractApiKey($request);

        if (!$apiKey) {
            return $this->unauthorized('API key is required. Provide via apikey header.');
        }

        // 1. Check global API key
        if ($apiKey === config('evolution.authentication.api_key')) {
            $request->merge(['wox_is_global_key' => true]);
            return $next($request);
        }

        // 2. Check instance-level token
        $instance = Instance::where('token', $apiKey)->first();

        if ($instance) {
            $request->merge([
                'wox_instance'        => $instance,
                'wox_is_global_key'   => false,
            ]);
            return $next($request);
        }

        return $this->unauthorized('Unauthorized');
    }

    private function extractApiKey(Request $request): ?string
    {
        // Support multiple ways — same as Wox-Ox
        return $request->header('apikey')
            ?? $request->header('Authorization')
            ?? $request->query('apikey');
    }

    private function unauthorized(string $message): Response
    {
        return response()->json([
            'status'  => 401,
            'error'   => 'Unauthorized',
            'message' => $message,
            'response' => [
                'message' => $message,
                'error'   => 'Unauthorized',
            ],
        ], 401);
    }
}
