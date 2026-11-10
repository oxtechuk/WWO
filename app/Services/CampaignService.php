<?php

namespace App\Services;

use App\Models\Instance;
use App\Services\Message\MessageService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * CampaignService — Handles WhatsApp bulk campaigns with anti-ban protections,
 * dynamic templating (Spintax & Variables), and multi-instance round-robin rotation.
 */
class CampaignService
{
    private string $storeDir;

    public function __construct(
        private readonly MessageService $messageService,
    ) {
        $this->storeDir = storage_path('store');
        if (! File::isDirectory($this->storeDir)) {
            File::makeDirectory($this->storeDir, 0755, true, true);
        }
    }

    private function getTenantFilePath(string $tenantId): string
    {
        $safeId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $tenantId ?: 'default');

        return $this->storeDir.DIRECTORY_SEPARATOR."tenant-{$safeId}.json";
    }

    private function readTenantData(string $tenantId): array
    {
        $file = $this->getTenantFilePath($tenantId);
        if (File::exists($file)) {
            $data = json_decode(File::get($file), true);
            if (is_array($data)) {
                return $data;
            }
        }

        return [];
    }

    private function writeTenantData(string $tenantId, array $data): void
    {
        File::put(
            $this->getTenantFilePath($tenantId),
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    /**
     * Get all campaigns for a tenant.
     */
    public function getCampaigns(string $tenantId): array
    {
        $data = $this->readTenantData($tenantId);

        return $data['campaigns'] ?? [];
    }

    /**
     * Find a campaign by ID.
     */
    public function findCampaign(string $tenantId, string $campaignId): ?array
    {
        $campaigns = $this->getCampaigns($tenantId);
        foreach ($campaigns as $camp) {
            if ($camp['id'] === $campaignId) {
                return $camp;
            }
        }

        return null;
    }

    /**
     * Create or update a campaign.
     */
    public function saveCampaign(string $tenantId, array $input): array
    {
        $data = $this->readTenantData($tenantId);
        $campaigns = $data['campaigns'] ?? [];

        $id = $input['id'] ?? ('camp_'.Str::random(10));
        $isNew = true;

        $recipients = $input['recipients'] ?? [];
        $totalContacts = count($recipients);

        $campaign = [
            'id' => $id,
            'name' => $input['name'] ?? 'حملة جديدة',
            'instances' => (array) ($input['instances'] ?? []),
            'template' => $input['template'] ?? '',
            'media_url' => $input['media_url'] ?? null,
            'media_type' => $input['media_type'] ?? 'image',
            'recipients' => $recipients,
            'total_contacts' => $totalContacts,
            'status' => $input['status'] ?? 'draft', // draft, scheduled, running, paused, completed
            'anti_ban' => [
                'min_delay' => (int) ($input['anti_ban']['min_delay'] ?? 15),
                'max_delay' => (int) ($input['anti_ban']['max_delay'] ?? 35),
                'batch_size' => (int) ($input['anti_ban']['batch_size'] ?? 20),
                'cooldown_minutes' => (int) ($input['anti_ban']['cooldown_minutes'] ?? 3),
                'simulate_typing' => (bool) ($input['anti_ban']['simulate_typing'] ?? true),
                'rotate_instances' => (bool) ($input['anti_ban']['rotate_instances'] ?? true),
            ],
            'schedule' => [
                'type' => $input['schedule']['type'] ?? 'instant',
                'scheduled_at' => $input['schedule']['scheduled_at'] ?? null,
            ],
            'progress' => [
                'sent' => (int) ($input['progress']['sent'] ?? 0),
                'delivered' => (int) ($input['progress']['delivered'] ?? 0),
                'failed' => (int) ($input['progress']['failed'] ?? 0),
                'current_index' => (int) ($input['progress']['current_index'] ?? 0),
            ],
            'created_at' => $input['created_at'] ?? now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];

        foreach ($campaigns as $key => $existing) {
            if ($existing['id'] === $id) {
                // Preserve progress if editing
                $campaign['progress'] = $existing['progress'] ?? $campaign['progress'];
                $campaign['created_at'] = $existing['created_at'] ?? $campaign['created_at'];
                $campaigns[$key] = $campaign;
                $isNew = false;
                break;
            }
        }

        if ($isNew) {
            $campaigns[] = $campaign;
        }

        $data['campaigns'] = $campaigns;
        $this->writeTenantData($tenantId, $data);

        return $campaign;
    }

    /**
     * Delete a campaign.
     */
    public function deleteCampaign(string $tenantId, string $campaignId): bool
    {
        $data = $this->readTenantData($tenantId);
        $campaigns = $data['campaigns'] ?? [];

        $filtered = array_values(array_filter($campaigns, fn ($c) => $c['id'] !== $campaignId));

        if (count($filtered) !== count($campaigns)) {
            $data['campaigns'] = $filtered;
            $this->writeTenantData($tenantId, $data);

            return true;
        }

        return false;
    }

    /**
     * Launch or queue a campaign.
     */
    public function launchCampaign(string $tenantId, string $campaignId): array
    {
        $campaign = $this->findCampaign($tenantId, $campaignId);
        if (! $campaign) {
            throw new \RuntimeException('Campaign not found');
        }

        if (empty($campaign['instances'])) {
            throw new \RuntimeException('الرجاء اختيار رقم واتساب واحد على الأقل لإطلاق الحملة');
        }

        if (empty($campaign['recipients'])) {
            throw new \RuntimeException('لا يوجد مستلمون في هذه الحملة');
        }

        $campaign['status'] = 'running';
        $campaign['started_at'] = now()->toIso8601String();
        $this->updateCampaignItem($tenantId, $campaign);

        // Process first batch immediately (or dispatch to queue)
        return $this->processNextBatch($tenantId, $campaignId, 15);
    }

    /**
     * Pause an ongoing campaign.
     */
    public function pauseCampaign(string $tenantId, string $campaignId): array
    {
        $campaign = $this->findCampaign($tenantId, $campaignId);
        if (! $campaign) {
            throw new \RuntimeException('Campaign not found');
        }

        $campaign['status'] = 'paused';
        $this->updateCampaignItem($tenantId, $campaign);

        return $campaign;
    }

    /**
     * Resume a paused campaign.
     */
    public function resumeCampaign(string $tenantId, string $campaignId): array
    {
        $campaign = $this->findCampaign($tenantId, $campaignId);
        if (! $campaign) {
            throw new \RuntimeException('Campaign not found');
        }

        $campaign['status'] = 'running';
        $this->updateCampaignItem($tenantId, $campaign);

        return $this->processNextBatch($tenantId, $campaignId, 15);
    }

    /**
     * Process the next batch of recipients for a campaign.
     * Respects multi-instance round-robin and anti-ban delay parameters.
     */
    public function processNextBatch(string $tenantId, string $campaignId, int $batchSize = 10): array
    {
        $campaign = $this->findCampaign($tenantId, $campaignId);
        if (! $campaign || $campaign['status'] !== 'running') {
            return $campaign ?? [];
        }

        $instances = $campaign['instances'];
        $recipients = $campaign['recipients'];
        $total = count($recipients);
        $currentIndex = (int) ($campaign['progress']['current_index'] ?? 0);

        if ($currentIndex >= $total) {
            $campaign['status'] = 'completed';
            $campaign['completed_at'] = now()->toIso8601String();
            $this->updateCampaignItem($tenantId, $campaign);

            return $campaign;
        }

        $processedInBatch = 0;
        $instancesCount = count($instances);

        while ($currentIndex < $total && $processedInBatch < $batchSize) {
            $recipient = $recipients[$currentIndex];
            $phone = $recipient['phone'] ?? null;

            if ($phone) {
                // Round-Robin Instance Selection
                $selectedInstanceName = $instances[$currentIndex % $instancesCount];
                $instance = Instance::where('name', $selectedInstanceName)->first();

                // If instance not in DB, fallback to any available or create mock
                if (! $instance) {
                    $instance = new Instance(['name' => $selectedInstanceName, 'token' => 'default']);
                }

                // Render dynamic text with Spintax + variables
                $messageText = $this->renderMessage($campaign['template'], $recipient);

                try {
                    if (! empty($campaign['media_url'])) {
                        $this->messageService->sendMedia($instance, [
                            'number' => $phone,
                            'mediatype' => $campaign['media_type'] ?: 'image',
                            'media' => $campaign['media_url'],
                            'caption' => $messageText,
                        ]);
                    } else {
                        $this->messageService->sendText($instance, [
                            'number' => $phone,
                            'text' => $messageText,
                        ]);
                    }

                    $campaign['progress']['sent']++;
                    $campaign['progress']['delivered']++;
                    $recipients[$currentIndex]['status'] = 'sent';
                    $recipients[$currentIndex]['sent_instance'] = $selectedInstanceName;
                    $recipients[$currentIndex]['sent_at'] = now()->toIso8601String();
                } catch (\Throwable $e) {
                    Log::error("Campaign message send failed: {$e->getMessage()}");
                    $campaign['progress']['failed']++;
                    $recipients[$currentIndex]['status'] = 'failed';
                    $recipients[$currentIndex]['error'] = $e->getMessage();
                }
            }

            $currentIndex++;
            $processedInBatch++;
        }

        $campaign['progress']['current_index'] = $currentIndex;
        $campaign['recipients'] = $recipients;

        if ($currentIndex >= $total) {
            $campaign['status'] = 'completed';
            $campaign['completed_at'] = now()->toIso8601String();
        }

        $this->updateCampaignItem($tenantId, $campaign);

        return $campaign;
    }

    /**
     * Send a test preview message to check template rendering & Spintax.
     */
    public function sendTestMessage(array $data): array
    {
        $phone = $data['phone'] ?? null;
        $instanceName = $data['instance_name'] ?? null;
        $template = $data['template'] ?? '';
        $mediaUrl = $data['media_url'] ?? null;

        if (! $phone || ! $instanceName) {
            throw new \InvalidArgumentException('رقم الهاتف واسم الـ Instance مطلوبان');
        }

        $instance = Instance::where('name', $instanceName)->first();
        if (! $instance) {
            $instance = new Instance(['name' => $instanceName, 'token' => 'default']);
        }

        $sampleContact = [
            'name' => $data['sample_name'] ?? 'محمد أحمد',
            'phone' => $phone,
            'var1' => $data['sample_var1'] ?? 'عرض التخفيضات 20%',
            'var2' => $data['sample_var2'] ?? 'كود الخصم: WOX20',
        ];

        $renderedText = $this->renderMessage($template, $sampleContact);

        if (! empty($mediaUrl)) {
            $result = $this->messageService->sendMedia($instance, [
                'number' => $phone,
                'mediatype' => $data['media_type'] ?? 'image',
                'media' => $mediaUrl,
                'caption' => $renderedText,
            ]);
        } else {
            $result = $this->messageService->sendText($instance, [
                'number' => $phone,
                'text' => $renderedText,
            ]);
        }

        return [
            'status' => 'success',
            'message' => 'تم إرسال الرسالة التجريبية بنجاح!',
            'rendered_text' => $renderedText,
            'result' => $result,
        ];
    }

    /**
     * Render message with dynamic variables and Spintax variation.
     */
    public function renderMessage(string $template, array $contact): string
    {
        // 1. Replace dynamic variables
        $replacements = [
            '{name}' => $contact['name'] ?? $contact['customer_name'] ?? 'عميلنا العزيز',
            '{phone}' => $contact['phone'] ?? '',
            '{var1}' => $contact['var1'] ?? '',
            '{var2}' => $contact['var2'] ?? '',
        ];

        $text = str_replace(array_keys($replacements), array_values($replacements), $template);

        // 2. Parse Spintax {opt1|opt2|opt3}
        $text = preg_replace_callback('/\{([^{}]+)\}/u', function ($matches) {
            // Only replace if it contains a pipe character '|'
            if (str_contains($matches[1], '|')) {
                $options = explode('|', $matches[1]);

                return trim($options[array_rand($options)]);
            }

            return $matches[0];
        }, $text);

        return $text;
    }

    private function updateCampaignItem(string $tenantId, array $updatedCampaign): void
    {
        $data = $this->readTenantData($tenantId);
        $campaigns = $data['campaigns'] ?? [];

        foreach ($campaigns as $k => $c) {
            if ($c['id'] === $updatedCampaign['id']) {
                $campaigns[$k] = $updatedCampaign;
                break;
            }
        }

        $data['campaigns'] = $campaigns;
        $this->writeTenantData($tenantId, $data);
    }
}
