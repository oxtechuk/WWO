<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

/**
 * BackupDatabaseJob — triggers a full database backup via spatie/laravel-backup.
 * Runs daily at 02:00 via Task Scheduler.
 */
class BackupDatabaseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 600; // 10 minutes

    public function handle(): void
    {
        Log::info('BackupDatabaseJob: starting backup');

        try {
            Artisan::call('backup:run', ['--only-db' => true]);
            $output = Artisan::output();
            Log::info('BackupDatabaseJob: completed', ['output' => $output]);
        } catch (\Exception $e) {
            Log::error('BackupDatabaseJob failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('BackupDatabaseJob permanently failed', ['error' => $exception->getMessage()]);
    }
}
