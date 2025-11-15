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
        // Tabla de logros/achievements disponibles
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // ej: 'first_meal', 'week_streak'
            $table->string('name'); // "Primera Comida"
            $table->text('description'); // "Registra tu primera comida"
            $table->string('icon')->nullable(); // Emoji o URL de icono
            $table->string('category'); // 'nutrition', 'exercise', 'hydration', 'social', 'streak'
            $table->integer('xp_reward')->default(0); // Puntos XP que otorga
            $table->integer('difficulty')->default(1); // 1-5 (común, raro, épico, legendario)
            $table->json('criteria')->nullable(); // Condiciones para desbloquear
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Logros desbloqueados por usuarios
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('achievement_id')->constrained()->onDelete('cascade');
            $table->timestamp('unlocked_at');
            $table->integer('progress')->default(100); // % de progreso (100 = completado)
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });

        // Rachas/Streaks de usuarios
        Schema::create('user_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'daily_login', 'meal_logging', 'exercise', 'hydration'
            $table->integer('current_count')->default(0);
            $table->integer('longest_count')->default(0);
            $table->date('last_activity_date')->nullable();
            $table->date('streak_start_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'type']);
        });

        // Estadísticas generales del usuario
        Schema::create('user_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->integer('total_xp')->default(0);
            $table->integer('level')->default(1);
            $table->integer('xp_to_next_level')->default(100);
            $table->integer('total_achievements')->default(0);
            $table->integer('total_meals_logged')->default(0);
            $table->integer('total_exercises_logged')->default(0);
            $table->integer('total_water_logged')->default(0);
            $table->integer('days_active')->default(0);
            $table->date('first_activity_date')->nullable();
            $table->date('last_activity_date')->nullable();
            $table->json('badges')->nullable(); // Badges especiales ganados
            $table->timestamps();
        });

        // Desafíos disponibles
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('type'); // 'personal', 'community', 'friends'
            $table->string('category'); // 'nutrition', 'exercise', 'hydration', 'weight_loss'
            $table->json('goal_criteria'); // {"type": "calories_burned", "target": 5000}
            $table->integer('xp_reward')->default(0);
            $table->string('difficulty'); // 'easy', 'medium', 'hard', 'extreme'
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_recurring')->default(false); // Si se repite semanalmente
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Participación de usuarios en desafíos
        Schema::create('user_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->json('progress')->nullable(); // Progreso actual
            $table->integer('current_value')->default(0);
            $table->integer('target_value')->default(0);
            $table->enum('status', ['active', 'completed', 'failed', 'abandoned'])->default('active');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('xp_earned')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'challenge_id']);
        });

        // Historial de XP ganado
        Schema::create('xp_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('xp_amount');
            $table->string('source'); // 'achievement', 'challenge', 'daily_bonus', 'streak_bonus'
            $table->string('description');
            $table->morphs('earnable'); // Relación polimórfica (achievement_id, challenge_id, etc.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('xp_transactions');
        Schema::dropIfExists('user_challenges');
        Schema::dropIfExists('challenges');
        Schema::dropIfExists('user_stats');
        Schema::dropIfExists('user_streaks');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
