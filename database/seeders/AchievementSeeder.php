<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            // NUTRICIÓN - Primeros pasos
            ['key' => 'first_meal', 'name' => 'Primera Comida', 'description' => 'Registra tu primera comida', 'icon' => '🍽️', 'category' => 'nutrition', 'xp_reward' => 10, 'difficulty' => 1, 'criteria' => ['type' => 'meals_count', 'count' => 1]],
            ['key' => 'meal_streak_7', 'name' => 'Semana Constante', 'description' => 'Registra comidas 7 días seguidos', 'icon' => '📅', 'category' => 'nutrition', 'xp_reward' => 50, 'difficulty' => 2, 'criteria' => ['type' => 'streak_days', 'streak_type' => 'meal_logging', 'days' => 7]],
            ['key' => 'meal_100', 'name' => 'Centenario', 'description' => 'Registra 100 comidas', 'icon' => '💯', 'category' => 'nutrition', 'xp_reward' => 100, 'difficulty' => 3, 'criteria' => ['type' => 'meals_count', 'count' => 100]],

            // EJERCICIO - Primeros pasos
            ['key' => 'first_exercise', 'name' => 'Primer Entrenamiento', 'description' => 'Completa tu primer ejercicio', 'icon' => '💪', 'category' => 'exercise', 'xp_reward' => 15, 'difficulty' => 1, 'criteria' => ['type' => 'exercises_count', 'count' => 1]],
            ['key' => 'exercise_streak_7', 'name' => 'Atleta Disciplinado', 'description' => 'Entrena 7 días seguidos', 'icon' => '🏆', 'category' => 'exercise', 'xp_reward' => 75, 'difficulty' => 2, 'criteria' => ['type' => 'streak_days', 'streak_type' => 'exercise', 'days' => 7]],
            ['key' => 'exercise_50', 'name' => 'Guerrero del Gimnasio', 'description' => 'Completa 50 entrenamientos', 'icon' => '⚔️', 'category' => 'exercise', 'xp_reward' => 150, 'difficulty' => 3, 'criteria' => ['type' => 'exercises_count', 'count' => 50]],

            // HIDRATACIÓN
            ['key' => 'water_goal_first', 'name' => 'Hidratación Saludable', 'description' => 'Cumple tu meta de agua por primera vez', 'icon' => '💧', 'category' => 'hydration', 'xp_reward' => 10, 'difficulty' => 1, 'criteria' => ['type' => 'water_logged', 'amount' => 2000]],
            ['key' => 'water_streak_7', 'name' => 'Océano Personal', 'description' => 'Cumple tu meta de agua 7 días seguidos', 'icon' => '🌊', 'category' => 'hydration', 'xp_reward' => 50, 'difficulty' => 2, 'criteria' => ['type' => 'streak_days', 'streak_type' => 'hydration', 'days' => 7]],

            // NIVELES
            ['key' => 'level_5', 'name' => 'Aprendiz', 'description' => 'Alcanza el nivel 5', 'icon' => '🌟', 'category' => 'level', 'xp_reward' => 25, 'difficulty' => 1, 'criteria' => ['type' => 'level_reached', 'level' => 5]],
            ['key' => 'level_10', 'name' => 'Experto', 'description' => 'Alcanza el nivel 10', 'icon' => '⭐', 'category' => 'level', 'xp_reward' => 50, 'difficulty' => 2, 'criteria' => ['type' => 'level_reached', 'level' => 10]],
            ['key' => 'level_25', 'name' => 'Maestro', 'description' => 'Alcanza el nivel 25', 'icon' => '🌠', 'category' => 'level', 'xp_reward' => 100, 'difficulty' => 3, 'criteria' => ['type' => 'level_reached', 'level' => 25]],
            ['key' => 'level_50', 'name' => 'Leyenda', 'description' => 'Alcanza el nivel 50', 'icon' => '👑', 'category' => 'level', 'xp_reward' => 250, 'difficulty' => 4, 'criteria' => ['type' => 'level_reached', 'level' => 50]],

            // RACHAS ÉPICAS
            ['key' => 'meal_streak_30', 'name' => 'Compromiso Total', 'description' => 'Registra comidas 30 días seguidos', 'icon' => '🔥', 'category' => 'streak', 'xp_reward' => 200, 'difficulty' => 4, 'criteria' => ['type' => 'streak_days', 'streak_type' => 'meal_logging', 'days' => 30]],
            ['key' => 'exercise_streak_30', 'name' => 'Imparable', 'description' => 'Entrena 30 días seguidos', 'icon' => '🚀', 'category' => 'streak', 'xp_reward' => 300, 'difficulty' => 5, 'criteria' => ['type' => 'streak_days', 'streak_type' => 'exercise', 'days' => 30]],
        ];

        foreach ($achievements as $achievement) {
            \App\Models\Achievement::updateOrCreate(
                ['key' => $achievement['key']],
                $achievement
            );
        }
    }
}
