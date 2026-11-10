<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Message', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->json('key');
            $table->string('pushName', 100)->nullable();
            $table->string('participant', 100)->nullable();
            $table->string('messageType', 100);
            $table->json('message');
            $table->json('contextInfo')->nullable();
            $table->enum('source', ['ios', 'android', 'web', 'unknown', 'desktop']);
            $table->integer('messageTimestamp');
            $table->integer('chatwootMessageId')->nullable();
            $table->integer('chatwootInboxId')->nullable();
            $table->integer('chatwootConversationId')->nullable();
            $table->string('chatwootContactInboxSourceId', 100)->nullable();
            $table->boolean('chatwootIsRead')->default(false)->nullable();
            $table->string('instanceId');
            $table->string('typebotSessionId')->nullable();
            $table->string('webhookUrl', 500)->nullable();
            $table->string('status', 30)->nullable();
            $table->string('sessionId')->nullable();

            $table->index(['instanceId']);

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');

            $table->foreign('sessionId')
                ->references('id')
                ->on('IntegrationSession')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Message');
    }
};
