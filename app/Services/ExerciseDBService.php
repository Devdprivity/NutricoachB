<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ExerciseDBService
{
    private string $apiKey;
    private string $apiHost = 'exercisedb.p.rapidapi.com';
    private string $baseUrl = 'https://exercisedb.p.rapidapi.com';

    public function __construct()
    {
        $this->apiKey = config('services.exercisedb.key', '');
    }

    /**
     * Obtener ejercicios por parte del cuerpo con GIFs
     */
    public function getExercisesByBodyPart(string $bodyPart, int $limit = 10, int $offset = 0): array
    {
        $cacheKey = "exercisedb_bodypart_{$bodyPart}_{$limit}_{$offset}";
        
        return Cache::remember($cacheKey, now()->addHours(24), function () use ($bodyPart, $limit, $offset) {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $this->apiKey,
                    'X-RapidAPI-Host' => $this->apiHost,
                ])->get("{$this->baseUrl}/exercises/bodyPart/{$bodyPart}", [
                    'limit' => $limit,
                    'offset' => $offset,
                ]);

                if ($response->successful()) {
                    return $this->transformExercises($response->json());
                }

                Log::error('ExerciseDB API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            } catch (\Exception $e) {
                Log::error('ExerciseDB Service Error: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Obtener todos los ejercicios disponibles
     */
    public function getAllExercises(int $limit = 50, int $offset = 0): array
    {
        // Primero intentar cargar desde archivo local
        if (\Storage::disk('public')->exists('exercises/metadata.json')) {
            try {
                $metadata = json_decode(\Storage::disk('public')->get('exercises/metadata.json'), true);
                
                if (!empty($metadata)) {
                    // Aplicar limit y offset
                    $exercises = array_slice($metadata, $offset, $limit);
                    
                    // Asegurarse de que las URLs apunten a archivos locales
                    return array_map(function($exercise) {
                        $exercise['gif_url'] = $this->buildGifUrl($exercise['id']);
                        $exercise['image_url'] = $this->buildGifUrl($exercise['id'], 180);
                        return $exercise;
                    }, $exercises);
                }
            } catch (\Exception $e) {
                Log::warning('Could not load local exercises metadata: ' . $e->getMessage());
            }
        }
        
        // Si no hay metadata local, consultar API
        $cacheKey = "exercisedb_all_{$limit}_{$offset}";
        
        return Cache::remember($cacheKey, now()->addHours(24), function () use ($limit, $offset) {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $this->apiKey,
                    'X-RapidAPI-Host' => $this->apiHost,
                ])->get("{$this->baseUrl}/exercises", [
                    'limit' => $limit,
                    'offset' => $offset,
                ]);

                if ($response->successful()) {
                    return $this->transformExercises($response->json());
                }

                return [];
            } catch (\Exception $e) {
                Log::error('ExerciseDB Service Error: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Obtener GIF de un ejercicio específico
     */
    public function getExerciseGif(string $exerciseId, int $resolution = 360): ?string
    {
        $cacheKey = "exercisedb_gif_{$exerciseId}_{$resolution}";
        
        return Cache::remember($cacheKey, now()->addDays(7), function () use ($exerciseId, $resolution) {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $this->apiKey,
                    'X-RapidAPI-Host' => $this->apiHost,
                ])->get("{$this->baseUrl}/image", [
                    'exerciseId' => $exerciseId,
                    'resolution' => $resolution,
                ]);

                if ($response->successful() && $response->header('Content-Type') === 'image/gif') {
                    // Retornar la URL construida para el frontend
                    return "{$this->baseUrl}/image?exerciseId={$exerciseId}&resolution={$resolution}";
                }

                return null;
            } catch (\Exception $e) {
                Log::error('ExerciseDB GIF Error: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Obtener ejercicio por ID
     */
    public function getExerciseById(string $exerciseId): ?array
    {
        $cacheKey = "exercisedb_exercise_{$exerciseId}";
        
        return Cache::remember($cacheKey, now()->addHours(24), function () use ($exerciseId) {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $this->apiKey,
                    'X-RapidAPI-Host' => $this->apiHost,
                ])->get("{$this->baseUrl}/exercises/exercise/{$exerciseId}");

                if ($response->successful()) {
                    $data = $response->json();
                    return $this->transformExercise($data);
                }

                return null;
            } catch (\Exception $e) {
                Log::error('ExerciseDB Service Error: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Buscar ejercicios por nombre
     */
    public function searchExercises(string $name): array
    {
        $cacheKey = "exercisedb_search_" . md5($name);
        
        return Cache::remember($cacheKey, now()->addHours(6), function () use ($name) {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $this->apiKey,
                    'X-RapidAPI-Host' => $this->apiHost,
                ])->get("{$this->baseUrl}/exercises/name/{$name}");

                if ($response->successful()) {
                    return $this->transformExercises($response->json());
                }

                return [];
            } catch (\Exception $e) {
                Log::error('ExerciseDB Service Error: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Transformar array de ejercicios al formato de la aplicación
     */
    private function transformExercises(array $exercises): array
    {
        return array_map(fn($exercise) => $this->transformExercise($exercise), $exercises);
    }

    /**
     * Transformar un ejercicio al formato de la aplicación
     */
    private function transformExercise(array $exercise): array
    {
        return [
            'id' => $exercise['id'],
            'name' => $exercise['name'] ?? 'Unknown',
            'description' => $exercise['description'] ?? ($exercise['instructions'][0] ?? 'No description available'),
            'category' => $this->mapCategory($exercise['bodyPart'] ?? 'general'),
            'difficulty' => $exercise['difficulty'] ?? 'beginner',
            'calories_per_minute' => $this->estimateCaloriesPerMinute($exercise),
            'gif_url' => $this->buildGifUrl($exercise['id']),
            'image_url' => $this->buildGifUrl($exercise['id'], 180), // Thumbnail más pequeño
            'muscles_worked' => $this->formatMuscles($exercise),
            'instructions' => $this->formatInstructions($exercise['instructions'] ?? []),
            'equipment' => $exercise['equipment'] ?? 'body weight',
            'duration_minutes' => 30, // Duración por defecto
            'body_part' => $exercise['bodyPart'] ?? 'general',
            'target' => $exercise['target'] ?? null,
            'secondary_muscles' => $exercise['secondaryMuscles'] ?? [],
        ];
    }

    /**
     * Construir URL del GIF (usa archivos locales si existen)
     */
    private function buildGifUrl(string $exerciseId, int $resolution = 360): string
    {
        // Buscar archivo que empiece con el ID del ejercicio
        $files = \Storage::disk('public')->files('exercises');
        
        foreach ($files as $file) {
            $filename = basename($file);
            // Buscar archivos que empiecen con el ID (formato: 0001_nombre.gif)
            if (strpos($filename, $exerciseId . '_') === 0 || $filename === $exerciseId . '.gif') {
                return asset("storage/{$file}");
            }
        }
        
        // Si no existe localmente, retornar placeholder o null
        return asset('img/exercise-placeholder.gif');
    }

    /**
     * Mapear bodyPart a categoría de la app
     */
    private function mapCategory(string $bodyPart): string
    {
        $categoryMap = [
            'cardio' => 'cardio',
            'chest' => 'strength',
            'back' => 'strength',
            'shoulders' => 'strength',
            'upper arms' => 'strength',
            'lower arms' => 'strength',
            'upper legs' => 'strength',
            'lower legs' => 'strength',
            'waist' => 'strength',
            'neck' => 'flexibility',
        ];

        return $categoryMap[strtolower($bodyPart)] ?? 'strength';
    }

    /**
     * Formatear músculos trabajados
     */
    private function formatMuscles(array $exercise): string
    {
        $muscles = [];
        
        if (isset($exercise['target'])) {
            $muscles[] = ucfirst($exercise['target']);
        }
        
        if (isset($exercise['secondaryMuscles']) && is_array($exercise['secondaryMuscles'])) {
            foreach ($exercise['secondaryMuscles'] as $muscle) {
                $muscles[] = ucfirst($muscle);
            }
        }
        
        return implode(', ', array_unique($muscles)) ?: 'General';
    }

    /**
     * Formatear instrucciones
     */
    private function formatInstructions(array $instructions): string
    {
        if (empty($instructions)) {
            return 'No instructions available';
        }
        
        return implode("\n\n", array_map(fn($inst, $index) => ($index + 1) . ". " . $inst, $instructions, array_keys($instructions)));
    }

    /**
     * Estimar calorías por minuto
     */
    private function estimateCaloriesPerMinute(array $exercise): int
    {
        $bodyPart = strtolower($exercise['bodyPart'] ?? 'general');
        $difficulty = strtolower($exercise['difficulty'] ?? 'beginner');
        
        $baseCalories = match($bodyPart) {
            'cardio' => 12,
            'waist' => 8,
            'chest', 'back', 'upper legs' => 10,
            'shoulders', 'lower legs' => 9,
            'upper arms', 'lower arms' => 7,
            default => 8,
        };

        $difficultyMultiplier = match($difficulty) {
            'advanced', 'expert' => 1.5,
            'intermediate' => 1.2,
            'beginner' => 1.0,
            default => 1.0,
        };

        return (int) ($baseCalories * $difficultyMultiplier);
    }

    /**
     * Obtener lista de partes del cuerpo disponibles
     */
    public function getBodyPartsList(): array
    {
        $cacheKey = "exercisedb_bodyparts_list";
        
        return Cache::remember($cacheKey, now()->addDays(7), function () {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $this->apiKey,
                    'X-RapidAPI-Host' => $this->apiHost,
                ])->get("{$this->baseUrl}/exercises/bodyPartList");

                if ($response->successful()) {
                    return $response->json();
                }

                return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
            } catch (\Exception $e) {
                Log::error('ExerciseDB Service Error: ' . $e->getMessage());
                return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
            }
        });
    }
}

