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
            $table->string('spotify_id')->nullable()->after('google_id');
            $table->text('spotify_access_token')->nullable()->after('spotify_id');
            $table->text('spotify_refresh_token')->nullable()->after('spotify_access_token');
            $table->timestamp('spotify_token_expires_at')->nullable()->after('spotify_refresh_token');
            $table->boolean('spotify_share_listening')->default(true)->after('spotify_token_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'spotify_id',
                'spotify_access_token',
                'spotify_refresh_token',
                'spotify_token_expires_at',
                'spotify_share_listening',
            ]);
        });
    }
};
