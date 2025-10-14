<?php

namespace Database\Seeders;

use App\Models\UserAlert;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class UserAlertSeeder extends Seeder
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

        $alertTypes = [
            'rapid_weight_loss' => [
                'title' => 'Pérdida de Peso Acelerada Detectada',
                'message' => 'Has perdido peso a un ritmo acelerado. Es importante consultar con un médico para asegurar que el proceso sea saludable.',
                'severity' => 'danger',
                'data' => [
                    'weight_loss_rate' => 2.1,
                    'recommendation' => 'Consulta médica recomendada'
                ]
            ],
            'low_adherence' => [
                'title' => 'Adherencia Baja Detectada',
                'message' => 'Has tenido dificultades para mantener tu plan nutricional. Recuerda que el 80% de adherencia es más sostenible que el 100%.',
                'severity' => 'warning',
                'data' => [
                    'low_adherence_days' => 3,
                    'recommendation' => 'Considera ajustar tus objetivos o buscar apoyo adicional'
                ]
            ],
            'hydration_reminder' => [
                'title' => 'Recordatorio de Hidratación',
                'message' => 'Tu hidratación está por debajo del 50% de tu meta diaria. Recuerda beber agua regularmente.',
                'severity' => 'info',
                'data' => [
                    'current_ml' => 1500,
                    'goal_ml' => 4000,
                    'percentage' => 37.5
                ]
            ],
            'safety_warning' => [
                'title' => 'Patrón de Registro Excesivo',
                'message' => 'Has registrado muchas comidas hoy. Recuerda que la flexibilidad es clave para la adherencia a largo plazo.',
                'severity' => 'warning',
                'data' => [
                    'entries_count' => 18,
                    'recommendation' => 'Considera relajar el seguimiento y enfocarte en la consistencia general'
                ]
            ],
            'medical_consultation' => [
                'title' => 'Recomendación de Consulta Médica',
                'message' => 'Basado en tu progreso, te recomendamos consultar con un profesional de la salud para revisar tu plan.',
                'severity' => 'info',
                'data' => [
                    'reason' => 'Progreso significativo',
                    'recommendation' => 'Consulta de seguimiento recomendada'
                ]
            ],
            'meal_reminder' => [
                'title' => 'Recordatorio de Comida',
                'message' => 'Es hora de tu comida planificada. Mantén la consistencia en tus horarios.',
                'severity' => 'info',
                'data' => [
                    'meal_type' => 'lunch',
                    'scheduled_time' => '13:00'
                ]
            ]
        ];

        foreach ($users as $user) {
            // Crear 2-5 alertas por usuario
            $alertCount = rand(2, 5);
            
            for ($i = 0; $i < $alertCount; $i++) {
                $alertType = array_rand($alertTypes);
                $alertData = $alertTypes[$alertType];
                
                // Determinar si la alerta está activa o expirada
                $isActive = rand(1, 100) <= 70; // 70% de probabilidad de estar activa
                $isDismissed = rand(1, 100) <= 20; // 20% de probabilidad de estar desestimada
                
                $createdAt = Carbon::now()->subDays(rand(0, 7));
                $expiresAt = $isActive ? null : $createdAt->copy()->addDays(rand(1, 3));
                $dismissedAt = $isDismissed ? $createdAt->copy()->addHours(rand(1, 24)) : null;
                
                UserAlert::create([
                    'user_id' => $user->id,
                    'type' => $alertType,
                    'title' => $alertData['title'],
                    'message' => $alertData['message'],
                    'data' => $alertData['data'],
                    'severity' => $alertData['severity'],
                    'is_active' => $isActive,
                    'is_dismissed' => $isDismissed,
                    'dismissed_at' => $dismissedAt,
                    'expires_at' => $expiresAt,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt
                ]);
            }
        }

        $this->command->info('Alertas de usuario creadas exitosamente.');
    }
}