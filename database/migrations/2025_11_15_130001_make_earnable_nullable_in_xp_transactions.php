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
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // Sintaxis MySQL/MariaDB
            DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_type` VARCHAR(255) NULL');
            DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_id` BIGINT UNSIGNED NULL');
        } elseif ($driver === 'pgsql') {
            // Sintaxis PostgreSQL
            DB::statement('ALTER TABLE xp_transactions ALTER COLUMN earnable_type TYPE VARCHAR(255), ALTER COLUMN earnable_type DROP NOT NULL');
            DB::statement('ALTER TABLE xp_transactions ALTER COLUMN earnable_id TYPE BIGINT, ALTER COLUMN earnable_id DROP NOT NULL');
        } else {
            // Usar Schema Builder para otras bases de datos (SQLite, etc.)
            Schema::table('xp_transactions', function (Blueprint $table) {
                $table->string('earnable_type')->nullable()->change();
                $table->unsignedBigInteger('earnable_id')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // Sintaxis MySQL/MariaDB
            DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_type` VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE `xp_transactions` MODIFY `earnable_id` BIGINT UNSIGNED NOT NULL');
        } elseif ($driver === 'pgsql') {
            // Sintaxis PostgreSQL
            DB::statement('ALTER TABLE xp_transactions ALTER COLUMN earnable_type TYPE VARCHAR(255), ALTER COLUMN earnable_type SET NOT NULL');
            DB::statement('ALTER TABLE xp_transactions ALTER COLUMN earnable_id TYPE BIGINT, ALTER COLUMN earnable_id SET NOT NULL');
        } else {
            // Usar Schema Builder para otras bases de datos
            Schema::table('xp_transactions', function (Blueprint $table) {
                $table->string('earnable_type')->nullable(false)->change();
                $table->unsignedBigInteger('earnable_id')->nullable(false)->change();
            });
        }
    }
};

