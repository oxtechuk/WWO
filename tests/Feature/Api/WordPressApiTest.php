<?php

namespace Tests\Feature\Api;

use App\Models\Instance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * WordPressApiTest — Feature tests for dedicated WordPress/WooCommerce endpoints.
 */
class WordPressApiTest extends TestCase
{
    use RefreshDatabase;

    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();
        $this->apiKey = config('evolution.authentication.api_key', 'test-api-key');
    }

    public function test_unauthorized_request_rejected(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->getJson("/api/v1/wp/test-connection/{$instance->name}");

        $response->assertStatus(401);
    }

    public function test_connection_returns_instance_details(): void
    {
        $instance = Instance::factory()->create(['name' => 'test-wp-instance']);

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->getJson("/api/v1/wp/test-connection/{$instance->name}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.instance_name', 'test-wp-instance');
    }

    public function test_send_order_notification_validation(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/v1/wp/order-notification/{$instance->name}", []);

        $response->assertStatus(400);
    }

    public function test_send_order_notification_succeeds(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/v1/wp/order-notification/{$instance->name}", [
                'phone' => '966501234567',
                'order_id' => '1054',
                'order_status' => 'Processing',
                'customer_name' => 'Fahad',
                'total' => '350.00',
                'currency' => 'SAR',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_send_otp_succeeds(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/v1/wp/send-otp/{$instance->name}", [
                'phone' => '966501234567',
                'otp' => '482910',
                'store_name' => 'MyStore',
                'expires_in' => 5,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_send_abandoned_cart_succeeds(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/v1/wp/abandoned-cart/{$instance->name}", [
                'phone' => '966501234567',
                'customer_name' => 'Sarah',
                'recovery_url' => 'https://example.com/cart?recover=123',
                'discount_code' => 'SAVE10',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_send_message_succeeds(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/v1/wp/send-message/{$instance->name}", [
                'phone' => '966501234567',
                'message' => 'Custom message from WordPress',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}
