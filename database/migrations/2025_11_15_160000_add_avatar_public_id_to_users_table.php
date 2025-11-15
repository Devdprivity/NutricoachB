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
        if (!Schema::hasColumn('users', 'avatar_public_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('avatar_public_id', 500)->nullable()->after('avatar');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'avatar_public_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('avatar_public_id');
            });
        }
    }
};

