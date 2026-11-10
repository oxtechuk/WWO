<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * SaasController — handles SaaS frontend endpoints:
 * Analytics, Branding/Site-settings, Authentication, Tenant Data, and Super Admin.
 */
class SaasController extends Controller
{
    private string $storeDir;
    private string $analyticsPath;
    private string $siteSettingsPath;

    public function __construct(
        private readonly ?\App\Services\CampaignService $campaignService = null,
    )
    {
        $this->storeDir = storage_path('store');
        if (!File::isDirectory($this->storeDir)) {
            File::makeDirectory($this->storeDir, 0755, true, true);
        }
        $this->analyticsPath = $this->storeDir . DIRECTORY_SEPARATOR . 'analytics-config.json';
        $this->siteSettingsPath = $this->storeDir . DIRECTORY_SEPARATOR . 'site-settings.json';
    }

    // ─── Analytics Config ─────────────────────────────────────────

    public function getAnalyticsConfig(): JsonResponse
    {
        $config = [
            'gaMeasurementId'    => env('GA_MEASUREMENT_ID', 'G-WOXWHATSAPP'),
            'metaPixelId'        => env('META_PIXEL_ID', '123456789012345'),
            'snapchatPixelId'    => env('SNAP_PIXEL_ID', 'snap-wox-saudi-001'),
            'tiktokPixelId'      => env('TIKTOK_PIXEL_ID', 'tt-wox-ecommerce-001'),
            'googleTagManagerId' => env('GTM_ID', ''),
            'enabled'            => true,
        ];

        if (File::exists($this->analyticsPath)) {
            $saved = json_decode(File::get($this->analyticsPath), true);
            if (is_array($saved)) {
                $config = array_merge($config, $saved);
            }
        }

        return response()->json(['status' => 'success', 'data' => $config]);
    }

    public function saveAnalyticsConfig(Request $request): JsonResponse
    {
        $current = $this->getAnalyticsConfig()->getData(true)['data'];
        $updated = [
            'gaMeasurementId'    => $request->input('gaMeasurementId', $current['gaMeasurementId']),
            'metaPixelId'        => $request->input('metaPixelId', $current['metaPixelId']),
            'snapchatPixelId'    => $request->input('snapchatPixelId', $current['snapchatPixelId']),
            'tiktokPixelId'      => $request->input('tiktokPixelId', $current['tiktokPixelId']),
            'googleTagManagerId' => $request->input('googleTagManagerId', $current['googleTagManagerId']),
            'enabled'            => $request->has('enabled') ? (bool) $request->input('enabled') : $current['enabled'],
        ];

        File::put($this->analyticsPath, json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json([
            'status'  => 'success',
            'message' => 'تم تحديث إعدادات التتبع والبكسل بنجاح',
            'data'    => $updated,
        ]);
    }

    // ─── Site & SEO Settings ──────────────────────────────────────

    public function getSiteSettings(): JsonResponse
    {
        $defaults = [
            'siteName'           => 'Wox WhatsApp',
            'siteTagline'        => 'بوابة إرسال رسائل الواتساب والربط السحابي للمتاجر والشركات',
            'logoUrl'            => '/images/wox-logo.svg',
            'logoDarkUrl'        => '/images/wox-logo-dark.svg',
            'faviconUrl'         => '/favicon.ico',
            'seoTitle'           => 'Wox WhatsApp | بوابة الواتساب السحابية وحلول الربط الذكي',
            'seoDescription'     => 'المنصة الرائدة لربط الواتساب بمتجرك وووكومرس وتطبيقاتك: إشعارات الطلبات اللحظية، استرجاع السلات المتروكة، بوتات ذكاء اصطناعي وأرقام افتراضية.',
            'seoKeywords'        => 'واتساب, ووكومرس, ربط واتساب, سلات متروكة, تسويق واتساب, لارافيل, wox, whatsapp api',
            'ogImageUrl'         => '/images/wox-og-cover.png',
            'canonicalUrl'       => config('app.url', 'http://localhost:8001'),
            'robots'             => 'index, follow',
            'contactEmail'       => 'support@oxtech.com',
            'contactPhone'       => '+966500000000',
            'footerText'         => 'جميع الحقوق محفوظة © Wox WhatsApp - إحدى منصات Ox Tech',
            'customHeaderCode'   => '',
            'customFooterCode'   => '',
            'heroVideoUrl'       => '',
            'heroVideoPlacement' => 'full',
            'heroVideoAutoplay'  => true,
        ];

        if (File::exists($this->siteSettingsPath)) {
            $saved = json_decode(File::get($this->siteSettingsPath), true);
            if (is_array($saved)) {
                $defaults = array_merge($defaults, $saved);
            }
        }

        return response()->json(['status' => 'success', 'data' => $defaults]);
    }

    public function saveSiteSettings(Request $request): JsonResponse
    {
        $current = $this->getSiteSettings()->getData(true)['data'];
        $updated = array_merge($current, $request->all());

        File::put($this->siteSettingsPath, json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json([
            'status'  => 'success',
            'message' => 'تم حفظ إعدادات الموقع، اللوجو و SEO بنجاح',
            'data'    => $updated,
        ]);
    }

    // ─── Media & Image Upload ─────────────────────────────────────

    public function uploadMedia(Request $request): JsonResponse
    {
        $base64 = $request->input('base64');
        $fileName = $request->input('fileName', 'upload');

        if (!$base64) {
            return response()->json(['status' => 'error', 'message' => 'لم يتم إرسال بيانات الملف'], 400);
        }

        // Enforce max upload size (~10MB binary, 14MB base64)
        if (strlen($base64) > 15 * 1024 * 1024) {
            return response()->json(['status' => 'error', 'message' => 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت)'], 422);
        }

        $ext = 'png';
        if (preg_match('/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/', $base64, $matches)) {
            $mime = strtolower($matches[1]);
            if (str_contains($mime, 'svg')) $ext = 'svg';
            elseif (str_contains($mime, 'jpeg') || str_contains($mime, 'jpg')) $ext = 'jpg';
            elseif (str_contains($mime, 'webp')) $ext = 'webp';
            elseif (str_contains($mime, 'ico') || str_contains($mime, 'x-icon')) $ext = 'ico';
            elseif (str_contains($mime, 'mp4')) $ext = 'mp4';
            elseif (str_contains($mime, 'webm')) $ext = 'webm';
            $data = base64_decode($matches[2]);
        } else {
            $data = base64_decode($base64);
        }

        if ($data === false) {
            return response()->json(['status' => 'error', 'message' => 'فشل فك تشفير بيانات الملف'], 400);
        }

        // Sanitize SVG against stored XSS
        if ($ext === 'svg') {
            if (preg_match('/<script|onload|onerror|javascript:|onclick/i', $data)) {
                return response()->json(['status' => 'error', 'message' => 'الملف يحتوي على كود غير آمن وتم رفضه'], 422);
            }
        }

        $uploadsDir = public_path('uploads');
        if (!File::isDirectory($uploadsDir)) {
            File::makeDirectory($uploadsDir, 0755, true, true);
        }

        $cleanBase = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($fileName, PATHINFO_FILENAME));
        $cleanBase = substr($cleanBase, 0, 30) ?: 'upload';
        $finalName = "{$cleanBase}-" . time() . ".{$ext}";
        File::put($uploadsDir . DIRECTORY_SEPARATOR . $finalName, $data);

        return response()->json([
            'status'  => 'success',
            'url'     => "/uploads/{$finalName}",
            'message' => 'تم رفع الملف بنجاح',
        ]);
    }

    // ─── Plans ────────────────────────────────────────────────────

    public function getPlans(): JsonResponse
    {
        $plans = [
            [
                'id'            => 'starter',
                'name'          => 'Starter',
                'nameAr'        => 'الباقة الأساسية',
                'description'   => 'مثالية للمتاجر الناشئة وأصحاب الأعمال الفردية',
                'priceSAR'      => 99,
                'priceEGP'      => 1200,
                'priceUSD'      => 29,
                'instanceLimit' => 1,
                'messageLimit'  => 5000,
                'aiBotsLimit'   => 1,
                'hasWebhooks'   => true,
            ],
            [
                'id'            => 'pro',
                'name'          => 'Professional',
                'nameAr'        => 'الباقة المتقدمة',
                'description'   => 'للمتاجر سريعة النمو التي تحتاج أتمتة كاملة وبوت ذكي',
                'priceSAR'      => 249,
                'priceEGP'      => 3200,
                'priceUSD'      => 69,
                'instanceLimit' => 3,
                'messageLimit'  => 25000,
                'aiBotsLimit'   => 3,
                'hasWebhooks'   => true,
            ],
            [
                'id'            => 'enterprise',
                'name'          => 'Enterprise',
                'nameAr'        => 'باقة الشركات',
                'description'   => 'للشركات والمتاجر الكبرى مع دعم VIP وأرقام غير محدودة',
                'priceSAR'      => 599,
                'priceEGP'      => 7500,
                'priceUSD'      => 159,
                'instanceLimit' => 10,
                'messageLimit'  => 100000,
                'aiBotsLimit'   => 10,
                'hasWebhooks'   => true,
            ],
        ];

        return response()->json(['status' => 'success', 'data' => $plans]);
    }

    // ─── Authentication ───────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        $email = strtolower(trim($request->input('email')));
        $existing = User::where('email', $email)->first();
        if ($existing) {
            return response()->json(['status' => 'error', 'message' => 'البريد الإلكتروني مسجل بالفعل'], 409);
        }

        $user = User::create([
            'name'     => $request->input('name'),
            'email'    => $email,
            'password' => Hash::make($request->input('password')),
        ]);

        $token = Str::random(64);

        return response()->json([
            'status'  => 'success',
            'message' => 'تم تسجيل الحساب بنجاح وتفعيل التجربة المجانية لمدة 14 يوماً!',
            'data'    => [
                'user'   => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => 'CLIENT'],
                'tenant' => ['id' => 'tenant_' . $user->id, 'name' => $user->name . "'s Workspace", 'country' => 'SA', 'currency' => 'SAR'],
                'tokens' => ['accessToken' => $token, 'refreshToken' => Str::random(64)],
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($request->input('email')));
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        // Default admin fallback — ONLY permitted in local development environment
        if (!$user && app()->isLocal() && ($email === 'admin@wox.com' || $email === 'admin@oxtech.com')) {
            $user = User::create([
                'name'     => 'Super Admin',
                'email'    => $email,
                'password' => Hash::make('Admin@123456'),
            ]);
        }

        if (!$user || !Hash::check($password, $user->password)) {
            // Also accept plain admin password if initial setup in local environment only
            if (app()->isLocal() && $user && $password === 'Admin@123456') {
                // allow in local testing
            } else {
                return response()->json(['status' => 'error', 'message' => 'بيانات الدخول غير صحيحة'], 401);
            }
        }

        $token = Str::random(64);
        $role = str_contains($user->email, 'admin') ? 'ADMIN' : 'CLIENT';

        return response()->json([
            'status'  => 'success',
            'message' => 'تم تسجيل الدخول بنجاح',
            'data'    => [
                'user'   => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $role],
                'tenant' => ['id' => 'tenant_' . $user->id, 'name' => $user->name . "'s Workspace", 'country' => 'SA', 'currency' => 'SAR'],
                'tokens' => ['accessToken' => $token, 'refreshToken' => Str::random(64)],
            ],
        ]);
    }

    public function refresh(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => ['tokens' => ['accessToken' => Str::random(64), 'refreshToken' => Str::random(64)]],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'    => '1',
                'name'  => 'Admin User',
                'email' => 'admin@oxtech.com',
                'role'  => 'ADMIN',
            ],
        ]);
    }

    // ─── Tenant Data (Templates, Contacts, Rules) ─────────────────

    private function getTenantFilePath(string $tenantId): string
    {
        $safeId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $tenantId ?: 'default');
        return $this->storeDir . DIRECTORY_SEPARATOR . "tenant-{$safeId}.json";
    }

    private function readTenantData(string $tenantId): array
    {
        $file = $this->getTenantFilePath($tenantId);
        if (File::exists($file)) {
            $data = json_decode(File::get($file), true);
            if (is_array($data)) return $data;
        }

        return [
            'templates' => [
                ['id' => '1', 'code' => 'order_confirmation', 'title' => 'تأكيد الطلب', 'text' => 'تم تأكيد طلبك رقم {{order_id}} بنجاح، جاري التجهيز للشحن.'],
                ['id' => '2', 'code' => 'order_shipped', 'title' => 'تم الشحن', 'text' => 'تم شحن طلبك رقم {{order_id}}، كود التتبع: {{tracking_number}}'],
                ['id' => '3', 'code' => 'abandoned_cart', 'title' => 'استعادة السلة المتروكة', 'text' => 'أهلاً بك {{name}}، نسيت بعض المنتجات في سلتك! استخدم كود {{discount_code}} لتحصل على خصم خاص.'],
            ],
            'contacts' => [
                ['id' => '1', 'name' => 'أحمد العتيبي', 'phone' => '+966501234567', 'tag' => 'VIP', 'country' => 'SA', 'date' => date('Y-m-d')],
                ['id' => '2', 'name' => 'Sara Mohamed', 'phone' => '+201002345678', 'tag' => 'متجر', 'country' => 'EG', 'date' => date('Y-m-d')],
            ],
            'automationRules' => [
                ['id' => '1', 'keyword' => 'السعر', 'match' => 'يحتوي', 'reply' => 'أسعار باقاتنا تبدأ من 99 ر.س شهرياً.', 'active' => true],
                ['id' => '2', 'keyword' => 'مرحبا', 'match' => 'يحتوي', 'reply' => 'أهلاً بك في منصة Wox! كيف يمكن لفريقنا مساعدتك اليوم؟', 'active' => true],
            ],
        ];
    }

    private function writeTenantData(string $tenantId, array $data): void
    {
        File::put($this->getTenantFilePath($tenantId), json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public function getTenantData(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->query('tenantId', 'default');
        return response()->json(['status' => 'success', 'data' => $this->readTenantData($tenantId)]);
    }

    // Templates
    public function getTemplates(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->query('tenantId', 'default');
        $data = $this->readTenantData($tenantId);
        return response()->json(['status' => 'success', 'data' => $data['templates'] ?? []]);
    }

    public function saveTemplate(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->input('tenantId', 'default');
        $data = $this->readTenantData($tenantId);
        $data['templates'] = $data['templates'] ?? [];

        $id = $request->input('id');
        $item = [
            'id'       => $id ?: (string) time(),
            'code'     => $request->input('code', 'tpl_' . time()),
            'title'    => $request->input('title'),
            'text'     => $request->input('text'),
            'category' => $request->input('category', 'general'),
        ];

        $found = false;
        foreach ($data['templates'] as &$tpl) {
            if ($id && ($tpl['id'] === (string) $id || $tpl['code'] === $item['code'])) {
                $tpl = array_merge($tpl, $item);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $data['templates'][] = $item;
        }

        $this->writeTenantData($tenantId, $data);
        return response()->json(['status' => 'success', 'message' => 'تم حفظ القالب بنجاح', 'data' => $data['templates']]);
    }

    public function deleteTemplate(Request $request, string $tenantId, string $id): JsonResponse
    {
        $data = $this->readTenantData($tenantId);
        $data['templates'] = array_values(array_filter($data['templates'] ?? [], fn($t) => $t['id'] !== $id && $t['code'] !== $id));
        $this->writeTenantData($tenantId, $data);
        return response()->json(['status' => 'success', 'message' => 'تم حذف القالب بنجاح', 'data' => $data['templates']]);
    }

    // Contacts
    public function getContacts(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->query('tenantId', 'default');
        $data = $this->readTenantData($tenantId);
        return response()->json(['status' => 'success', 'data' => $data['contacts'] ?? []]);
    }

    public function saveContact(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->input('tenantId', 'default');
        $data = $this->readTenantData($tenantId);
        $data['contacts'] = $data['contacts'] ?? [];

        $id = $request->input('id');
        $item = [
            'id'      => $id ?: (string) time(),
            'name'    => $request->input('name'),
            'phone'   => $request->input('phone'),
            'tag'     => $request->input('tag', 'VIP'),
            'country' => $request->input('country', 'SA'),
            'date'    => date('Y-m-d'),
        ];

        $found = false;
        foreach ($data['contacts'] as &$c) {
            if ($id && $c['id'] === (string) $id) {
                $c = array_merge($c, $item);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $data['contacts'][] = $item;
        }

        $this->writeTenantData($tenantId, $data);
        return response()->json(['status' => 'success', 'message' => 'تم حفظ جهة الاتصال بنجاح', 'data' => $data['contacts']]);
    }

    public function deleteContact(Request $request, string $tenantId, string $id): JsonResponse
    {
        $data = $this->readTenantData($tenantId);
        $data['contacts'] = array_values(array_filter($data['contacts'] ?? [], fn($c) => $c['id'] !== $id));
        $this->writeTenantData($tenantId, $data);
        return response()->json(['status' => 'success', 'message' => 'تم حذف جهة الاتصال بنجاح', 'data' => $data['contacts']]);
    }

    // Automation Rules
    public function getAutomationRules(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->query('tenantId', 'default');
        $data = $this->readTenantData($tenantId);
        return response()->json(['status' => 'success', 'data' => $data['automationRules'] ?? []]);
    }

    public function saveAutomationRule(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->input('tenantId', 'default');
        $data = $this->readTenantData($tenantId);
        $data['automationRules'] = $data['automationRules'] ?? [];

        $id = $request->input('id');
        $item = [
            'id'      => $id ?: (string) time(),
            'keyword' => $request->input('keyword'),
            'match'   => $request->input('match', 'يحتوي'),
            'reply'   => $request->input('reply'),
            'active'  => $request->has('active') ? (bool) $request->input('active') : true,
        ];

        $found = false;
        foreach ($data['automationRules'] as &$r) {
            if ($id && $r['id'] === (string) $id) {
                $r = array_merge($r, $item);
                $found = true;
                break;
            }
        }
        if (!$found) {
            $data['automationRules'][] = $item;
        }

        $this->writeTenantData($tenantId, $data);
        return response()->json(['status' => 'success', 'message' => 'تم حفظ قاعدة الأتمتة بنجاح', 'data' => $data['automationRules']]);
    }

    public function deleteAutomationRule(Request $request, string $tenantId, string $id): JsonResponse
    {
        $data = $this->readTenantData($tenantId);
        $data['automationRules'] = array_values(array_filter($data['automationRules'] ?? [], fn($r) => $r['id'] !== $id));
        $this->writeTenantData($tenantId, $data);
        return response()->json(['status' => 'success', 'message' => 'تم حذف قاعدة الأتمتة بنجاح', 'data' => $data['automationRules']]);
    }

    // ─── Super Admin Endpoints ────────────────────────────────────

    public function adminOverview(): JsonResponse
    {
        $instancesCount = DB::table('Instance')->count();
        $usersCount = User::count();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'totalTenants'               => max($instancesCount, 1),
                'totalUsers'                 => max($usersCount, 1),
                'activeSubscriptions'        => max($instancesCount, 1),
                'estimatedMonthlyRevenueSAR' => 990,
                'estimatedMonthlyRevenueEGP' => 12000,
                'totalNumbers'               => 12,
                'assignedNumbers'            => 4,
                'serverMemoryUsage'          => round(memory_get_usage(true) / 1024 / 1024) . ' MB',
                'uptimeHours'                => '24.0',
            ],
        ]);
    }

    public function adminTenants(): JsonResponse
    {
        $instances = DB::table('Instance')->get();
        $tenants = [];
        foreach ($instances as $inst) {
            $tenants[] = [
                'id'           => $inst->id,
                'name'         => $inst->name,
                'country'      => 'SA',
                'currency'     => 'SAR',
                'createdAt'    => $inst->createdAt,
                'users'        => [['id' => '1', 'name' => 'Owner', 'email' => 'owner@example.com', 'role' => 'CLIENT']],
                'subscription' => ['status' => 'ACTIVE', 'plan' => ['name' => 'Pro', 'nameAr' => 'الباقة المتقدمة']],
                'virtualNumbers' => [],
                'invoices'     => [],
            ];
        }

        return response()->json(['status' => 'success', 'data' => $tenants]);
    }

    public function adminNumbers(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                ['id' => '1', 'number' => '+966501112233', 'country' => 'SA', 'status' => 'AVAILABLE', 'priceMonthly' => 35],
                ['id' => '2', 'number' => '+966504445566', 'country' => 'SA', 'status' => 'AVAILABLE', 'priceMonthly' => 35],
                ['id' => '3', 'number' => '+201009998877', 'country' => 'EG', 'status' => 'AVAILABLE', 'priceMonthly' => 20],
            ],
        ]);
    }

    public function adminInvoices(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => []]);
    }

    // ─── WhatsApp Marketing Campaigns ────────────────────────────

    private function getCampaignService(): \App\Services\CampaignService
    {
        return $this->campaignService ?? app(\App\Services\CampaignService::class);
    }

    public function getCampaigns(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->query('tenantId', 'default');
        $campaigns = $this->getCampaignService()->getCampaigns($tenantId);

        return response()->json([
            'status' => 'success',
            'data'   => $campaigns,
        ]);
    }

    public function saveCampaign(Request $request, ?string $tenantId = null): JsonResponse
    {
        $tenantId = $tenantId ?: $request->input('tenantId', 'default');
        $campaignData = $request->all();

        $campaign = $this->getCampaignService()->saveCampaign($tenantId, $campaignData);

        return response()->json([
            'status'  => 'success',
            'message' => 'تم حفظ بيانات الحملة بنجاح',
            'data'    => $campaign,
        ]);
    }

    public function deleteCampaign(Request $request, string $tenantId, string $id): JsonResponse
    {
        $deleted = $this->getCampaignService()->deleteCampaign($tenantId, $id);

        if (!$deleted) {
            return response()->json(['status' => 'error', 'message' => 'الحملة غير موجودة'], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'تم حذف الحملة بنجاح',
            'data'    => $this->getCampaignService()->getCampaigns($tenantId),
        ]);
    }

    public function launchCampaign(Request $request, string $tenantId, string $id): JsonResponse
    {
        try {
            $campaign = $this->getCampaignService()->launchCampaign($tenantId, $id);
            return response()->json([
                'status'  => 'success',
                'message' => 'تم إطلاق الحملة وبدء الإرسال بنجاح',
                'data'    => $campaign,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function pauseCampaign(Request $request, string $tenantId, string $id): JsonResponse
    {
        try {
            $campaign = $this->getCampaignService()->pauseCampaign($tenantId, $id);
            return response()->json([
                'status'  => 'success',
                'message' => 'تم إيقاف الحملة مؤقتاً',
                'data'    => $campaign,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function resumeCampaign(Request $request, string $tenantId, string $id): JsonResponse
    {
        try {
            $campaign = $this->getCampaignService()->resumeCampaign($tenantId, $id);
            return response()->json([
                'status'  => 'success',
                'message' => 'تم استئناف إرسال الحملة بنجاح',
                'data'    => $campaign,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function testCampaign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone'         => ['required', 'string'],
            'instance_name' => ['required', 'string'],
            'template'      => ['required', 'string'],
            'media_url'     => ['nullable', 'string'],
            'media_type'    => ['nullable', 'string'],
            'sample_name'   => ['nullable', 'string'],
            'sample_var1'   => ['nullable', 'string'],
            'sample_var2'   => ['nullable', 'string'],
        ]);

        try {
            $result = $this->getCampaignService()->sendTestMessage($validated);
            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
