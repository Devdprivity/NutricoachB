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
        Schema::create('meal_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']);
            $table->foreignId('food_item_id')->constrained()->onDelete('cascade');
            $table->decimal('planned_quantity', 8, 2);
            $table->string('planned_unit')->default('g');
            $table->integer('planned_calories');
            $table->decimal('planned_protein', 6, 2);
            $table->decimal('planned_carbs', 6, 2);
            $table->decimal('planned_fat', 6, 2);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'date', 'meal_type']);
            $table->index(['user_id', 'is_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_plans');
    }
};