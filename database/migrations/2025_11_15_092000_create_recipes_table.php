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
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // desayuno, almuerzo, cena, snack, postre
            $table->integer('prep_time_minutes')->nullable();
            $table->integer('cook_time_minutes')->nullable();
            $table->integer('servings')->default(1);
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->json('instructions')->nullable(); // Pasos de preparación
            $table->string('image_url')->nullable();
            $table->boolean('is_public')->default(false);
            $table->integer('calories_per_serving')->nullable();
            $table->decimal('protein_g', 8, 2)->nullable();
            $table->decimal('carbs_g', 8, 2)->nullable();
            $table->decimal('fat_g', 8, 2)->nullable();
            $table->decimal('fiber_g', 8, 2)->nullable();
            $table->integer('times_cooked')->default(0);
            $table->decimal('rating', 3, 2)->nullable(); // Rating promedio
            $table->timestamps();

            $table->index(['user_id', 'category']);
            $table->index('is_public');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
