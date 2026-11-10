<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Media', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('url', 500);
            $table->string('mimetype', 100)->nullable();
            $table->string('filename', 255)->nullable();
            $table->bigInteger('fileLength')->nullable();
            $table->integer('mediaType')->nullable();
            $table->string('media', 100)->nullable();
            $table->string('messageId')->unique();
            $table->string('instanceId');

            $table->index(['instanceId']);

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
        Schema::dropIfExists('Media');
    }
};
