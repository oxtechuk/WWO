<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Serving the Wox Frontend SPA Views
| Matches Wox-Ox express routing exactly.
|--------------------------------------------------------------------------
*/

$serveHtml = function (string $filename) {
    $path = public_path($filename);
    if (!File::exists($path)) {
        abort(404, "Page [{$filename}] not found");
    }
    return response(file_get_contents($path), 200, [
        'Content-Type' => 'text/html; charset=UTF-8',
    ]);
};

// Primary Landing Page as Home Route
Route::get('/', fn () => $serveHtml('landing.html'));
Route::get('/landing', fn () => $serveHtml('landing.html'));

// Authentication & Wizard Routes
Route::get('/login', fn () => $serveHtml('login.html'));
Route::get('/register', fn () => $serveHtml('register.html'));
Route::get('/wizard', fn () => $serveHtml('wizard.html'));

// Client Dashboard Routes
Route::get('/dashboard', fn () => $serveHtml('index.html'));
Route::get('/dashboard/{any}', fn () => $serveHtml('index.html'))->where('any', '.*');

// Super Admin Routes
Route::get('/admin', fn () => $serveHtml('admin.html'));
Route::get('/admin/{any}', fn () => $serveHtml('admin.html'))->where('any', '.*');

// ─── SaaS Platform API Endpoints ──────────────────────────────
Route::prefix('saas')->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])->group(function () {
    // Analytics
    Route::get('analytics/config',         [\App\Http\Controllers\SaasController::class, 'getAnalyticsConfig']);
    Route::post('analytics/config',        [\App\Http\Controllers\SaasController::class, 'saveAnalyticsConfig']);
    Route::get('admin/analytics-config',   [\App\Http\Controllers\SaasController::class, 'getAnalyticsConfig']);
    Route::post('admin/analytics-config',  [\App\Http\Controllers\SaasController::class, 'saveAnalyticsConfig']);

    // Site & SEO Settings
    Route::get('site-settings',            [\App\Http\Controllers\SaasController::class, 'getSiteSettings']);
    Route::post('site-settings',           [\App\Http\Controllers\SaasController::class, 'saveSiteSettings']);
    Route::get('admin/site-settings',      [\App\Http\Controllers\SaasController::class, 'getSiteSettings']);
    Route::post('admin/site-settings',     [\App\Http\Controllers\SaasController::class, 'saveSiteSettings']);

    // Media & Image Uploads
    Route::post('upload-media',            [\App\Http\Controllers\SaasController::class, 'uploadMedia']);
    Route::post('upload-image',            [\App\Http\Controllers\SaasController::class, 'uploadMedia']);

    // Plans
    Route::get('plans',                    [\App\Http\Controllers\SaasController::class, 'getPlans']);

    // Authentication
    Route::post('auth/register',           [\App\Http\Controllers\SaasController::class, 'register']);
    Route::post('auth/login',              [\App\Http\Controllers\SaasController::class, 'login']);
    Route::post('auth/refresh',            [\App\Http\Controllers\SaasController::class, 'refresh']);
    Route::get('auth/me',                  [\App\Http\Controllers\SaasController::class, 'me']);

    // Tenant Data (Templates, Contacts, Automations)
    Route::get('data',                                     [\App\Http\Controllers\SaasController::class, 'getTenantData']);
    Route::get('templates/{tenantId?}',                    [\App\Http\Controllers\SaasController::class, 'getTemplates']);
    Route::post('templates/{tenantId?}',                   [\App\Http\Controllers\SaasController::class, 'saveTemplate']);
    Route::delete('templates/{tenantId}/{id}',             [\App\Http\Controllers\SaasController::class, 'deleteTemplate']);

    Route::get('contacts/{tenantId?}',                     [\App\Http\Controllers\SaasController::class, 'getContacts']);
    Route::post('contacts/{tenantId?}',                    [\App\Http\Controllers\SaasController::class, 'saveContact']);
    Route::delete('contacts/{tenantId}/{id}',              [\App\Http\Controllers\SaasController::class, 'deleteContact']);

    Route::get('automation/rules/{tenantId?}',             [\App\Http\Controllers\SaasController::class, 'getAutomationRules']);
    Route::post('automation/rules/{tenantId?}',            [\App\Http\Controllers\SaasController::class, 'saveAutomationRule']);
    Route::delete('automation/rules/{tenantId}/{id}',      [\App\Http\Controllers\SaasController::class, 'deleteAutomationRule']);

    // WhatsApp Marketing Campaigns
    Route::post('campaigns/test-send',                     [\App\Http\Controllers\SaasController::class, 'testCampaign']);
    Route::get('campaigns/{tenantId?}',                    [\App\Http\Controllers\SaasController::class, 'getCampaigns']);
    Route::post('campaigns/{tenantId?}',                   [\App\Http\Controllers\SaasController::class, 'saveCampaign']);
    Route::delete('campaigns/{tenantId}/{id}',             [\App\Http\Controllers\SaasController::class, 'deleteCampaign']);
    Route::post('campaigns/{tenantId}/{id}/launch',        [\App\Http\Controllers\SaasController::class, 'launchCampaign']);
    Route::post('campaigns/{tenantId}/{id}/pause',         [\App\Http\Controllers\SaasController::class, 'pauseCampaign']);
    Route::post('campaigns/{tenantId}/{id}/resume',        [\App\Http\Controllers\SaasController::class, 'resumeCampaign']);

    // Super Admin
    Route::get('admin/overview',                           [\App\Http\Controllers\SaasController::class, 'adminOverview']);
    Route::get('admin/tenants',                            [\App\Http\Controllers\SaasController::class, 'adminTenants']);
    Route::get('admin/numbers',                            [\App\Http\Controllers\SaasController::class, 'adminNumbers']);
    Route::get('admin/invoices',                           [\App\Http\Controllers\SaasController::class, 'adminInvoices']);
});

// ─── Evolution API Direct Root Routes (for Wox Frontend) ──────
Route::withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
    ->group(__DIR__ . '/evolution_routes.php');

