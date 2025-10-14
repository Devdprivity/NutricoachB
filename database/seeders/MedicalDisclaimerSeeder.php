<?php

namespace Database\Seeders;

use App\Models\MedicalDisclaimer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MedicalDisclaimerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios existentes
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No hay usuarios en la base de datos.');
            return;
        }

        $disclaimerText = "IMPORTANTE: Este sistema de apoyo educativo NO reemplaza la supervisión médica profesional. 

Siempre se recomienda consultar con nutricionistas, médicos y entrenadores certificados antes de seguir cualquier plan nutricional o de suplementación.

El sistema está diseñado para acompañar tu proceso de transformación corporal de manera saludable y sostenible, pero no debe ser el único recurso para decisiones médicas importantes.

Si experimentas síntomas inusuales, cambios drásticos en tu salud, o tienes dudas sobre tu plan nutricional, consulta inmediatamente con un profesional de la salud.

Al usar este sistema, aceptas que:
- Entiendes que este es un sistema de apoyo educativo
- Reconoces la importancia de la supervisión médica profesional
- Te comprometes a consultar con profesionales de la salud cuando sea necesario
- Aceptas la responsabilidad de tu propia salud y bienestar";

        foreach ($users as $user) {
            // 80% de probabilidad de que el usuario haya aceptado el disclaimer
            $isAccepted = rand(1, 100) <= 80;
            
            MedicalDisclaimer::create([
                'user_id' => $user->id,
                'disclaimer_text' => $disclaimerText,
                'is_accepted' => $isAccepted,
                'accepted_at' => $isAccepted ? Carbon::now()->subDays(rand(1, 30)) : null,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Seeder/1.0',
                'version' => '1.0'
            ]);
        }

        $this->command->info('Disclaimers médicos creados exitosamente.');
    }
}