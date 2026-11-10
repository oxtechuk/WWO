<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware.
 * Adds comprehensive security headers to all responses.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        $response->headers->set('X-Powered-By', 'Wox-Lv');
        $response->headers->remove('Server');

        // Only on HTTPS
        if ($request->secure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // API and SaaS JSON responses don't need CSP
        if (!str_starts_with($request->path(), 'api/') && !str_starts_with($request->path(), 'saas/')) {
            $csp = [
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://sc-static.net https://analytics.tiktok.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
                "font-src 'self' https://fonts.gstatic.com data:",
                "img-src 'self' data: blob: https:",
                "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://connect.facebook.net https://www.facebook.com https://tr.snapchat.com https://analytics.tiktok.com ws: wss: http: https:",
                "frame-src 'self' https:",
            ];

            $response->headers->set('Content-Security-Policy', implode('; ', $csp));
        }

        return $response;
    }
}
