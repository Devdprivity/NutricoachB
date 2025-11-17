<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Services\ExerciseDBService;

class DownloadExerciseGifs extends Command
{
    protected $signature = 'exercises:download-gifs {--total=500 : Total number of exercises to download}';
    protected $description = 'Download exercise GIFs from ExerciseDB and store them locally';

    public function handle()
    {
        $this->info('🏋️ Descargando ejercicios y GIFs desde ExerciseDB...');
        
        $totalToDownload = (int) $this->option('total');
        $apiKey = config('services.exercisedb.key');
        
        if (!$apiKey) {
            $this->error('❌ No se encontró la API key de ExerciseDB en el .env');
            return 1;
        }
        
        // Crear directorio si no existe
        if (!Storage::disk('public')->exists('exercises')) {
            Storage::disk('public')->makeDirectory('exercises');
        }

        $allExercises = [];
        $offset = 0;
        $limit = 50; // Límite por petición
        
        // Obtener ejercicios en lotes
        $this->info("📥 Obteniendo hasta {$totalToDownload} ejercicios en lotes de {$limit}...");
        
        while (count($allExercises) < $totalToDownload) {
            try {
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $apiKey,
                    'X-RapidAPI-Host' => 'exercisedb.p.rapidapi.com',
                ])->timeout(30)->get('https://exercisedb.p.rapidapi.com/exercises', [
                    'limit' => $limit,
                    'offset' => $offset,
                ]);

                if (!$response->successful()) {
                    $this->warn("⚠️  Error al obtener lote en offset {$offset}");
                    break;
                }

                $exercises = $response->json();
                
                if (empty($exercises)) {
                    $this->info("✅ No hay más ejercicios disponibles");
                    break;
                }

                $allExercises = array_merge($allExercises, $exercises);
                $this->info("   📦 Obtenidos " . count($allExercises) . " ejercicios hasta ahora...");
                
                $offset += $limit;
                usleep(200000); // 0.2 segundos entre peticiones
                
            } catch (\Exception $e) {
                $this->error("❌ Error al obtener ejercicios: " . $e->getMessage());
                break;
            }
        }
        
        if (empty($allExercises)) {
            $this->error('❌ No se pudieron obtener ejercicios de la API');
            return 1;
        }

        // Limitar al total solicitado
        $allExercises = array_slice($allExercises, 0, $totalToDownload);
        $this->info("✅ Total de ejercicios a descargar: " . count($allExercises));
        
        $bar = $this->output->createProgressBar(count($allExercises));
        $bar->start();

        $downloaded = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($allExercises as $exercise) {
            $exerciseId = $exercise['id'];
            $exerciseName = $this->sanitizeFilename($exercise['name']);
            $filename = "exercises/{$exerciseId}_{$exerciseName}.gif";

            // Si ya existe, saltar
            if (Storage::disk('public')->exists($filename)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            try {
                // Descargar GIF en resolución 360
                $response = Http::withHeaders([
                    'X-RapidAPI-Key' => $apiKey,
                    'X-RapidAPI-Host' => 'exercisedb.p.rapidapi.com',
                ])->timeout(30)->get('https://exercisedb.p.rapidapi.com/image', [
                    'exerciseId' => $exerciseId,
                    'resolution' => 360,
                ]);

                if ($response->successful() && $response->header('Content-Type') === 'image/gif') {
                    Storage::disk('public')->put($filename, $response->body());
                    $downloaded++;
                } else {
                    $failed++;
                }

                // Esperar un poco para no saturar la API
                usleep(150000); // 0.15 segundos

            } catch (\Exception $e) {
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Guardar metadata de ejercicios
        $this->info('💾 Guardando metadata de ejercicios...');
        Storage::disk('public')->put('exercises/metadata.json', json_encode($allExercises, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Resumen
        $this->info('');
        $this->info('📊 Resumen:');
        $this->info("   ✅ Descargados: {$downloaded}");
        $this->info("   ⏭️  Omitidos (ya existían): {$skipped}");
        $this->info("   ❌ Fallidos: {$failed}");
        $this->info('');
        $this->info('🎉 ¡Proceso completado!');
        $this->info("📁 GIFs guardados en: storage/app/public/exercises/");

        return 0;
    }

    /**
     * Sanitizar nombre de archivo
     */
    private function sanitizeFilename(string $name): string
    {
        // Reemplazar espacios y caracteres especiales
        $name = strtolower($name);
        $name = preg_replace('/[^a-z0-9]+/', '_', $name);
        $name = trim($name, '_');
        
        // Limitar longitud
        return substr($name, 0, 50);
    }
}

