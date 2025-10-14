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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('height', 5, 2)->nullable(); // altura en cm
            $table->decimal('weight', 5, 2)->nullable(); // peso en kg
            $table->integer('age')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'active', 'very_active'])->default('moderate');
            $table->integer('daily_calorie_goal')->nullable();
            $table->integer('protein_goal')->nullable(); // en gramos
            $table->integer('carbs_goal')->nullable(); // en gramos
            $table->integer('fat_goal')->nullable(); // en gramos
            $table->integer('water_goal')->default(4000); // en ml, default 4L
            $table->decimal('target_weight', 5, 2)->nullable(); // peso objetivo
            $table->date('target_date')->nullable(); // fecha objetivo
            $table->text('medical_conditions')->nullable();
            $table->text('dietary_restrictions')->nullable();
            $table->boolean('is_medically_supervised')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};