<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Chat', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('remoteJid', 50);
            $table->string('name', 100)->nullable();
            $table->json('labels')->nullable();
            $table->timestamp('createdAt')->useCurrent()->nullable();
            $table->timestamp('updatedAt')->nullable()->useCurrentOnUpdate();
            $table->string('instanceId');
            $table->integer('unreadMessages')->default(0);

            $table->unique(['instanceId', 'remoteJid']);
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
        Schema::dropIfExists('Chat');
    }
};
