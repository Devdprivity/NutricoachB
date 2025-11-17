<?php

namespace App\Services;

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
     * Obtener ejercicios por parte del cuerpo (SOLO desde archivos locales, SIN API)
     */
    public function getExercisesByBodyPart(string $bodyPart, int $limit = 10, int $offset = 0): array
    {
        // Solo usar archivos locales, NO llamar a la API
        $allExercises = $this->getAllExercises(1000, 0); // Obtener todos los disponibles
        
        // Filtrar por parte del cuerpo
        $filtered = array_filter($allExercises, function($exercise) use ($bodyPart) {
            return isset($exercise['body_part']) && 
                   strtolower($exercise['body_part']) === strtolower($bodyPart);
        });
        
        // Aplicar limit y offset
        return array_slice(array_values($filtered), $offset, $limit);
    }

    /**
     * Obtener todos los ejercicios disponibles (SOLO desde archivos locales, SIN API)
     */
    public function getAllExercises(int $limit = 50, int $offset = 0): array
    {
        // Solo usar archivos locales, NO llamar a la API
        if (!\Storage::disk('public')->exists('exercises/metadata.json')) {
            Log::warning('No se encontró metadata.json local. Ejecuta: php artisan exercises:download-gifs');
            return [];
        }

        try {
            $metadata = json_decode(\Storage::disk('public')->get('exercises/metadata.json'), true);
            
            if (empty($metadata)) {
                Log::warning('metadata.json está vacío. Ejecuta: php artisan exercises:download-gifs');
                return [];
            }

            // Aplicar limit y offset
            $exercises = array_slice($metadata, $offset, $limit);
            
            // Transformar y asegurarse de que las URLs apunten a archivos locales
            return array_map(function($exercise) {
                $transformed = $this->transformExercise($exercise);
                // Asegurar que las URLs sean locales
                $transformed['gif_url'] = $this->buildGifUrl($exercise['id']);
                $transformed['image_url'] = $this->buildGifUrl($exercise['id'], 180);
                return $transformed;
            }, $exercises);
        } catch (\Exception $e) {
            Log::error('Error al cargar ejercicios locales: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener GIF de un ejercicio específico (SOLO desde archivos locales, SIN API)
     */
    public function getExerciseGif(string $exerciseId, int $resolution = 360): ?string
    {
        // Solo usar archivos locales, NO llamar a la API
        $gifUrl = $this->buildGifUrl($exerciseId, $resolution);
        return !empty($gifUrl) ? $gifUrl : null;
    }

    /**
     * Obtener ejercicio por ID (SOLO desde archivos locales, SIN API)
     */
    public function getExerciseById(string $exerciseId): ?array
    {
        // Solo usar archivos locales, NO llamar a la API
        if (!\Storage::disk('public')->exists('exercises/metadata.json')) {
            return null;
        }

        try {
            $metadata = json_decode(\Storage::disk('public')->get('exercises/metadata.json'), true);
            
            if (empty($metadata)) {
                return null;
            }

            // Buscar el ejercicio por ID
            foreach ($metadata as $exercise) {
                if (isset($exercise['id']) && (string)$exercise['id'] === (string)$exerciseId) {
                    $transformed = $this->transformExercise($exercise);
                    $transformed['gif_url'] = $this->buildGifUrl($exercise['id']);
                    $transformed['image_url'] = $this->buildGifUrl($exercise['id'], 180);
                    return $transformed;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error al buscar ejercicio por ID: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Buscar ejercicios por nombre (SOLO desde archivos locales, SIN API)
     */
    public function searchExercises(string $name): array
    {
        // Solo usar archivos locales, NO llamar a la API
        $allExercises = $this->getAllExercises(1000, 0); // Obtener todos los disponibles
        
        // Filtrar por nombre (búsqueda parcial, case-insensitive)
        $searchTerm = strtolower(trim($name));
        $filtered = array_filter($allExercises, function($exercise) use ($searchTerm) {
            $exerciseName = strtolower($exercise['name'] ?? '');
            $exerciseDescription = strtolower($exercise['description'] ?? '');
            return strpos($exerciseName, $searchTerm) !== false || 
                   strpos($exerciseDescription, $searchTerm) !== false;
        });
        
        return array_values($filtered);
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
        try {
            // Buscar archivo que empiece con el ID del ejercicio
            $files = \Storage::disk('public')->files('exercises');
            
            foreach ($files as $file) {
                $filename = basename($file);
                // Buscar archivos que empiecen con el ID (formato: 0001_nombre.gif o 0001.gif)
                if (strpos($filename, $exerciseId . '_') === 0 || $filename === $exerciseId . '.gif') {
                    return asset("storage/{$file}");
                }
            }
        } catch (\Exception $e) {
            Log::warning("Error al buscar GIF para ejercicio {$exerciseId}: " . $e->getMessage());
        }
        
        // Si no existe localmente, retornar null (el frontend manejará el placeholder)
        return '';
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
     * Obtener lista de partes del cuerpo disponibles (SOLO desde archivos locales, SIN API)
     */
    public function getBodyPartsList(): array
    {
        // Solo usar archivos locales, NO llamar a la API
        $allExercises = $this->getAllExercises(1000, 0);
        
        // Extraer todas las partes del cuerpo únicas
        $bodyParts = [];
        foreach ($allExercises as $exercise) {
            if (isset($exercise['body_part']) && !empty($exercise['body_part'])) {
                $bodyParts[] = $exercise['body_part'];
            }
        }
        
        // Retornar lista única y ordenada
        $uniqueBodyParts = array_unique($bodyParts);
        sort($uniqueBodyParts);
        
        // Si no hay datos locales, retornar lista por defecto
        return !empty($uniqueBodyParts) 
            ? array_values($uniqueBodyParts)
            : ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
    }
}

