<?php

namespace Tests\Feature;

use App\Models\Instance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampaignTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_campaigns_returns_empty_or_list(): void
    {
        $response = $this->getJson('/saas/campaigns/test_tenant');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_save_and_launch_campaign(): void
    {
        $instance = Instance::factory()->create(['name' => 'sales_inst_1']);

        // 1. Create a campaign
        $payload = [
            'name' => 'حملة العروض الكبرى',
            'instances' => ['sales_inst_1'],
            'template' => '{مرحباً|أهلاً} يا {name}، كود الخصم هو {var1}',
            'recipients' => [
                ['phone' => '966501112233', 'name' => 'فهد', 'var1' => 'VIP50'],
                ['phone' => '966509998877', 'name' => 'سارة', 'var1' => 'VIP50'],
            ],
            'anti_ban' => [
                'min_delay' => 10,
                'max_delay' => 25,
                'batch_size' => 10,
                'cooldown_minutes' => 2,
                'simulate_typing' => true,
                'rotate_instances' => true,
            ],
        ];

        $saveResponse = $this->postJson('/saas/campaigns/test_tenant', $payload);

        $saveResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', 'حملة العروض الكبرى');

        $campaignId = $saveResponse->json('data.id');

        // 2. Launch the campaign
        $launchResponse = $this->postJson("/saas/campaigns/test_tenant/{$campaignId}/launch");

        $launchResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // 3. Pause the campaign
        $pauseResponse = $this->postJson("/saas/campaigns/test_tenant/{$campaignId}/pause");

        $pauseResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'paused');

        // 4. Resume the campaign
        $resumeResponse = $this->postJson("/saas/campaigns/test_tenant/{$campaignId}/resume");

        $resumeResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // 5. Delete the campaign
        $deleteResponse = $this->deleteJson("/saas/campaigns/test_tenant/{$campaignId}");

        $deleteResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_send_test_preview_message(): void
    {
        $instance = Instance::factory()->create(['name' => 'test_preview_inst']);

        $payload = [
            'phone' => '966501234567',
            'instance_name' => 'test_preview_inst',
            'template' => '{مرحباً|أهلاً} بك يا {name} في {var1}',
            'sample_name' => 'عبدالله',
            'sample_var1' => 'متجر النخبة',
        ];

        $response = $this->postJson('/saas/campaigns/test-send', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'message', 'rendered_text']);
    }
}
