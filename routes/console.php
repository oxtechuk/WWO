<?php

use App\Jobs\BackupDatabaseJob;
use App\Jobs\CleanupExpiredSessionsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Wox-Lv Task Scheduler
|--------------------------------------------------------------------------
| مجدول المهام — بدل cron jobs يدوية.
| يعمل عبر: php artisan schedule:work (أو schedule:run كل دقيقة)
|--------------------------------------------------------------------------
*/

// تنظيف الجلسات المنتهية يومياً
Schedule::job(new CleanupExpiredSessionsJob())->daily()->withoutOverlapping();

// نسخ احتياطي يومي الساعة 2 صباحاً
Schedule::job(new BackupDatabaseJob())->dailyAt('02:00')->withoutOverlapping();

// إعادة تشغيل Queue Worker كل ساعة لمنع memory leaks
Schedule::command('queue:restart')->hourly();

// Health check report يومياً
Schedule::command('health:check')->daily();
