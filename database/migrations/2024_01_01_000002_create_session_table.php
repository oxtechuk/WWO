<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for WhatsApp session credentials storage.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Session', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('sessionId')->unique();
            $table->longText('creds')->nullable();
            $table->timestamp('createdAt')->useCurrent();

            $table->foreign('sessionId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Session');
    }
};
