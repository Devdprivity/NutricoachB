<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserStats;
use App\Models\UserStreak;
use App\Models\XpTransaction;
use Carbon\Carbon;

class GamificationService
{
    /**
     * Obtener o crear stats del usuario
     */
    public function getOrCreateUserStats(User $user): UserStats
    {
        return UserStats::firstOrCreate(
            ['user_id' => $user->id],
            [
                'total_xp' => 0,
                'level' => 1,
                'xp_to_next_level' => 100,
                'first_activity_date' => now(),
            ]
        );
    }

    /**
     * Otorgar XP al usuario
     */
    public function awardXp(User $user, int $amount, string $source, string $description, $earnable = null): void
    {
        $stats = $this->getOrCreateUserStats($user);

        // Crear transacción
        XpTransaction::create([
            'user_id' => $user->id,
            'xp_amount' => $amount,
            'source' => $source,
            'description' => $description,
            'earnable_type' => $earnable ? get_class($earnable) : null,
            'earnable_id' => $earnable?->id,
        ]);

        // Actualizar stats
        $stats->total_xp += $amount;

        // Verificar si sube de nivel
        while ($stats->total_xp >= $stats->xp_to_next_level) {
            $stats->level++;
            $stats->xp_to_next_level = $this->calculateXpForNextLevel($stats->level);
        }

        $stats->save();
    }

    /**
     * Calcular XP necesario para el próximo nivel
     */
    private function calculateXpForNextLevel(int $level): int
    {
        // Fórmula: 100 * level * 1.5 (crece exponencialmente)
        return (int) (100 * $level * 1.5);
    }

    /**
     * Actualizar racha (streak)
     */
    public function updateStreak(User $user, string $type): void
    {
        $today = Carbon::today();

        $streak = UserStreak::firstOrCreate(
            ['user_id' => $user->id, 'type' => $type],
            [
                'current_count' => 0,
                'longest_count' => 0,
                'is_active' => true,
            ]
        );

        // Si es el mismo día, no incrementar
        if ($streak->last_activity_date && $streak->last_activity_date->isToday()) {
            return;
        }

        // Si es día consecutivo
        if ($streak->last_activity_date && $streak->last_activity_date->isYesterday()) {
            $streak->current_count++;

            // Actualizar récord si es necesario
            if ($streak->current_count > $streak->longest_count) {
                $streak->longest_count = $streak->current_count;
            }

            // Otorgar XP por racha
            if ($streak->current_count % 7 == 0) {
                $this->awardXp($user, 50, 'streak_bonus', "¡Racha de {$streak->current_count} días en {$type}!");
            }
        } else {
            // Racha rota, reiniciar
            $streak->current_count = 1;
            $streak->streak_start_date = $today;
        }

        $streak->last_activity_date = $today;
        $streak->save();
    }

    /**
     * Verificar y otorgar achievements
     */
    public function checkAndAwardAchievements(User $user): array
    {
        $stats = $this->getOrCreateUserStats($user);
        $newAchievements = [];

        // Obtener todos los achievements activos
        $achievements = Achievement::where('is_active', true)->get();

        foreach ($achievements as $achievement) {
            // Verificar si ya lo tiene
            if (UserAchievement::where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists()) {
                continue;
            }

            // Verificar si cumple los criterios
            if ($this->checkAchievementCriteria($user, $stats, $achievement)) {
                $this->unlockAchievement($user, $achievement);
                $newAchievements[] = $achievement;
            }
        }

        return $newAchievements;
    }

    /**
     * Verificar si se cumplen los criterios de un achievement
     */
    private function checkAchievementCriteria(User $user, UserStats $stats, Achievement $achievement): bool
    {
        $criteria = $achievement->criteria;

        if (!$criteria) {
            return false;
        }

        return match($criteria['type'] ?? null) {
            'meals_count' => $stats->total_meals_logged >= ($criteria['count'] ?? 0),
            'exercises_count' => $stats->total_exercises_logged >= ($criteria['count'] ?? 0),
            'level_reached' => $stats->level >= ($criteria['level'] ?? 0),
            'streak_days' => $this->checkStreakDays($user, $criteria['streak_type'] ?? 'daily_login', $criteria['days'] ?? 0),
            'water_logged' => $stats->total_water_logged >= ($criteria['amount'] ?? 0),
            default => false,
        };
    }

    /**
     * Verificar días de racha
     */
    private function checkStreakDays(User $user, string $type, int $days): bool
    {
        $streak = UserStreak::where('user_id', $user->id)
            ->where('type', $type)
            ->first();

        return $streak && $streak->current_count >= $days;
    }

    /**
     * Desbloquear achievement
     */
    private function unlockAchievement(User $user, Achievement $achievement): void
    {
        UserAchievement::create([
            'user_id' => $user->id,
            'achievement_id' => $achievement->id,
            'unlocked_at' => now(),
            'progress' => 100,
        ]);

        // Otorgar XP
        $this->awardXp($user, $achievement->xp_reward, 'achievement', "Desbloqueaste: {$achievement->name}", $achievement);

        // Incrementar contador
        $stats = $this->getOrCreateUserStats($user);
        $stats->increment('total_achievements');
    }

    /**
     * Registrar actividad de comida
     */
    public function logMealActivity(User $user): void
    {
        $stats = $this->getOrCreateUserStats($user);
        $stats->increment('total_meals_logged');
        $stats->last_activity_date = now();
        $stats->save();

        // Actualizar racha
        $this->updateStreak($user, 'meal_logging');

        // Otorgar XP base
        $this->awardXp($user, 5, 'meal_logged', 'Comida registrada');

        // Verificar achievements
        $this->checkAndAwardAchievements($user);
    }

    /**
     * Registrar actividad de ejercicio
     */
    public function logExerciseActivity(User $user): void
    {
        $stats = $this->getOrCreateUserStats($user);
        $stats->increment('total_exercises_logged');
        $stats->last_activity_date = now();
        $stats->save();

        // Actualizar racha
        $this->updateStreak($user, 'exercise');

        // Otorgar XP base
        $this->awardXp($user, 10, 'exercise_logged', 'Ejercicio completado');

        // Verificar achievements
        $this->checkAndAwardAchievements($user);
    }

    /**
     * Registrar actividad de hidratación
     */
    public function logHydrationActivity(User $user, int $amount_ml): void
    {
        $stats = $this->getOrCreateUserStats($user);
        $stats->total_water_logged += $amount_ml;
        $stats->last_activity_date = now();
        $stats->save();

        // Actualizar racha
        $this->updateStreak($user, 'hydration');

        // Otorgar XP base
        $this->awardXp($user, 2, 'hydration_logged', 'Hidratación registrada');

        // Verificar achievements
        $this->checkAndAwardAchievements($user);
    }

    /**
     * Obtener progreso del usuario
     */
    public function getUserProgress(User $user): array
    {
        $stats = $this->getOrCreateUserStats($user);

        // Calcular porcentaje de progreso en el nivel actual
        $prevLevelXp = $this->calculateXpForNextLevel($stats->level - 1);
        $currentLevelXp = $stats->xp_to_next_level;
        $xpInCurrentLevel = $stats->total_xp - $prevLevelXp;
        $xpNeededForLevel = $currentLevelXp - $prevLevelXp;
        $progressPercent = ($xpInCurrentLevel / $xpNeededForLevel) * 100;

        // Obtener rachas activas
        $streaks = UserStreak::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        // Obtener últimos achievements
        $recentAchievements = UserAchievement::where('user_id', $user->id)
            ->with('achievement')
            ->orderBy('unlocked_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'level' => $stats->level,
            'total_xp' => $stats->total_xp,
            'xp_to_next_level' => $stats->xp_to_next_level,
            'progress_percent' => round($progressPercent, 1),
            'total_achievements' => $stats->total_achievements,
            'streaks' => $streaks,
            'recent_achievements' => $recentAchievements,
            'stats' => [
                'meals' => $stats->total_meals_logged,
                'exercises' => $stats->total_exercises_logged,
                'water' => $stats->total_water_logged,
                'days_active' => $stats->days_active,
            ],
        ];
    }
}
