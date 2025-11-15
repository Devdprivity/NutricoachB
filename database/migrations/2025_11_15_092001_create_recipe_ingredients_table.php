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
        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('quantity', 8, 2);
            $table->string('unit'); // g, kg, ml, l, taza, cucharada, unidad, etc.
            $table->text('notes')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['recipe_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipe_ingredients');
    }
};
