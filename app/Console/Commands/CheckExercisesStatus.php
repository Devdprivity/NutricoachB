<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CheckExercisesStatus extends Command
{
    protected $signature = 'exercises:check-status';
    protected $description = 'Verificar el estado de los ejercicios descargados localmente';

    public function handle()
    {
        $this->info('🔍 Verificando estado de ejercicios...');
        $this->newLine();

        $exercisesPath = 'exercises';
        $metadataPath = 'exercises/metadata.json';

        // Verificar si existe el directorio
        if (!Storage::disk('public')->exists($exercisesPath)) {
            $this->error('❌ El directorio exercises/ no existe');
            $this->warn('   Ejecuta: php artisan exercises:download-gifs');
            return 1;
        }

        // Verificar metadata.json
        if (!Storage::disk('public')->exists($metadataPath)) {
            $this->error('❌ No se encontró metadata.json');
            $this->warn('   Ejecuta: php artisan exercises:download-gifs');
            return 1;
        }

        // Contar archivos GIF
        $gifFiles = Storage::disk('public')->files($exercisesPath);
        $gifCount = count(array_filter($gifFiles, function($file) {
            return pathinfo($file, PATHINFO_EXTENSION) === 'gif';
        }));

        // Leer metadata
        try {
            $metadata = json_decode(Storage::disk('public')->get($metadataPath), true);
            $metadataCount = is_array($metadata) ? count($metadata) : 0;
        } catch (\Exception $e) {
            $this->error('❌ Error al leer metadata.json: ' . $e->getMessage());
            return 1;
        }

        // Mostrar resultados
        $this->info('✅ Estado de ejercicios:');
        $this->line("   📄 Metadata: {$metadataCount} ejercicios");
        $this->line("   🎬 GIFs: {$gifCount} archivos");

        if ($gifCount === 0) {
            $this->warn('   ⚠️  No se encontraron archivos GIF');
            $this->warn('   Ejecuta: php artisan exercises:download-gifs');
            return 1;
        }

        if ($metadataCount === 0) {
            $this->warn('   ⚠️  El metadata.json está vacío');
            $this->warn('   Ejecuta: php artisan exercises:download-gifs');
            return 1;
        }

        $this->newLine();
        $this->info('✅ Todo está correcto. Los ejercicios están disponibles.');
        
        return 0;
    }
}

