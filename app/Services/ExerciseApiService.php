<?php

namespace App\Services;

use App\Models\Exercise;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExerciseApiService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.api-ninjas.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.api_ninjas.key', '');
    }

    /**
     * Obtener ejercicios desde la API y cachearlos en la base de datos
     */
    public function fetchAndCacheExercises(array $params = [])
    {
        try {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->apiKey,
            ])->get("{$this->baseUrl}/exercises", $params);

            if ($response->successful()) {
                $exercises = $response->json();

                foreach ($exercises as $exerciseData) {
                    $this->cacheExercise($exerciseData);
                }

                return $exercises;
            }

            Log::error('API Ninjas Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exercise API Service Error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Cachear un ejercicio en la base de datos
     */
    private function cacheExercise(array $exerciseData)
    {
        return Exercise::updateOrCreate(
            ['name' => $exerciseData['name']],
            [
                'type' => $exerciseData['type'] ?? 'strength',
                'muscle' => $exerciseData['muscle'] ?? 'general',
                'equipment' => $exerciseData['equipment'] ?? null,
                'difficulty' => $exerciseData['difficulty'] ?? 'beginner',
                'instructions' => $exerciseData['instructions'] ?? '',
                'calories_per_minute' => $this->estimateCaloriesPerMinute($exerciseData),
            ]
        );
    }

    /**
     * Estimación de calorías por minuto basado en tipo de ejercicio
     */
    private function estimateCaloriesPerMinute(array $exerciseData): int
    {
        $type = $exerciseData['type'] ?? 'strength';
        $difficulty = $exerciseData['difficulty'] ?? 'beginner';

        $baseCalories = match($type) {
            'cardio' => 10,
            'olympic_weightlifting' => 8,
            'plyometrics' => 9,
            'powerlifting' => 7,
            'strength' => 6,
            'stretching' => 3,
            'strongman' => 8,
            default => 5,
        };

        $difficultyMultiplier = match($difficulty) {
            'expert' => 1.5,
            'intermediate' => 1.2,
            'beginner' => 1.0,
            default => 1.0,
        };

        return (int) ($baseCalories * $difficultyMultiplier);
    }

    /**
     * Sincronizar ejercicios para un grupo muscular específico
     */
    public function syncExercisesForMuscle(string $muscle)
    {
        return $this->fetchAndCacheExercises(['muscle' => $muscle]);
    }

    /**
     * Sincronizar ejercicios para todos los grupos musculares
     */
    public function syncAllExercises()
    {
        $muscleGroups = [
            'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
            'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
            'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
        ];

        $totalSynced = 0;

        foreach ($muscleGroups as $muscle) {
            $exercises = $this->syncExercisesForMuscle($muscle);
            $totalSynced += count($exercises);

            // Evitar rate limiting
            sleep(1);
        }

        return $totalSynced;
    }
}
