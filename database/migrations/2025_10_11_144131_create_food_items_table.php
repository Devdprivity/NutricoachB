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
        Schema::create('food_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['protein', 'carbohydrate', 'fat', 'vegetable', 'fruit', 'dairy', 'supplement', 'other']);
            $table->integer('calories_per_100g'); // calorías por 100g
            $table->decimal('protein_per_100g', 5, 2); // proteína por 100g
            $table->decimal('carbs_per_100g', 5, 2); // carbohidratos por 100g
            $table->decimal('fat_per_100g', 5, 2); // grasas por 100g
            $table->decimal('fiber_per_100g', 5, 2)->default(0); // fibra por 100g
            $table->decimal('sugar_per_100g', 5, 2)->default(0); // azúcar por 100g
            $table->decimal('sodium_per_100g', 5, 2)->default(0); // sodio por 100g
            $table->string('unit')->default('g'); // unidad de medida
            $table->boolean('is_cooked')->default(true); // si está cocido
            $table->text('cooking_method')->nullable(); // método de cocción
            $table->json('tags')->nullable(); // etiquetas como ['healthy', 'high-protein', 'low-carb']
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['category', 'is_active']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_items');
    }
};