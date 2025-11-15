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
        // Verificar si la tabla existe y tiene la estructura antigua
        if (Schema::hasTable('exercises')) {
            Schema::table('exercises', function (Blueprint $table) {
                // Eliminar columnas antiguas si existen
                if (Schema::hasColumn('exercises', 'type')) {
                    $table->dropColumn('type');
                }
                if (Schema::hasColumn('exercises', 'muscle')) {
                    $table->dropColumn('muscle');
                }
                
                // Agregar nuevas columnas si no existen
                if (!Schema::hasColumn('exercises', 'description')) {
                    $table->text('description')->after('name');
                }
                if (!Schema::hasColumn('exercises', 'category')) {
                    $table->enum('category', ['cardio', 'strength', 'flexibility', 'balance', 'sports'])
                        ->default('cardio')
                        ->after('description');
                }
                if (!Schema::hasColumn('exercises', 'video_url')) {
                    $table->string('video_url')->nullable()->after('image_url');
                }
                if (!Schema::hasColumn('exercises', 'muscles_worked')) {
                    $table->text('muscles_worked')->nullable()->after('video_url');
                }
                if (!Schema::hasColumn('exercises', 'duration_minutes')) {
                    $table->integer('duration_minutes')->default(30)->after('equipment');
                }
                
                // Agregar índices si no existen
                if (!Schema::hasColumn('exercises', 'category') || 
                    !collect(\DB::select("SHOW INDEX FROM exercises WHERE Key_name = 'exercises_category_index'"))->count()) {
                    $table->index('category');
                }
                if (!Schema::hasColumn('exercises', 'difficulty') || 
                    !collect(\DB::select("SHOW INDEX FROM exercises WHERE Key_name = 'exercises_difficulty_index'"))->count()) {
                    $table->index('difficulty');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('exercises')) {
            Schema::table('exercises', function (Blueprint $table) {
                // Revertir cambios
                if (Schema::hasColumn('exercises', 'description')) {
                    $table->dropColumn('description');
                }
                if (Schema::hasColumn('exercises', 'category')) {
                    $table->dropColumn('category');
                }
                if (Schema::hasColumn('exercises', 'video_url')) {
                    $table->dropColumn('video_url');
                }
                if (Schema::hasColumn('exercises', 'muscles_worked')) {
                    $table->dropColumn('muscles_worked');
                }
                if (Schema::hasColumn('exercises', 'duration_minutes')) {
                    $table->dropColumn('duration_minutes');
                }
                
                // Restaurar columnas antiguas
                $table->string('type')->after('name');
                $table->string('muscle')->after('type');
            });
        }
    }
};
