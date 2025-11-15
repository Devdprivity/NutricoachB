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
        Schema::table('music_activity', function (Blueprint $table) {
            // Provider: 'spotify', 'youtube_music', 'apple_music'
            $table->string('music_provider')->default('spotify')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('music_activity', function (Blueprint $table) {
            $table->dropColumn('music_provider');
        });
    }
};
