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
        Schema::create('weekly_meal_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->json('daily_schedule')->nullable(); // Estructura: {monday: {breakfast: recipe_id, lunch: recipe_id, ...}, ...}
            $table->integer('target_calories')->nullable();
            $table->decimal('target_protein_g', 8, 2)->nullable();
            $table->decimal('target_carbs_g', 8, 2)->nullable();
            $table->decimal('target_fat_g', 8, 2)->nullable();
            $table->string('goal')->nullable(); // perder peso, mantener, ganar músculo
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->integer('times_completed')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_meal_plans');
    }
};
