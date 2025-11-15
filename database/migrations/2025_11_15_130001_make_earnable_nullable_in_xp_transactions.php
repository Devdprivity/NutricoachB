<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Hacer nullable las columnas earnable_type y earnable_id
        // Usar DB::statement para evitar problemas con change()
        \DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_type` VARCHAR(255) NULL');
        \DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_id` BIGINT UNSIGNED NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir a not null (esto puede fallar si hay datos null)
        \DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_type` VARCHAR(255) NOT NULL');
        \DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_id` BIGINT UNSIGNED NOT NULL');
    }
};

