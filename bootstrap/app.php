<?php

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ── Global Middleware ──────────────────────────────────────
        $middleware->append(SecurityHeaders::class);

        // ── API Middleware Group ───────────────────────────────────
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // ── Rate Limiting ──────────────────────────────────────────
        $middleware->throttleApi(limiter: 'api');

        // ── CSRF Exemption for API and SaaS endpoints ─────────────
        $middleware->validateCsrfTokens(except: [
            'instance/*',
            'message/*',
            'chat/*',
            'webhook/*',
            'settings/*',
            'typebot/*',
            'openai/*',
            'dify/*',
            'n8n/*',
            'flowise/*',
            'chatwoot/*',
            'group/*',
            'label/*',
            'saas/*',
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn(Request $request) =>
            $request->is('api/*') ||
            $request->is('instance/*') ||
            $request->is('message/*') ||
            $request->is('chat/*') ||
            $request->is('webhook/*') ||
            $request->is('saas/*') ||
            $request->is('settings/*') ||
            $request->is('typebot/*') ||
            $request->is('openai/*') ||
            $request->is('dify/*') ||
            $request->is('n8n/*') ||
            $request->is('flowise/*') ||
            $request->is('chatwoot/*') ||
            $request->is('group/*') ||
            $request->is('label/*') ||
            $request->expectsJson();

        // Always return JSON for API routes
        $exceptions->shouldRenderJsonWhen($isApi);

        // Custom JSON error format — matches Wox-Ox response structure
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json([
                    'status'   => 400,
                    'error'    => 'Validation Error',
                    'message'  => 'Request validation failed',
                    'response' => [
                        'message'  => 'Request validation failed',
                        'error'    => $e->errors(),
                    ],
                ], 400);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json([
                    'status'  => 404,
                    'error'   => 'Not Found',
                    'message' => 'Resource not found',
                ], 404);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) use ($isApi) {
            if ($isApi($request) && !config('app.debug')) {
                return response()->json([
                    'status'  => 500,
                    'error'   => 'Internal Server Error',
                    'message' => 'An unexpected error occurred.',
                ], 500);
            }
        });
    })->create();
