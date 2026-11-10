<?php

namespace Tests\Unit\Services;

use App\Enums\InstanceConnectionStatus;
use App\Models\Instance;
use App\Services\Cache\InstanceCacheService;
use App\Services\Instance\InstanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * InstanceServiceTest — Unit tests for InstanceService business logic.
 */
class InstanceServiceTest extends TestCase
{
    use RefreshDatabase;

    private InstanceService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $cache = new InstanceCacheService();
        $this->service = new InstanceService($cache);
    }

    public function test_can_create_instance(): void
    {
        $result = $this->service->create(['instanceName' => 'test-unit-' . uniqid()]);

        $this->assertArrayHasKey('instance', $result);
        $this->assertArrayHasKey('hash', $result);
        $this->assertEquals('created', $result['status']);
    }

    public function test_create_returns_existing_for_duplicate(): void
    {
        $name = 'duplicate-' . uniqid();
        $this->service->create(['instanceName' => $name]);
        $result = $this->service->create(['instanceName' => $name]);

        $this->assertEquals('existing', $result['status']);
    }

    public function test_can_find_all_instances(): void
    {
        Instance::factory()->count(3)->create();
        $result = $this->service->findAll();
        $this->assertCount(3, $result);
    }

    public function test_can_find_single_instance(): void
    {
        $inst = Instance::factory()->create(['name' => 'find-me-' . uniqid()]);
        $result = $this->service->findOne($inst->name);
        $this->assertNotNull($result);
        $this->assertEquals($inst->id, $result->id);
    }

    public function test_can_delete_instance(): void
    {
        $inst   = Instance::factory()->create();
        $result = $this->service->delete($inst->name);
        $this->assertTrue($result);
        $this->assertDatabaseMissing('Instance', ['id' => $inst->id]);
    }

    public function test_delete_returns_false_for_nonexistent(): void
    {
        $result = $this->service->delete('does-not-exist');
        $this->assertFalse($result);
    }

    public function test_format_instance_has_required_keys(): void
    {
        $inst   = Instance::factory()->create();
        $result = $this->service->formatInstance($inst);

        $this->assertArrayHasKey('instanceName', $result);
        $this->assertArrayHasKey('instanceId', $result);
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('apikey', $result);
    }

    public function test_can_update_connection_status(): void
    {
        $inst = Instance::factory()->create([
            'connectionStatus' => InstanceConnectionStatus::Close,
        ]);

        $this->service->updateConnectionStatus($inst->name, InstanceConnectionStatus::Open);

        $this->assertDatabaseHas('Instance', [
            'id'               => $inst->id,
            'connectionStatus' => 'open',
        ]);
    }

    public function test_create_with_webhook_sets_webhook(): void
    {
        $result = $this->service->create([
            'instanceName' => 'webhook-test-' . uniqid(),
            'webhook'      => [
                'url'     => 'https://example.com/webhook',
                'enabled' => true,
            ],
        ]);

        $instance = Instance::where('name', $result['instance']['instanceName'])->first();
        $this->assertNotNull($instance->webhook);
        $this->assertEquals('https://example.com/webhook', $instance->webhook->url);
    }
}
