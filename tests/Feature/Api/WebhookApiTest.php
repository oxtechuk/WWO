<?php

namespace Tests\Feature\Api;

use App\Models\Instance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * WebhookApiTest — Feature tests for Webhook configuration endpoints.
 */
class WebhookApiTest extends TestCase
{
    use RefreshDatabase;

    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();
        $this->apiKey = config('evolution.authentication.api_key', 'test-api-key');
    }

    public function test_can_set_webhook(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/webhook/set/{$instance->name}", [
                'url'     => 'https://example.com/webhook',
                'enabled' => true,
                'events'  => ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['webhook']);
    }

    public function test_webhook_url_must_be_valid(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/webhook/set/{$instance->name}", [
                'url' => 'not-a-url',
            ]);

        $response->assertStatus(400);
    }

    public function test_can_find_webhook(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->getJson("/api/webhook/find/{$instance->name}");

        $response->assertStatus(200);
    }
}
