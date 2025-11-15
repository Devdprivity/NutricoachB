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
        Schema::create('favorite_meals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();

            // Información nutricional
            $table->decimal('calories', 8, 2);
            $table->decimal('protein', 8, 2)->default(0);
            $table->decimal('carbs', 8, 2)->default(0);
            $table->decimal('fat', 8, 2)->default(0);
            $table->decimal('fiber', 8, 2)->nullable();

            // Información adicional
            $table->string('portion_size')->nullable(); // Ejemplo: "1 plato", "250g"
            $table->json('ingredients')->nullable(); // Lista de ingredientes
            $table->string('meal_type')->nullable(); // breakfast, lunch, dinner, snack
            $table->string('image_path')->nullable();

            // Organización
            $table->json('tags')->nullable(); // Array de tags para búsqueda
            $table->integer('times_used')->default(0);
            $table->timestamp('last_used_at')->nullable();

            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['user_id', 'meal_type']);
            $table->index(['user_id', 'times_used']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorite_meals');
    }
};
