<?php

namespace Tests\Feature\Api;

use App\Models\Instance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * InstanceApiTest — Feature tests for Instance API endpoints.
 * Covers: create, fetchInstances, connectionState, delete, logout, restart, setPresence
 */
class InstanceApiTest extends TestCase
{
    use RefreshDatabase;

    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();
        $this->apiKey = config('evolution.authentication.api_key', 'test-api-key');
    }

    // ─── Auth Tests ───────────────────────────────────────────────

    public function test_create_instance_requires_api_key(): void
    {
        $response = $this->postJson('/api/instance/create', ['instanceName' => 'test']);
        $response->assertStatus(401);
    }

    public function test_invalid_api_key_returns_401(): void
    {
        $response = $this->withHeaders(['apikey' => 'wrong-key'])
            ->postJson('/api/instance/create', ['instanceName' => 'test']);
        $response->assertStatus(401);
    }

    // ─── Create Tests ─────────────────────────────────────────────

    public function test_can_create_instance_with_valid_api_key(): void
    {
        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson('/api/instance/create', [
                'instanceName' => 'test-' . uniqid(),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['instance', 'hash', 'status']);
    }

    public function test_create_instance_name_required(): void
    {
        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson('/api/instance/create', []);

        $response->assertStatus(400);
        $this->assertTrue(
            isset($response->json('response.error')['instanceName']) ||
            isset($response->json('errors')['instanceName'])
        );
    }

    public function test_create_instance_name_must_be_alphanumeric(): void
    {
        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson('/api/instance/create', ['instanceName' => 'invalid name!']);

        $response->assertStatus(400);
        $this->assertTrue(
            isset($response->json('response.error')['instanceName']) ||
            isset($response->json('errors')['instanceName'])
        );
    }

    public function test_creating_existing_instance_returns_existing(): void
    {
        $name = 'test-existing-' . uniqid();

        // Create once
        $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson('/api/instance/create', ['instanceName' => $name]);

        // Create again
        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->postJson('/api/instance/create', ['instanceName' => $name]);

        $response->assertStatus(201)
            ->assertJson(['status' => 'existing']);
    }

    // ─── Fetch Tests ──────────────────────────────────────────────

    public function test_can_fetch_all_instances(): void
    {
        Instance::factory()->count(3)->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->getJson('/api/instance/fetchInstances');

        $response->assertStatus(200)
            ->assertJsonIsArray();
    }

    public function test_can_fetch_single_instance_by_name(): void
    {
        $instance = Instance::factory()->create(['name' => 'my-instance-' . uniqid()]);

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->getJson("/api/instance/fetchInstances?instanceName={$instance->name}");

        $response->assertStatus(200);
    }

    // ─── Connection State Tests ───────────────────────────────────

    public function test_can_get_connection_state(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->getJson("/api/instance/connectionState/{$instance->name}");

        $response->assertStatus(200)
            ->assertJsonStructure(['instance' => ['instanceName', 'state']]);
    }

    public function test_connection_state_returns_404_for_unknown_instance(): void
    {
        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->getJson('/api/instance/connectionState/non-existent-instance');

        $response->assertStatus(404);
    }

    // ─── Delete Tests ─────────────────────────────────────────────

    public function test_can_delete_instance(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->deleteJson("/api/instance/delete/{$instance->name}");

        $response->assertStatus(200)
            ->assertJson(['instance' => ['status' => 'removed']]);

        $this->assertDatabaseMissing('Instance', ['id' => $instance->id]);
    }

    // ─── Presence Tests ───────────────────────────────────────────

    public function test_can_set_presence(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->putJson("/api/instance/setPresence/{$instance->name}", [
                'presence' => 'available',
            ]);

        $response->assertStatus(200);
    }

    public function test_set_presence_validates_value(): void
    {
        $instance = Instance::factory()->create();

        $response = $this->withHeaders(['apikey' => $this->apiKey])
            ->putJson("/api/instance/setPresence/{$instance->name}", [
                'presence' => 'invalid-value',
            ]);

        $response->assertStatus(400);
    }
}
