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
        Schema::create('progress_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('image_path');

            // Medidas corporales opcionales
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('body_fat_percentage', 5, 2)->nullable();

            // Medidas detalladas (JSON: cintura, pecho, caderas, brazos, piernas, etc.)
            $table->json('measurements')->nullable();

            // Notas y visibilidad
            $table->text('notes')->nullable();
            $table->enum('visibility', ['private', 'public'])->default('private');

            // Foto de referencia (primera foto o foto objetivo)
            $table->boolean('is_baseline')->default(false);

            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'is_baseline']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_photos');
    }
};
