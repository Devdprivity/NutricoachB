<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class DiagnoseExercises extends Command
{
    protected $signature = 'exercises:diagnose';
    protected $description = 'Diagnosticar problemas con los ejercicios y GIFs';

    public function handle()
    {
        $this->info('🔍 Diagnosticando ejercicios...');
        $this->newLine();

        // 1. Verificar metadata.json
        $this->info('1️⃣ Verificando metadata.json...');
        $metadataPath = storage_path('app/public/exercises/metadata.json');
        if (File::exists($metadataPath)) {
            $this->info("   ✅ metadata.json existe: {$metadataPath}");
            $metadata = json_decode(File::get($metadataPath), true);
            $count = is_array($metadata) ? count($metadata) : 0;
            $this->info("   📊 Ejercicios en metadata: {$count}");
        } else {
            $this->error("   ❌ metadata.json NO existe: {$metadataPath}");
        }
        $this->newLine();

        // 2. Verificar carpeta de ejercicios
        $this->info('2️⃣ Verificando carpeta de ejercicios...');
        $exercisesPath = storage_path('app/public/exercises');
        if (File::isDirectory($exercisesPath)) {
            $this->info("   ✅ Carpeta existe: {$exercisesPath}");
            $gifFiles = File::glob($exercisesPath . '/*.gif');
            $this->info("   📊 Archivos GIF encontrados: " . count($gifFiles));
            if (count($gifFiles) > 0) {
                $this->line("   📝 Primeros 5 archivos:");
                foreach (array_slice($gifFiles, 0, 5) as $file) {
                    $this->line("      - " . basename($file));
                }
            }
        } else {
            $this->error("   ❌ Carpeta NO existe: {$exercisesPath}");
        }
        $this->newLine();

        // 3. Verificar symlink
        $this->info('3️⃣ Verificando symlink...');
        $linkPath = public_path('storage');
        $targetPath = storage_path('app/public');
        
        if (is_link($linkPath)) {
            $this->info("   ✅ Symlink existe: {$linkPath}");
            $this->info("   🔗 Apunta a: " . readlink($linkPath));
            
            // Verificar que el target existe
            if (File::exists($linkPath)) {
                $this->info("   ✅ El symlink es accesible");
            } else {
                $this->error("   ❌ El symlink NO es accesible");
            }
        } elseif (File::isDirectory($linkPath)) {
            $this->warn("   ⚠️  Existe un directorio en lugar del symlink: {$linkPath}");
            $this->warn("   💡 Ejecuta: php artisan storage:link");
        } else {
            $this->error("   ❌ Symlink NO existe: {$linkPath}");
            $this->warn("   💡 Ejecuta: php artisan storage:link");
        }
        $this->newLine();

        // 4. Verificar acceso web
        $this->info('4️⃣ Verificando acceso web...');
        $testFile = 'exercises/0001_3_4_sit_up.gif';
        if (Storage::disk('public')->exists($testFile)) {
            $url = Storage::disk('public')->url($testFile);
            $this->info("   ✅ Archivo de prueba existe: {$testFile}");
            $this->info("   🌐 URL generada: {$url}");
        } else {
            $this->error("   ❌ Archivo de prueba NO existe: {$testFile}");
        }
        $this->newLine();

        // 5. Verificar permisos
        $this->info('5️⃣ Verificando permisos...');
        if (File::isDirectory($exercisesPath)) {
            $perms = substr(sprintf('%o', fileperms($exercisesPath)), -4);
            $this->info("   📋 Permisos de carpeta: {$perms}");
            
            if (File::exists($metadataPath)) {
                $filePerms = substr(sprintf('%o', fileperms($metadataPath)), -4);
                $this->info("   📋 Permisos de metadata.json: {$filePerms}");
            }
        }
        $this->newLine();

        $this->info('✅ Diagnóstico completado');
        
        return 0;
    }
}

