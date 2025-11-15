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
        Schema::table('users', function (Blueprint $table) {
            // YouTube Music fields
            $table->string('youtube_music_id')->nullable()->after('spotify_share_listening');
            $table->text('youtube_music_access_token')->nullable();
            $table->text('youtube_music_refresh_token')->nullable();
            $table->timestamp('youtube_music_token_expires_at')->nullable();

            // Apple Music fields
            $table->string('apple_music_id')->nullable();
            $table->text('apple_music_user_token')->nullable();
            $table->text('apple_music_developer_token')->nullable();
            $table->timestamp('apple_music_token_expires_at')->nullable();

            // Preferred music service: 'spotify', 'youtube_music', 'apple_music'
            $table->string('preferred_music_service')->nullable()->default('spotify');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'youtube_music_id',
                'youtube_music_access_token',
                'youtube_music_refresh_token',
                'youtube_music_token_expires_at',
                'apple_music_id',
                'apple_music_user_token',
                'apple_music_developer_token',
                'apple_music_token_expires_at',
                'preferred_music_service',
            ]);
        });
    }
};
