<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Wox_WooCommerce_Handler — Listens to WooCommerce order hooks and triggers notifications.
 */
class Wox_WooCommerce_Handler {

    private Wox_API_Client $api_client;

    public function __construct(Wox_API_Client $api_client) {
        $this->api_client = $api_client;

        // Hook on order status change
        add_action('woocommerce_order_status_changed', [$this, 'on_order_status_changed'], 10, 4);
    }

    /**
     * Handle WooCommerce order status change.
     *
     * @param int|string $order_id
     * @param string $old_status
     * @param string $new_status
     * @param WC_Order|null $order
     */
    public function on_order_status_changed($order_id, string $old_status, string $new_status, $order): void {
        if (!$order) {
            $order = wc_get_order($order_id);
        }

        if (!$order) {
            return;
        }

        // Check if notifications are enabled for this specific status
        $enabled_statuses = (array) get_option('wox_enabled_statuses', ['processing', 'completed', 'cancelled']);
        if (!in_array($new_status, $enabled_statuses, true)) {
            return;
        }

        $phone = $order->get_billing_phone();
        if (empty($phone)) {
            return;
        }

        $template = get_option("wox_template_{$new_status}", get_option('wox_order_template'));

        $customer_name = trim($order->get_formatted_billing_full_name());
        if (empty($customer_name)) {
            $customer_name = $order->get_billing_first_name() ?: 'عميلنا العزيز';
        }

        $status_label = wc_get_order_status_name($new_status);

        $payload = [
            'phone'          => $this->normalize_phone_number($phone),
            'order_id'       => (string) $order_id,
            'order_status'   => $status_label,
            'customer_name'  => $customer_name,
            'total'          => (string) $order->get_total(),
            'currency'       => $order->get_currency(),
            'custom_message' => $template,
        ];

        // Retrieve tracking URL if available (e.g. from shipment plugins)
        $tracking_url = $order->get_meta('_tracking_url') ?: $order->get_meta('tracking_url');
        if (!empty($tracking_url)) {
            $payload['tracking_url'] = $tracking_url;
        }

        $this->api_client->send_order_notification($payload);
    }

    /**
     * Clean phone numbers and add default country code if missing.
     *
     * @param string $phone
     * @return string
     */
    private function normalize_phone_number(string $phone): string {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        // Convert local format (e.g., 05xxxxxxx -> 9665xxxxxxx or 01xxxxxxxxx -> 201xxxxxxxxx)
        $default_code = get_option('wox_default_country_code', '966');

        if (str_starts_with($cleaned, '00')) {
            $cleaned = substr($cleaned, 2);
        }

        if (str_starts_with($cleaned, '0')) {
            $cleaned = $default_code . substr($cleaned, 1);
        }

        return $cleaned;
    }
}

