<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Contact', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('remoteJid', 50);
            $table->string('pushName', 100)->nullable();
            $table->string('profilePicUrl', 500)->nullable();
            $table->timestamp('createdAt')->useCurrent()->nullable();
            $table->timestamp('updatedAt')->nullable()->useCurrentOnUpdate();
            $table->string('instanceId');

            $table->unique(['remoteJid', 'instanceId']);
            $table->index(['remoteJid']);
            $table->index(['instanceId']);

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Contact');
    }
};
