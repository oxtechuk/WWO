<?php
/**
 * Plugin Name: Wox WhatsApp for WooCommerce
 * Plugin URI: https://yourdomain.com
 * Description: إرسال إشعارات طلبات ووكومرس ورسائل التحقق عبر واتساب من خلال منصة Wox WhatsApp.
 * Version: 1.0.0
 * Author: Wox Team
 * Text Domain: wox-whatsapp
 */

if (!defined('ABSPATH')) {
    exit;
}

class Wox_WhatsApp_Integration {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        
        // WooCommerce Order Status Hook
        add_action('woocommerce_order_status_changed', [$this, 'handle_order_status_changed'], 10, 4);
        
        // AJAX test connection
        add_action('wp_ajax_wox_test_connection', [$this, 'ajax_test_connection']);
    }

    /**
     * Add settings page in WP Admin
     */
    public function add_admin_menu() {
        add_menu_page(
            'Wox WhatsApp',
            'Wox WhatsApp',
            'manage_options',
            'wox-whatsapp-settings',
            [$this, 'render_settings_page'],
            'dashicons-format-chat',
            56
        );
    }

    public function register_settings() {
        register_setting('wox_whatsapp_group', 'wox_api_url');
        register_setting('wox_whatsapp_group', 'wox_instance_name');
        register_setting('wox_whatsapp_group', 'wox_api_key');
        register_setting('wox_whatsapp_group', 'wox_order_template');
    }

    /**
     * Render settings page UI
     */
    public function render_settings_page() {
        $api_url       = get_option('wox_api_url', 'https://api.yourdomain.com');
        $instance_name = get_option('wox_instance_name', '');
        $api_key       = get_option('wox_api_key', '');
        $template      = get_option('wox_order_template', "مرحباً {customer_name} 👋\nتم تحديث حالة طلبك #{order_id} إلى: *{status}*\n💰 الإجمالي: {total} {currency}\nشكراً لتسوقك معنا!");
        ?>
        <div class="wrap" dir="rtl" style="text-align: right;">
            <h1>إعدادات ربط Wox WhatsApp لمتجر ووكومرس</h1>
            <form method="post" action="options.php">
                <?php settings_fields('wox_whatsapp_group'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">رابط المنصة (API URL)</th>
                        <td><input type="url" name="wox_api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" placeholder="https://api.yourdomain.com" /></td>
                    </tr>
                    <tr>
                        <th scope="row">اسم الـ Instance</th>
                        <td><input type="text" name="wox_instance_name" value="<?php echo esc_attr($instance_name); ?>" class="regular-text" placeholder="my-store-instance" /></td>
                    </tr>
                    <tr>
                        <th scope="row">مفتاح الـ API (Instance Token)</th>
                        <td><input type="password" name="wox_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">قالب رسالة تحديث الطلب</th>
                        <td>
                            <textarea name="wox_order_template" rows="5" class="large-text"><?php echo esc_textarea($template); ?></textarea>
                            <p class="description">المتغيرات المتاحة: <code>{order_id}</code>, <code>{customer_name}</code>, <code>{status}</code>, <code>{total}</code>, <code>{currency}</code>, <code>{tracking_url}</code></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('حفظ الإعدادات'); ?>
            </form>

            <hr/>
            <h3>فحص الاتصال مع المنصة</h3>
            <button id="wox-test-btn" class="button button-secondary">⚡ فحص الاتصال الآن</button>
            <span id="wox-test-result" style="margin-right: 15px; font-weight: bold;"></span>

            <script>
            document.getElementById('wox-test-btn').addEventListener('click', function(e) {
                e.preventDefault();
                var res = document.getElementById('wox-test-result');
                res.innerHTML = 'جاري الفحص...';
                res.style.color = '#333';

                var data = new FormData();
                data.append('action', 'wox_test_connection');

                fetch(ajaxurl, {
                    method: 'POST',
                    body: data
                }).then(r => r.json()).then(data => {
                    if (data.success) {
                        res.innerHTML = '✅ تم الاتصال بنجاح! الواتساب متصل: ' + (data.data.instance_name || '');
                        res.style.color = 'green';
                    } else {
                        res.innerHTML = '❌ فشل الاتصال: ' + (data.data || 'خطأ غير معروف');
                        res.style.color = 'red';
                    }
                }).catch(err => {
                    res.innerHTML = '❌ خطأ في الشبكة';
                    res.style.color = 'red';
                });
            });
            </script>
        </div>
        <?php
    }

    /**
     * AJAX handler for testing connection
     */
    public function ajax_test_connection() {
        $api_url       = rtrim(get_option('wox_api_url'), '/');
        $instance_name = get_option('wox_instance_name');
        $api_key       = get_option('wox_api_key');

        if (!$api_url || !$instance_name || !$api_key) {
            wp_send_json_error('الرجاء حفظ رابط المنصة واسم الـ Instance والـ API Key أولاً');
        }

        $endpoint = "{$api_url}/api/v1/wp/test-connection/{$instance_name}";

        $response = wp_remote_get($endpoint, [
            'headers' => [
                'apikey'       => $api_key,
                'Content-Type' => 'application/json',
            ],
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200 && isset($body['status']) && $body['status'] === 'success') {
            wp_send_json_success($body['data'] ?? []);
        } else {
            $msg = $body['message'] ?? 'Status code: ' . $code;
            wp_send_json_error($msg);
        }
    }

    /**
     * Handle WooCommerce order status change
     */
    public function handle_order_status_changed($order_id, $old_status, $new_status, $order) {
        $api_url       = rtrim(get_option('wox_api_url'), '/');
        $instance_name = get_option('wox_instance_name');
        $api_key       = get_option('wox_api_key');
        $template      = get_option('wox_order_template');

        if (!$api_url || !$instance_name || !$api_key || !$order) {
            return;
        }

        $phone = $order->get_billing_phone();
        if (!$phone) {
            return;
        }

        $endpoint = "{$api_url}/api/v1/wp/order-notification/{$instance_name}";

        $payload = [
            'phone'          => $phone,
            'order_id'       => $order_id,
            'order_status'   => wc_get_order_status_name($new_status),
            'customer_name'  => $order->get_formatted_billing_full_name() ?: $order->get_billing_first_name(),
            'total'          => $order->get_total(),
            'currency'       => $order->get_currency(),
            'custom_message' => $template,
        ];

        // Non-blocking async HTTP POST
        wp_remote_post($endpoint, [
            'headers'     => [
                'apikey'       => $api_key,
                'Content-Type' => 'application/json',
            ],
            'body'        => wp_json_encode($payload),
            'timeout'     => 10,
            'blocking'    => false, // Doesn't slow down checkout or status update in WP!
        ]);
    }
}

add_action('plugins_loaded', ['Wox_WhatsApp_Integration', 'get_instance']);

