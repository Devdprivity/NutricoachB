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
        Schema::table('user_profiles', function (Blueprint $table) {
            // Contextura física y tipo de cuerpo
            $table->enum('body_frame', ['small', 'medium', 'large'])->nullable()->after('activity_level');
            $table->enum('body_type', ['ectomorph', 'mesomorph', 'endomorph'])->nullable()->after('body_frame');

            // Circunferencias para cálculos más precisos
            $table->decimal('wrist_circumference', 5, 2)->nullable()->after('body_type')->comment('En cm');
            $table->decimal('waist_circumference', 5, 2)->nullable()->after('wrist_circumference')->comment('En cm');
            $table->decimal('hip_circumference', 5, 2)->nullable()->after('waist_circumference')->comment('En cm');
            $table->decimal('neck_circumference', 5, 2)->nullable()->after('hip_circumference')->comment('En cm');

            // Composición corporal
            $table->decimal('body_fat_percentage', 5, 2)->nullable()->after('neck_circumference')->comment('Porcentaje de grasa corporal');
            $table->decimal('muscle_mass_percentage', 5, 2)->nullable()->after('body_fat_percentage')->comment('Porcentaje de masa muscular');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'body_frame',
                'body_type',
                'wrist_circumference',
                'waist_circumference',
                'hip_circumference',
                'neck_circumference',
                'body_fat_percentage',
                'muscle_mass_percentage',
            ]);
        });
    }
};
