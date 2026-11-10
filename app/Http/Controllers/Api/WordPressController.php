<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instance;
use App\Services\Message\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * WordPressController — Dedicated high-performance API endpoints for WordPress & WooCommerce integrations.
 * Provides optimized methods for order updates, OTP verification, cart recovery, and status checks.
 */
class WordPressController extends Controller
{
    public function __construct(
        private readonly MessageService $messageService,
    ) {}

    /**
     * Test connection & return instance status for WordPress plugin settings.
     */
    public function testConnection(Request $request, string $instanceName): JsonResponse
    {
        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Connection verified successfully.',
            'data' => [
                'instance_name' => $instance->name,
                'connection_status' => $instance->connectionStatus ?? 'open',
                'owner_jid' => $instance->ownerJid ?? null,
                'profile_name' => $instance->profileName ?? $instance->name,
                'server_time' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Send WooCommerce order status notifications.
     */
    public function sendOrderNotification(Request $request, string $instanceName): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'order_id' => ['required'],
            'order_status' => ['required', 'string'],
            'customer_name' => ['nullable', 'string', 'max:150'],
            'total' => ['nullable'],
            'currency' => ['nullable', 'string', 'max:10'],
            'items' => ['nullable'],
            'tracking_url' => ['nullable', 'string'],
            'custom_message' => ['nullable', 'string'],
        ]);

        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        $message = $validated['custom_message'] ?? null;

        if (! $message) {
            $customerName = $validated['customer_name'] ?? 'عميلنا العزيز';
            $orderId = $validated['order_id'];
            $status = $validated['order_status'];
            $total = $validated['total'] ? "{$validated['total']} ".($validated['currency'] ?? 'SAR') : '';

            $message = "مرحباً {$customerName} 👋\n\n";
            $message .= "تم تحديث حالة طلبك رقم #{$orderId}\n";
            $message .= "📌 الحالة الحالية: *{$status}*\n";

            if ($total) {
                $message .= "💰 الإجمالي: *{$total}*\n";
            }

            if (! empty($validated['tracking_url'])) {
                $message .= "🔗 تتبع شحنتك: {$validated['tracking_url']}\n";
            }

            $message .= "\nشكراً لتسوقك معنا! 🛍️";
        } else {
            // Variable interpolation
            $replacements = [
                '{order_id}' => (string) $validated['order_id'],
                '{customer_name}' => $validated['customer_name'] ?? '',
                '{status}' => $validated['order_status'],
                '{total}' => (string) ($validated['total'] ?? ''),
                '{currency}' => $validated['currency'] ?? '',
                '{tracking_url}' => $validated['tracking_url'] ?? '',
            ];
            $message = str_replace(array_keys($replacements), array_values($replacements), $message);
        }

        $result = $this->messageService->sendText($instance, [
            'number' => $validated['phone'],
            'text' => $message,
        ]);

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Order notification sent successfully.',
            'result' => $result,
        ]);
    }

    /**
     * Send OTP / Two-Factor authentication message for WooCommerce checkout or login.
     */
    public function sendOtp(Request $request, string $instanceName): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'otp' => ['required', 'string'],
            'store_name' => ['nullable', 'string', 'max:100'],
            'expires_in' => ['nullable', 'integer'],
            'custom_message' => ['nullable', 'string'],
        ]);

        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        $storeName = $validated['store_name'] ?? config('app.name', 'المتجر');
        $otp = $validated['otp'];

        if (! empty($validated['custom_message'])) {
            $message = str_replace(
                ['{otp}', '{store_name}'],
                [$otp, $storeName],
                $validated['custom_message']
            );
        } else {
            $message = "رمز التحقق الخاص بك لمتجر {$storeName} هو:\n\n*{$otp}*\n\n🔒 الرجاء عدم مشاركة هذا الرمز مع أي شخص.";
            if (! empty($validated['expires_in'])) {
                $message .= "\nصلاحية الرمز: {$validated['expires_in']} دقيقة.";
            }
        }

        $result = $this->messageService->sendText($instance, [
            'number' => $validated['phone'],
            'text' => $message,
        ]);

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'OTP dispatched successfully.',
            'result' => $result,
        ]);
    }

    /**
     * Send Abandoned Cart recovery reminder.
     */
    public function sendAbandonedCart(Request $request, string $instanceName): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'customer_name' => ['nullable', 'string', 'max:150'],
            'recovery_url' => ['required', 'string'],
            'discount_code' => ['nullable', 'string'],
            'store_name' => ['nullable', 'string'],
            'custom_message' => ['nullable', 'string'],
        ]);

        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        $customerName = $validated['customer_name'] ?? 'صديقنا الرائع';
        $recoveryUrl = $validated['recovery_url'];
        $storeName = $validated['store_name'] ?? config('app.name', 'المتجر');

        if (! empty($validated['custom_message'])) {
            $message = str_replace(
                ['{customer_name}', '{recovery_url}', '{discount_code}', '{store_name}'],
                [$customerName, $recoveryUrl, $validated['discount_code'] ?? '', $storeName],
                $validated['custom_message']
            );
        } else {
            $message = "أهلاً بك {$customerName} في {$storeName} 🛒\n\n";
            $message .= "لقد لاحظنا أنك تركت بعض المنتجات الرائعة في سلتك!\n";

            if (! empty($validated['discount_code'])) {
                $message .= "🎁 استعمل كوبون الخصم: *{$validated['discount_code']}* للحصول على خصم إضافي عند إتمام الطلب!\n\n";
            }

            $message .= "اضغط على الرابط لإكمال طلبك بسهولة:\n{$recoveryUrl}";
        }

        $result = $this->messageService->sendText($instance, [
            'number' => $validated['phone'],
            'text' => $message,
        ]);

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Abandoned cart notification sent successfully.',
            'result' => $result,
        ]);
    }

    /**
     * Send a direct or customized message from WordPress (e.g. contact form, customer note).
     */
    public function sendMessage(Request $request, string $instanceName): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string'],
            'message' => ['required', 'string'],
            'media_url' => ['nullable', 'url'],
            'caption' => ['nullable', 'string'],
        ]);

        /** @var Instance $instance */
        $instance = $request->get('wox_instance');

        if (! empty($validated['media_url'])) {
            $result = $this->messageService->sendMedia($instance, [
                'number' => $validated['phone'],
                'mediatype' => 'image',
                'media' => $validated['media_url'],
                'caption' => $validated['caption'] ?? $validated['message'],
            ]);
        } else {
            $result = $this->messageService->sendText($instance, [
                'number' => $validated['phone'],
                'text' => $validated['message'],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Message sent successfully.',
            'result' => $result,
        ]);
    }
}
