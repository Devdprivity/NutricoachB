<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // achievement, workout, meal, progress_photo, weight_update, etc.
            $table->text('description');
            $table->json('data')->nullable(); // Datos adicionales específicos del tipo de actividad
            $table->string('image_url')->nullable();
            $table->enum('visibility', ['public', 'followers', 'private'])->default('public');
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('visibility');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
