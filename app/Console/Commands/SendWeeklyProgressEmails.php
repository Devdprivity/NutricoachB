<?php

namespace App\Console\Commands;

use App\Mail\ProgressUpdateMail;
use App\Models\User;
use App\Models\MealRecord;
use App\Models\ExerciseLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendWeeklyProgressEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send-weekly-progress {--user=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send weekly progress update emails to all active users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting weekly progress email sending...');

        // Si se especifica un usuario, enviar solo a ese usuario
        if ($userId = $this->option('user')) {
            $users = User::where('id', $userId)->get();
        } else {
            // Obtener todos los usuarios activos (que han iniciado sesión en los últimos 30 días)
            $users = User::where('last_login_at', '>=', now()->subDays(30))
                ->orWhereNotNull('email_verified_at')
                ->get();
        }

        $sent = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                // Obtener estadísticas de la última semana
                $weekStart = now()->subWeek()->startOfWeek();
                $weekEnd = now()->subWeek()->endOfWeek();

                // Estadísticas de nutrición
                $weekMeals = MealRecord::where('user_id', $user->id)
                    ->whereBetween('date', [$weekStart, $weekEnd])
                    ->get();

                // Estadísticas de ejercicios
                $weekExercises = ExerciseLog::where('user_id', $user->id)
                    ->whereBetween('date', [$weekStart, $weekEnd])
                    ->get();

                // Si el usuario no tiene actividad en la semana, skip
                if ($weekMeals->count() === 0 && $weekExercises->count() === 0) {
                    $this->warn("  User {$user->email} has no activity this week, skipping...");
                    continue;
                }

                // Preparar estadísticas para el email
                $stats = [
                    'week_start' => $weekStart->format('Y-m-d'),
                    'week_end' => $weekEnd->format('Y-m-d'),
                    'meals_logged' => $weekMeals->count(),
                    'total_calories' => round($weekMeals->sum('calories'), 2),
                    'avg_calories_per_day' => $weekMeals->count() > 0 ? round($weekMeals->sum('calories') / 7, 2) : 0,
                    'total_protein' => round($weekMeals->sum('protein'), 2),
                    'total_carbs' => round($weekMeals->sum('carbs'), 2),
                    'total_fat' => round($weekMeals->sum('fat'), 2),
                    'exercises_completed' => $weekExercises->count(),
                    'total_calories_burned' => round($weekExercises->sum('calories_burned'), 2),
                    'total_exercise_minutes' => $weekExercises->sum('duration_minutes'),
                ];

                // Logros de la semana
                $achievements = [];
                if ($weekMeals->count() >= 21) {
                    $achievements[] = '🎯 Registraste 21+ comidas esta semana';
                }
                if ($weekExercises->count() >= 5) {
                    $achievements[] = '💪 Completaste 5+ entrenamientos';
                }
                if ($stats['total_calories_burned'] >= 2000) {
                    $achievements[] = '🔥 Quemaste más de 2000 calorías';
                }
                if (empty($achievements)) {
                    $achievements[] = '✓ Seguiste registrando tu progreso';
                }

                // Comparación con la semana anterior
                $prevWeekStart = $weekStart->copy()->subWeek();
                $prevWeekEnd = $weekEnd->copy()->subWeek();

                $prevWeekMeals = MealRecord::where('user_id', $user->id)
                    ->whereBetween('date', [$prevWeekStart, $prevWeekEnd])
                    ->get();

                $comparison = [
                    'meals_diff' => $weekMeals->count() - $prevWeekMeals->count(),
                    'calories_diff' => round(($weekMeals->sum('calories') - $prevWeekMeals->sum('calories')), 2),
                ];

                // Recomendaciones personalizadas
                $recommendations = [];
                if ($weekMeals->count() < 14) {
                    $recommendations[] = 'Intenta registrar al menos 2 comidas diarias para un mejor seguimiento';
                }
                if ($weekExercises->count() < 3) {
                    $recommendations[] = 'Agrega 3 sesiones de ejercicio semanales para mejores resultados';
                }
                if ($stats['avg_calories_per_day'] > 0) {
                    $goal = $user->profile?->daily_calorie_goal ?? 2000;
                    if ($stats['avg_calories_per_day'] < $goal * 0.8) {
                        $recommendations[] = 'Estás consumiendo menos calorías de lo recomendado';
                    } elseif ($stats['avg_calories_per_day'] > $goal * 1.2) {
                        $recommendations[] = 'Estás superando tu meta calórica diaria';
                    }
                }

                // Enviar email a COLA LOW (batch, no urgente)
                Mail::to($user->email)
                    ->queue(new ProgressUpdateMail(
                        $user,
                        $stats,
                        $achievements,
                        $comparison,
                        $recommendations
                    ))
                    ->onQueue('low');

                $sent++;
                $this->info("✓ Email queued on LOW priority for {$user->email}");

                \Log::info('Weekly progress email queued on LOW priority', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'week_start' => $weekStart->format('Y-m-d'),
                ]);

            } catch (\Exception $e) {
                $failed++;
                $this->error("✗ Failed to send email to {$user->email}: {$e->getMessage()}");

                \Log::error('Failed to send weekly progress email', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("\nWeekly progress email sending completed!");
        $this->info("Sent: {$sent}");
        $this->info("Failed: {$failed}");
        $this->info("Total users processed: " . ($sent + $failed));

        return Command::SUCCESS;
    }
}
