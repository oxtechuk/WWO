<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('MessageUpdate', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('keyId', 100);
            $table->string('remoteJid', 100);
            $table->boolean('fromMe');
            $table->string('participant', 100)->nullable();
            $table->json('pollUpdates')->nullable();
            $table->string('status', 30);
            $table->string('messageId');
            $table->string('instanceId');

            $table->index(['instanceId']);
            $table->index(['messageId']);

            $table->foreign('messageId')
                ->references('id')
                ->on('Message')
                ->onDelete('cascade');

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('MessageUpdate');
    }
};
