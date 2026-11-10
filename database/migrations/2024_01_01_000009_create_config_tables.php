<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Webhook
        Schema::create('Webhook', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('url', 500);
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->boolean('webhookByEvents')->default(false);
            $table->boolean('webhookBase64')->default(false);
            $table->string('instanceId')->unique();

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });

        // Setting
        Schema::create('Setting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('rejectCall')->default(false);
            $table->string('msgCall', 500)->nullable();
            $table->boolean('groupsIgnore')->default(false);
            $table->boolean('alwaysOnline')->default(false);
            $table->boolean('readMessages')->default(false);
            $table->boolean('readStatus')->default(false);
            $table->boolean('syncFullHistory')->default(false);
            $table->string('instanceId')->unique();

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });

        // Label
        Schema::create('Label', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('labelId', 50);
            $table->string('name', 100);
            $table->string('color', 50)->nullable();
            $table->string('predefinedId', 100)->nullable();
            $table->string('instanceId');

            $table->unique(['labelId', 'instanceId']);
            $table->index(['instanceId']);

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });

        // Proxy
        Schema::create('Proxy', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('host', 100);
            $table->string('port', 20);
            $table->string('protocol', 20);
            $table->string('username', 100)->nullable();
            $table->string('password', 255)->nullable();
            $table->boolean('enabled')->default(false);
            $table->string('instanceId')->unique();

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });

        // Chatwoot
        Schema::create('Chatwoot', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('accountId', 100);
            $table->string('token', 255);
            $table->string('url', 500);
            $table->boolean('nameInbox')->default(false);
            $table->boolean('signMsg')->default(false);
            $table->boolean('signDelimiter')->nullable();
            $table->boolean('reopenConversation')->default(false);
            $table->boolean('conversationPending')->default(false);
            $table->string('mergeBrazilContacts')->nullable();
            $table->boolean('importContacts')->nullable();
            $table->boolean('importMessages')->nullable();
            $table->integer('daysLimitImportMessages')->nullable();
            $table->string('organization', 100)->nullable();
            $table->string('logo', 500)->nullable();
            $table->boolean('ignoreJids')->nullable();
            $table->boolean('qrcode')->nullable();
            $table->string('instanceId')->unique();

            $table->foreign('instanceId')
                ->references('id')
                ->on('Instance')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Chatwoot');
        Schema::dropIfExists('Proxy');
        Schema::dropIfExists('Label');
        Schema::dropIfExists('Setting');
        Schema::dropIfExists('Webhook');
    }
};
