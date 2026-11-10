<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // IntegrationSession must come before Message (FK reference)
        Schema::create('IntegrationSession', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('sessionId', 100)->unique();
            $table->string('remoteJid', 100);
            $table->string('pushName', 100)->nullable();
            $table->enum('status', ['opened', 'closed', 'paused'])->default('opened');
            $table->json('context')->nullable();
            $table->string('type', 100);
            $table->boolean('awaitUser')->default(false);
            $table->string('botId')->nullable();
            $table->string('instanceId');
            $table->timestamp('createdAt')->useCurrent()->nullable();
            $table->timestamp('updatedAt')->nullable()->useCurrentOnUpdate();

            $table->index(['instanceId']);
            $table->index(['remoteJid']);

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('IntegrationSession');
    }
};
