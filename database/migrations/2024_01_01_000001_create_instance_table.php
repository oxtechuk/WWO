<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for the `Instance` table — core multi-tenant entity.
 * Matches Wox-Ox Prisma schema exactly.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Instance', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name', 255)->unique();
            $table->enum('connectionStatus', ['open', 'close', 'connecting'])->default('open');
            $table->string('ownerJid', 100)->nullable();
            $table->string('profileName', 100)->nullable();
            $table->string('profilePicUrl', 500)->nullable();
            $table->string('integration', 100)->nullable();
            $table->string('number', 100)->nullable();
            $table->string('businessId', 100)->nullable();
            $table->string('token', 255)->nullable();
            $table->string('clientName', 100)->nullable();
            $table->integer('disconnectionReasonCode')->nullable();
            $table->json('disconnectionObject')->nullable();
            $table->timestamp('disconnectionAt')->nullable();
            $table->timestamp('createdAt')->useCurrent()->nullable();
            $table->timestamp('updatedAt')->nullable()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Instance');
    }
};
