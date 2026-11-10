<?php

namespace App\Jobs;

use App\Services\Webhook\WebhookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * SendWebhookJob — reliable webhook delivery with exponential backoff.
 * Replaces Wox-Ox's manual retry logic with Laravel Queue.
 */
class SendWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Max retry attempts — matches WEBHOOK_RETRY_MAX_ATTEMPTS.
     */
    public int $tries = 10;

    /**
     * Timeout in seconds.
     */
    public int $timeout = 60;

    /**
     * Exponential backoff delays in seconds (matches Wox-Ox config).
     */
    public array $backoff = [5, 10, 30, 60, 120, 300, 300, 300, 300, 300];

    /**
     * Non-retryable HTTP status codes — matches WEBHOOK_RETRY_NON_RETRYABLE_STATUS_CODES.
     */
    private array $nonRetryableCodes = [400, 401, 403, 404, 422];

    public function __construct(
        private readonly string $url,
        private readonly string $event,
        private readonly array  $data,
        private readonly string $instanceName,
    ) {
        $this->nonRetryableCodes = config(
            'evolution.webhook.retry_non_retryable_codes',
            [400, 401, 403, 404, 422]
        );
    }

    public function handle(WebhookService $webhookService): void
    {
        $success = $webhookService->send(
            $this->url,
            $this->event,
            $this->data,
            $this->instanceName,
        );

        if (!$success) {
            throw new \RuntimeException("Webhook delivery failed for event [{$this->event}] to [{$this->url}]");
        }
    }

    /**
     * Determine if job should retry based on exception type.
     */
    public function shouldRetryOn(\Throwable $e): bool
    {
        // Don't retry on non-retryable status codes
        if (method_exists($e, 'getCode')) {
            $code = $e->getCode();
            if (in_array($code, $this->nonRetryableCodes)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Handle final failure after all retries.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('Webhook permanently failed after all retries', [
            'url'      => $this->url,
            'event'    => $this->event,
            'instance' => $this->instanceName,
            'error'    => $exception->getMessage(),
        ]);
    }
}
