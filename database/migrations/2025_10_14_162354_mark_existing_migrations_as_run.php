<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Marcar migraciones existentes como ejecutadas sin crear las tablas
        $existingMigrations = [
            '2025_10_11_144100_create_food_items_table',
            '2025_10_11_144119_create_nutritional_data_table',
            '2025_10_11_144137_create_user_profiles_table',
            '2025_10_11_144936_create_hydration_records_table',
            '2025_10_11_144944_create_coaching_messages_table',
            '2025_10_11_145005_create_user_alerts_table',
            '2025_10_11_145704_create_user_contexts_table',
            '2025_10_11_145711_create_meal_plans_table',
            '2025_10_11_145751_create_medical_disclaimers_table',
        ];

        foreach ($existingMigrations as $migration) {
            // Verificar si la migración ya está registrada
            $exists = DB::table('migrations')->where('migration', $migration)->exists();
            
            if (!$exists) {
                // Insertar la migración como ejecutada
                DB::table('migrations')->insert([
                    'migration' => $migration,
                    'batch' => 1,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hacer nada en el rollback para evitar problemas
    }
};
