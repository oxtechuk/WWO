<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * CleanupExpiredSessionsJob — removes expired chatbot integration sessions.
 * Runs daily via Task Scheduler.
 */
class CleanupExpiredSessionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function handle(): void
    {
        Log::info('CleanupExpiredSessionsJob: starting cleanup');

        $deleted = 0;

        // Clean integration_sessions older than 24h that are closed
        $deleted += DB::table('integration_sessions')
            ->where('status', 'closed')
            ->where('updated_at', '<', now()->subDay())
            ->delete();

        // Clean integration_sessions that have been open for more than 7 days (stuck)
        $deleted += DB::table('integration_sessions')
            ->where('status', 'opened')
            ->where('created_at', '<', now()->subDays(7))
            ->delete();

        Log::info('CleanupExpiredSessionsJob: completed', ['deleted' => $deleted]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('CleanupExpiredSessionsJob failed', ['error' => $exception->getMessage()]);
    }
}
