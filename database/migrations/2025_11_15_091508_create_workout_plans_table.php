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
        Schema::create('workout_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->default('intermediate');
            $table->integer('duration_weeks')->nullable(); // Duración en semanas
            $table->json('schedule')->nullable(); // Horario: {monday: true, tuesday: false, ...}
            $table->string('goal')->nullable(); // Objetivo: perder peso, ganar músculo, mantenerse, etc.
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false); // Si otros usuarios pueden ver el plan
            $table->integer('times_completed')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index('difficulty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_plans');
    }
};
