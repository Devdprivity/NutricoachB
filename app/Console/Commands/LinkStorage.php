<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class LinkStorage extends Command
{
    protected $signature = 'storage:link-exercises';
    protected $description = 'Verificar y crear el symlink de storage si no existe';

    public function handle()
    {
        $this->info('🔗 Verificando symlink de storage...');

        $link = public_path('storage');
        $target = storage_path('app/public');

        // Verificar si el symlink ya existe
        if (is_link($link)) {
            $this->info('✅ El symlink ya existe: ' . $link);
            return 0;
        }

        // Verificar si existe como directorio (no symlink)
        if (is_dir($link)) {
            $this->warn('⚠️  Existe un directorio en lugar del symlink: ' . $link);
            $this->warn('   Esto puede causar problemas. Considera eliminarlo y recrear el symlink.');
            return 1;
        }

        // Crear el symlink
        try {
            if (File::exists($link)) {
                File::delete($link);
            }

            if (PHP_OS_FAMILY === 'Windows') {
                // Windows necesita un método diferente
                $this->warn('⚠️  En Windows, crea el symlink manualmente:');
                $this->line("   mklink /D public\\storage storage\\app\\public");
            } else {
                symlink($target, $link);
                $this->info('✅ Symlink creado exitosamente: ' . $link . ' -> ' . $target);
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error al crear el symlink: ' . $e->getMessage());
            $this->line('');
            $this->line('💡 Intenta ejecutar manualmente:');
            $this->line('   php artisan storage:link');
            return 1;
        }
    }
}

