<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->string('suggested_for_meal')->nullable()->after('rating');
            $table->date('suggested_date')->nullable()->after('suggested_for_meal');
            $table->index(['user_id', 'suggested_for_meal', 'suggested_date'], 'recipes_ai_suggestion_index');
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropIndex('recipes_ai_suggestion_index');
            $table->dropColumn(['suggested_for_meal', 'suggested_date']);
        });
    }
};
