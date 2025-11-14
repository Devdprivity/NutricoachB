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
        Schema::create('meal_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('meal_type', ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack', 'other'])->default('other');
            $table->time('time')->nullable();
            $table->string('image_path')->nullable();
            $table->decimal('calories', 8, 2)->nullable();
            $table->decimal('protein', 8, 2)->nullable(); // gramos
            $table->decimal('carbs', 8, 2)->nullable(); // gramos
            $table->decimal('fat', 8, 2)->nullable(); // gramos
            $table->decimal('fiber', 8, 2)->nullable(); // gramos
            $table->text('food_items')->nullable(); // JSON or text description of foods
            $table->text('ai_description')->nullable(); // AI generated description
            $table->boolean('ai_analyzed')->default(false);
            $table->text('notes')->nullable(); // User notes
            $table->timestamps();

            $table->index(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_records');
    }
};
