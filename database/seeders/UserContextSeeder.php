<?php

namespace Database\Seeders;

use App\Models\UserContext;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class UserContextSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios existentes
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No hay usuarios en la base de datos. Creando usuario de ejemplo...');
            
            $user = User::create([
                'name' => 'Luis Ejemplo',
                'email' => 'luis@ejemplo.com',
                'password' => bcrypt('password123'),
            ]);
            
            $users = collect([$user]);
        }

        $contextTypes = [
            'stressful_day' => 'Día estresante en el trabajo',
            'weekend' => 'Fin de semana con familia',
            'illness' => 'Resfriado común',
            'travel' => 'Viaje de trabajo',
            'social_event' => 'Cena con amigos',
            'work_pressure' => 'Presión laboral alta',
            'emotional_state' => 'Estado emocional bajo'
        ];

        foreach ($users as $user) {
            // Crear contextos para los últimos 7 días
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::now()->subDays($i);
                
                // 30% de probabilidad de tener un contexto especial
                if (rand(1, 100) <= 30) {
                    $contextType = array_rand($contextTypes);
                    
                    UserContext::create([
                        'user_id' => $user->id,
                        'date' => $date->toDateString(),
                        'context_type' => $contextType,
                        'description' => $contextTypes[$contextType],
                        'stress_level' => rand(1, 10),
                        'energy_level' => rand(1, 10),
                        'mood_level' => rand(1, 10),
                        'additional_data' => [
                            'location' => 'Casa',
                            'weather' => 'Soleado',
                            'notes' => 'Contexto generado automáticamente'
                        ],
                        'affects_nutrition' => true,
                    ]);
                }
            }
        }

        $this->command->info('Contextos de usuario creados exitosamente.');
    }
}