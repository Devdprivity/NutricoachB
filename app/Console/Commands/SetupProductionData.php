<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SetupProductionData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:production';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configura los datos iniciales necesarios para producción (planes, ejercicios, etc.)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Configurando datos de producción...');
        $this->newLine();

        // 1. Ejecutar migraciones pendientes
        $this->info('📦 Ejecutando migraciones pendientes...');
        Artisan::call('migrate', ['--force' => true]);
        $this->line(Artisan::output());

        // 2. Crear planes de suscripción
        $this->info('💳 Creando planes de suscripción...');
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\SubscriptionPlansSeeder',
            '--force' => true
        ]);
        $this->line(Artisan::output());

        // 3. Crear ejercicios
        $this->info('💪 Creando catálogo de ejercicios...');
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\ExerciseSeeder',
            '--force' => true
        ]);
        $this->line(Artisan::output());

        // 4. Crear items de comida
        $this->info('🍎 Creando catálogo de alimentos...');
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\FoodItemSeeder',
            '--force' => true
        ]);
        $this->line(Artisan::output());

        $this->newLine();
        $this->info('✅ ¡Configuración de producción completada exitosamente!');
        $this->newLine();
        
        $this->table(
            ['Componente', 'Estado'],
            [
                ['Migraciones', '✓ Ejecutadas'],
                ['Planes de Suscripción', '✓ Creados'],
                ['Ejercicios', '✓ Creados'],
                ['Alimentos', '✓ Creados'],
            ]
        );

        return Command::SUCCESS;
    }
}
