<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI Chatbot integration tables: Typebot, OpenAI, Dify, EvolutionBot, Flowise, N8n, EvoAI
 */
return new class extends Migration
{
    public function up(): void
    {
        // Typebot
        Schema::create('Typebot', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('url', 500);
            $table->string('typebot', 255);
            $table->json('variables')->nullable();
            $table->boolean('expire')->default(false);
            $table->integer('keywordFinish')->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->string('instanceId');

            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // TypebotSetting
        Schema::create('TypebotSetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('typebotIdFallback')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // OpenaiCreds
        Schema::create('OpenaiCreds', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name', 100)->unique();
            $table->string('apiKey', 255);
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // OpenaiBot
        Schema::create('OpenaiBot', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('openaiCredsId');
            $table->enum('botType', ['assistant', 'chatCompletion']);
            $table->string('assistantId', 255)->nullable();
            $table->string('functionUrl', 500)->nullable();
            $table->string('model', 100)->nullable();
            $table->text('systemMessages')->nullable();
            $table->text('assistantMessages')->nullable();
            $table->text('userMessages')->nullable();
            $table->integer('maxTokens')->nullable();
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('speechToText')->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
            $table->foreign('openaiCredsId')->references('id')->on('OpenaiCreds')->onDelete('cascade');
        });

        // OpenaiSetting
        Schema::create('OpenaiSetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('openaiCredsId')->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('openaiIdFallback')->nullable();
            $table->string('speechToText')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Dify
        Schema::create('Dify', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('apiUrl', 500);
            $table->string('apiKey', 255);
            $table->enum('botType', ['chatBot', 'textGenerator', 'agent', 'workflow']);
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // DifySetting
        Schema::create('DifySetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('difyIdFallback')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // EvolutionBot
        Schema::create('EvolutionBot', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('apiUrl', 500);
            $table->string('apiKey', 255);
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // EvolutionBotSetting
        Schema::create('EvolutionBotSetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('evolutionBotIdFallback')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Flowise
        Schema::create('Flowise', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('apiUrl', 500);
            $table->string('apiKey', 255)->nullable();
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // FlowiseSetting
        Schema::create('FlowiseSetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('flowiseIdFallback')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // N8n
        Schema::create('N8n', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('apiUrl', 500);
            $table->string('apiKey', 255)->nullable();
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // N8nSetting
        Schema::create('N8nSetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('n8nIdFallback')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Evoai
        Schema::create('Evoai', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('agentUrl', 500);
            $table->string('apiKey', 255)->nullable();
            $table->enum('triggerType', ['all', 'keyword', 'none', 'advanced'])->nullable();
            $table->enum('triggerOperator', ['contains', 'equals', 'startsWith', 'endsWith', 'regex'])->nullable();
            $table->string('triggerValue', 500)->nullable();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // EvoaiSetting
        Schema::create('EvoaiSetting', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->integer('expire')->default(0);
            $table->string('keywordFinish', 100)->nullable();
            $table->integer('delayMessage')->nullable();
            $table->string('unknownMessage', 500)->nullable();
            $table->boolean('listeningFromMe')->default(false);
            $table->boolean('stopBotFromMe')->default(false);
            $table->boolean('keepOpen')->default(false);
            $table->integer('debounceTime')->nullable();
            $table->string('evoaiIdFallback')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Template
        Schema::create('Template', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name', 255);
            $table->string('language', 10);
            $table->string('category', 50);
            $table->json('components');
            $table->string('templateId', 100)->nullable();
            $table->string('status', 30)->nullable();
            $table->string('instanceId');
            $table->index(['instanceId']);
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // IsOnWhatsAppCache
        Schema::create('IsOnWhatsappCache', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('remoteJid', 100)->unique();
            $table->boolean('isInWhatsapp');
            $table->timestamp('updatedAt')->nullable()->useCurrentOnUpdate();
            $table->timestamp('createdAt')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('IsOnWhatsappCache');
        Schema::dropIfExists('Template');
        Schema::dropIfExists('EvoaiSetting');
        Schema::dropIfExists('Evoai');
        Schema::dropIfExists('N8nSetting');
        Schema::dropIfExists('N8n');
        Schema::dropIfExists('FlowiseSetting');
        Schema::dropIfExists('Flowise');
        Schema::dropIfExists('EvolutionBotSetting');
        Schema::dropIfExists('EvolutionBot');
        Schema::dropIfExists('DifySetting');
        Schema::dropIfExists('Dify');
        Schema::dropIfExists('OpenaiSetting');
        Schema::dropIfExists('OpenaiBot');
        Schema::dropIfExists('OpenaiCreds');
        Schema::dropIfExists('TypebotSetting');
        Schema::dropIfExists('Typebot');
    }
};
