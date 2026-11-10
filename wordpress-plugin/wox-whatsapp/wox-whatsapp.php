<?php
/**
 * Plugin Name: Wox WhatsApp for WooCommerce
 * Plugin URI: https://yourdomain.com
 * Description: إرسال إشعارات طلبات ووكومرس ورسائل التحقق عبر واتساب من خلال منصة Wox WhatsApp.
 * Version: 1.0.0
 * Author: Wox Team
 * Text Domain: wox-whatsapp
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('WOX_WHATSAPP_VERSION', '1.0.0');
define('WOX_WHATSAPP_PATH', plugin_dir_path(__FILE__));
define('WOX_WHATSAPP_URL', plugin_dir_url(__FILE__));

require_once WOX_WHATSAPP_PATH . 'includes/class-wox-api.php';
require_once WOX_WHATSAPP_PATH . 'includes/class-wox-woocommerce.php';

class Wox_WhatsApp_Main {

    private static ?self $instance = null;
    private Wox_API_Client $api_client;
    private ?Wox_WooCommerce_Handler $wc_handler = null;

    public static function get_instance(): self {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->api_client = new Wox_API_Client();

        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_ajax_wox_test_connection', [$this, 'ajax_test_connection']);

        // Check WooCommerce active
        add_action('plugins_loaded', function () {
            if (class_exists('WooCommerce')) {
                $this->wc_handler = new Wox_WooCommerce_Handler($this->api_client);
            }
        });
    }

    public function add_admin_menu(): void {
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

    public function register_settings(): void {
        register_setting('wox_settings_group', 'wox_api_url');
        register_setting('wox_settings_group', 'wox_instance_name');
        register_setting('wox_settings_group', 'wox_api_key');
        register_setting('wox_settings_group', 'wox_default_country_code');
        register_setting('wox_settings_group', 'wox_enabled_statuses');
        register_setting('wox_settings_group', 'wox_order_template');
    }

    public function render_settings_page(): void {
        $api_url       = get_option('wox_api_url', 'https://api.yourdomain.com');
        $instance_name = get_option('wox_instance_name', '');
        $api_key       = get_option('wox_api_key', '');
        $country_code  = get_option('wox_default_country_code', '966');
        $template      = get_option('wox_order_template', "مرحباً {customer_name} 👋\nتم تحديث حالة طلبك #{order_id} إلى: *{status}*\n💰 الإجمالي: {total} {currency}\nشكراً لتسوقك معنا! 🛍️");
        ?>
        <div class="wrap" dir="rtl" style="text-align: right; max-width: 900px; margin-top: 20px;">
            <div style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 15px; border-bottom: 2px solid #f0f2f5; padding-bottom: 15px; margin-bottom: 25px;">
                    <span class="dashicons dashicons-format-chat" style="font-size: 36px; width: 36px; height: 36px; color: #25D366;"></span>
                    <div>
                        <h2 style="margin: 0; font-size: 22px;">إعدادات ربط Wox WhatsApp لمتجر ووكومرس</h2>
                        <p style="margin: 5px 0 0; color: #64748b; font-size: 13px;">المنصة السحابية لإرسال إشعارات الطلبات وتأكيد الشحن واستعادة السلات عبر الواتساب.</p>
                    </div>
                </div>

                <form method="post" action="options.php">
                    <?php settings_fields('wox_settings_group'); ?>
                    
                    <table class="form-table" style="margin-top: 0;">
                        <tr>
                            <th scope="row" style="font-weight: 600;">رابط المنصة (API URL)</th>
                            <td>
                                <input type="url" name="wox_api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" placeholder="https://api.yourdomain.com" style="width: 100%; max-width: 450px;" required />
                                <p class="description">رابط سيرفر Laravel Wox الخاص بك (مثلاً: <code>https://api.yourdomain.com</code>)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="font-weight: 600;">اسم الـ Instance</th>
                            <td>
                                <input type="text" name="wox_instance_name" value="<?php echo esc_attr($instance_name); ?>" class="regular-text" placeholder="mystore-whatsapp" style="width: 100%; max-width: 450px;" required />
                                <p class="description">اسم المعرف الذي قمت بإنشائه داخل منصة Wox</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="font-weight: 600;">مفتاح الـ API (Instance Token)</th>
                            <td>
                                <input type="password" name="wox_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" style="width: 100%; max-width: 450px;" required />
                                <p class="description">مفتاح الحماية الخاص بالـ Instance أو الماستر كيج من لوحة Wox</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="font-weight: 600;">رمز الدولة الافتراضي</th>
                            <td>
                                <input type="text" name="wox_default_country_code" value="<?php echo esc_attr($country_code); ?>" class="small-text" placeholder="966" />
                                <p class="description">يتم إضافته تلقائياً للأرقام المحلية التي تبدأ بـ 0 (مثلاً: 966 للسعودية أو 20 لمصر)</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" style="font-weight: 600;">قالب رسالة إشعار الطلب</th>
                            <td>
                                <textarea name="wox_order_template" rows="6" class="large-text" style="border-radius: 8px; font-family: inherit;"><?php echo esc_textarea($template); ?></textarea>
                                <p class="description" style="margin-top: 8px;">
                                    <strong>المتغيرات المتاحة للاستخدام:</strong><br/>
                                    <code>{customer_name}</code> : اسم العميل | 
                                    <code>{order_id}</code> : رقم الطلب | 
                                    <code>{status}</code> : حالة الطلب | 
                                    <code>{total}</code> : المبلغ الإجمالي | 
                                    <code>{currency}</code> : العملة | 
                                    <code>{tracking_url}</code> : رابط التتبع
                                </p>
                            </td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; display: flex; align-items: center; gap: 15px;">
                        <?php submit_button('حفظ الإعدادات', 'primary', 'submit', false, ['style' => 'padding: 8px 24px; font-size: 15px;']); ?>
                        <button type="button" id="wox-test-btn" class="button button-secondary" style="padding: 8px 20px; font-size: 15px;">⚡ فحص الاتصال بالمنصة</button>
                    </div>
                </form>

                <div id="wox-test-box" style="display: none; margin-top: 20px; padding: 15px; border-radius: 8px; font-size: 14px;"></div>
            </div>

            <script>
            document.getElementById('wox-test-btn').addEventListener('click', function(e) {
                e.preventDefault();
                var box = document.getElementById('wox-test-box');
                box.style.display = 'block';
                box.style.background = '#f8fafc';
                box.style.border = '1px solid #cbd5e1';
                box.style.color = '#334155';
                box.innerHTML = '⏳ جاري الاتصال بخادم Wox والتحقق من حالة الواتساب...';

                var data = new FormData();
                data.append('action', 'wox_test_connection');

                fetch(ajaxurl, { method: 'POST', body: data })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        box.style.background = '#f0fdf4';
                        box.style.border = '1px solid #bbf7d0';
                        box.style.color = '#166534';
                        box.innerHTML = '✅ <strong>تم الاتصال بنجاح!</strong><br/>معرف الـ Instance: <code>' + (data.data.instance_name || '') + '</code> | حالة الاتصال: <strong>متصل (Open)</strong>';
                    } else {
                        box.style.background = '#fef2f2';
                        box.style.border = '1px solid #fecaca';
                        box.style.color = '#991b1b';
                        box.innerHTML = '❌ <strong>فشل الاتصال:</strong> ' + (data.data || 'خطأ غير متوقع');
                    }
                })
                .catch(err => {
                    box.style.background = '#fef2f2';
                    box.style.border = '1px solid #fecaca';
                    box.style.color = '#991b1b';
                    box.innerHTML = '❌ <strong>خطأ في الشبكة:</strong> تعذر الوصول إلى الخادم.';
                });
            });
            </script>
        </div>
        <?php
    }

    public function ajax_test_connection(): void {
        $result = $this->api_client->test_connection();

        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }

        wp_send_json_success($result);
    }
}

add_action('plugins_loaded', ['Wox_WhatsApp_Main', 'get_instance']);

