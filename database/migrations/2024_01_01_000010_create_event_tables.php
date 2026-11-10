<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Event system tables: Rabbitmq, Nats, Sqs, Kafka, Websocket, Pusher
 */
return new class extends Migration
{
    public function up(): void
    {
        // Rabbitmq
        Schema::create('Rabbitmq', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Nats
        Schema::create('Nats', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Sqs
        Schema::create('Sqs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Kafka
        Schema::create('Kafka', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Websocket
        Schema::create('Websocket', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });

        // Pusher
        Schema::create('Pusher', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->json('events')->nullable();
            $table->string('instanceId')->unique();
            $table->foreign('instanceId')->references('id')->on('Instance')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Pusher');
        Schema::dropIfExists('Websocket');
        Schema::dropIfExists('Kafka');
        Schema::dropIfExists('Sqs');
        Schema::dropIfExists('Nats');
        Schema::dropIfExists('Rabbitmq');
    }
};
