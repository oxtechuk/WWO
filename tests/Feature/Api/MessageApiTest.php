<?php

namespace Tests\Feature\Api;

use App\Models\Instance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * MessageApiTest — Feature tests for message sending endpoints.
 */
class MessageApiTest extends TestCase
{
    use RefreshDatabase;

    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();
        $this->apiKey = config('evolution.authentication.api_key', 'test-api-key');
    }

    public function test_send_text_requires_number_and_text(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/message/sendText/{$instance->name}", []);

        $response->assertStatus(400);
    }

    public function test_send_text_returns_response(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/message/sendText/{$instance->name}", [
                'number' => '5511999999999',
                'text'   => 'Hello World',
            ]);

        // Bridge may not be configured in test env, but endpoint should respond
        $response->assertStatus(200);
    }

    public function test_send_location_validates_coordinates(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/message/sendLocation/{$instance->name}", [
                'number'    => '5511999999999',
                'latitude'  => 999,  // invalid
                'longitude' => 0,
            ]);

        $response->assertStatus(400);
    }

    public function test_send_reaction_requires_key_and_reaction(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/message/sendReaction/{$instance->name}", []);

        $response->assertStatus(400);
    }

    public function test_send_poll_requires_at_least_two_values(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson("/api/message/sendPoll/{$instance->name}", [
                'number' => '5511999999999',
                'name'   => 'My Poll',
                'values' => ['Only one option'],  // min 2
            ]);

        $response->assertStatus(400);
    }
}
