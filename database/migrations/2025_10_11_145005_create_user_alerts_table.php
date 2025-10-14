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
        Schema::create('user_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['rapid_weight_loss', 'medical_consultation', 'low_adherence', 'hydration_reminder', 'meal_reminder', 'safety_warning']);
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // datos específicos del alert
            $table->enum('severity', ['info', 'warning', 'danger', 'critical'])->default('info');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_dismissed')->default(false);
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'type', 'is_active']);
            $table->index(['user_id', 'severity', 'is_dismissed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_alerts');
    }
};