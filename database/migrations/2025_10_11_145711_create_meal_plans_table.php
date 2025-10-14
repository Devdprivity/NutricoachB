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
            $table->date('plan_date');
            $table->string('meal_type'); // e.g., breakfast, lunch, dinner, snack
            $table->foreignId('food_item_id')->nullable()->constrained()->onDelete('set null');
            $table->float('quantity_grams')->nullable();
            $table->float('calories_planned')->nullable();
            $table->float('protein_planned')->nullable();
            $table->float('carbs_planned')->nullable();
            $table->float('fats_planned')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
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