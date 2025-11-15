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
        if (!Schema::hasColumn('meal_records', 'image_public_id')) {
            Schema::table('meal_records', function (Blueprint $table) {
                $table->string('image_public_id')->nullable()->after('image_path');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meal_records', function (Blueprint $table) {
            if (Schema::hasColumn('meal_records', 'image_public_id')) {
                $table->dropColumn('image_public_id');
            }
        });
    }
};

