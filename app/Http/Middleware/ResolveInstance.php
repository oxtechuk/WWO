<?php

namespace App\Http\Middleware;

use App\Models\Instance;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Instance Resolution Middleware.
 * Resolves {instanceName} route param → Instance model and injects into request.
 * Also enforces multi-tenant isolation: non-global keys can only access their own instance.
 */
class ResolveInstance
{
    public function handle(Request $request, Closure $next): Response
    {
        $instanceName = $request->route('instanceName');

        if (!$instanceName) {
            return $next($request);
        }

        $instance = Instance::where('name', $instanceName)->first();

        if (!$instance) {
            return response()->json([
                'status'  => 404,
                'error'   => 'Not Found',
                'message' => "Instance '{$instanceName}' not found",
                'response' => [
                    'message' => "Instance '{$instanceName}' not found",
                    'error'   => 'Not Found',
                ],
            ], 404);
        }

        // Multi-tenant isolation: if not global key, must own the instance
        if (!$request->get('wox_is_global_key')) {
            $requestInstance = $request->get('wox_instance');
            if (!$requestInstance || $requestInstance->id !== $instance->id) {
                return response()->json([
                    'status'  => 403,
                    'error'   => 'Forbidden',
                    'message' => 'Access denied to this instance',
                ], 403);
            }
        }

        $request->merge(['wox_instance' => $instance]);

        return $next($request);
    }
}
