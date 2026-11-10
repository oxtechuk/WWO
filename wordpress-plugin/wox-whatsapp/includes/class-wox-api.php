<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Wox_API_Client — Handles all HTTP communication with Wox-Lv WhatsApp Platform.
 */
class Wox_API_Client {

    private string $api_url;
    private string $instance_name;
    private string $api_key;

    public function __construct() {
        $this->api_url       = rtrim((string) get_option('wox_api_url', ''), '/');
        $this->instance_name = (string) get_option('wox_instance_name', '');
        $this->api_key       = (string) get_option('wox_api_key', '');
    }

    public function is_configured(): bool {
        return !empty($this->api_url) && !empty($this->instance_name) && !empty($this->api_key);
    }

    /**
     * Test connection to the instance.
     *
     * @return array|WP_Error
     */
    public function test_connection() {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'الرجاء إدخال بيانات الربط كاملة أولاً');
        }

        $url = "{$this->api_url}/api/v1/wp/test-connection/{$this->instance_name}";

        $response = wp_remote_get($url, [
            'headers' => [
                'apikey'       => $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200 && isset($body['status']) && $body['status'] === 'success') {
            return $body['data'] ?? [];
        }

        $message = $body['message'] ?? "خطأ في الاتصال (كود: {$code})";
        return new WP_Error('connection_failed', $message);
    }

    /**
     * Send order notification asynchronously.
     *
     * @param array $payload
     * @return array|WP_Error
     */
    public function send_order_notification(array $payload) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Plugin not configured');
        }

        $url = "{$this->api_url}/api/v1/wp/order-notification/{$this->instance_name}";

        return wp_remote_post($url, [
            'headers'  => [
                'apikey'       => $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'body'     => wp_json_encode($payload),
            'timeout'  => 10,
            'blocking' => false, // Non-blocking so customer checkout isn't delayed
        ]);
    }

    /**
     * Send OTP verification code.
     *
     * @param string $phone
     * @param string $otp
     * @param string $store_name
     * @return array|WP_Error
     */
    public function send_otp(string $phone, string $otp, string $store_name = '') {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Plugin not configured');
        }

        $url = "{$this->api_url}/api/v1/wp/send-otp/{$this->instance_name}";

        return wp_remote_post($url, [
            'headers'  => [
                'apikey'       => $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'body'     => wp_json_encode([
                'phone'      => $phone,
                'otp'        => $otp,
                'store_name' => $store_name ?: get_bloginfo('name'),
            ]),
            'timeout'  => 10,
            'blocking' => true,
        ]);
    }

    /**
     * Send abandoned cart recovery reminder.
     *
     * @param array $payload
     * @return array|WP_Error
     */
    public function send_abandoned_cart(array $payload) {
        if (!$this->is_configured()) {
            return new WP_Error('not_configured', 'Plugin not configured');
        }

        $url = "{$this->api_url}/api/v1/wp/abandoned-cart/{$this->instance_name}";

        return wp_remote_post($url, [
            'headers'  => [
                'apikey'       => $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'body'     => wp_json_encode($payload),
            'timeout'  => 10,
            'blocking' => false,
        ]);
    }
}

