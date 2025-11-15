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
        Schema::create('weekly_meal_plan_recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('weekly_meal_plan_id')->constrained()->onDelete('cascade');
            $table->foreignId('recipe_id')->constrained()->onDelete('cascade');
            $table->string('day_of_week'); // monday, tuesday, etc.
            $table->string('meal_type'); // breakfast, lunch, dinner, snack
            $table->integer('servings')->default(1);
            $table->timestamps();

            $table->index(['weekly_meal_plan_id', 'day_of_week']);
            $table->index('recipe_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_meal_plan_recipes');
    }
};
