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
        Schema::dropIfExists('nutritional_data');

        Schema::create('nutritional_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('food_item_id')->constrained()->onDelete('cascade');
            $table->date('consumption_date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']);
            $table->decimal('quantity', 8, 2); // cantidad consumida
            $table->string('unit')->default('g'); // unidad de medida
            $table->integer('calories'); // calorías totales
            $table->decimal('protein', 6, 2); // proteína total
            $table->decimal('carbs', 6, 2); // carbohidratos totales
            $table->decimal('fat', 6, 2); // grasas totales
            $table->decimal('fiber', 6, 2)->default(0); // fibra total
            $table->decimal('sugar', 6, 2)->default(0); // azúcar total
            $table->decimal('sodium', 6, 2)->default(0); // sodio total
            $table->text('notes')->nullable(); // notas adicionales
            $table->enum('mood', ['excellent', 'good', 'neutral', 'poor', 'terrible'])->nullable();
            $table->integer('energy_level')->nullable(); // 1-10 escala
            $table->integer('hunger_level')->nullable(); // 1-10 escala
            $table->boolean('was_planned')->default(false); // si estaba planificado
            $table->json('context')->nullable(); // contexto adicional como lugar, compañía, etc.
            $table->timestamps();
            
            $table->index(['user_id', 'consumption_date']);
            $table->index(['user_id', 'meal_type', 'consumption_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutritional_data');
    }
};