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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Free, Basic, Premium
            $table->string('slug')->unique(); // free, basic, premium
            $table->text('description')->nullable();
            $table->decimal('price_monthly', 8, 2)->default(0);
            $table->decimal('price_yearly', 8, 2)->default(0);
            $table->json('features')->nullable(); // Lista de características
            $table->integer('max_recipes')->nullable(); // null = ilimitado
            $table->integer('max_workout_plans')->nullable();
            $table->integer('max_meal_plans')->nullable();
            $table->boolean('ai_coaching')->default(false);
            $table->boolean('progress_analytics')->default(false);
            $table->boolean('custom_recipes')->default(false);
            $table->boolean('export_data')->default(false);
            $table->boolean('priority_support')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
