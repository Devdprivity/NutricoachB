<?php

namespace App\Services;

use App\Models\User;
use App\Models\InactivityAlert;
use App\Models\UserStreak;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InactivityDetectionService
{
    /**
     * Umbrales de días para diferentes tipos de inactividad
     */
    private const THRESHOLDS = [
        'hydration' => [
            'info' => 1,      // 1 día sin hidratación
            'warning' => 2,   // 2 días sin hidratación
            'critical' => 3,  // 3 días sin hidratación
        ],
        'meals' => [
            'info' => 1,      // 1 día sin comidas
            'warning' => 3,   // 3 días sin comidas
            'critical' => 5,  // 5 días sin comidas
        ],
        'exercise' => [
            'info' => 2,      // 2 días sin ejercicio
            'warning' => 5,   // 5 días sin ejercicio
            'critical' => 7,  // 7 días sin ejercicio
        ],
        'general' => [
            'warning' => 7,   // 7 días sin actividad general
            'critical' => 14, // 14 días sin actividad general
        ],
    ];

    /**
     * Mensajes motivacionales personalizados
     */
    private const MESSAGES = [
        'hydration_inactivity' => [
            'info' => '💧 ¡Te extrañamos! Mantente hidratado para alcanzar tus metas.',
            'warning' => '💦 Tu cuerpo necesita agua. ¿Qué tal un vaso ahora?',
            'critical' => '🚰 La hidratación es crucial. ¡Retoma el hábito hoy!',
        ],
        'meal_inactivity' => [
            'info' => '🍎 No olvides registrar tus comidas para seguir tu progreso.',
            'warning' => '🥗 Llevar un registro nutricional te acerca a tus objetivos.',
            'critical' => '📊 ¡Tu nutrición es importante! Vuelve a trackear tus comidas.',
        ],
        'exercise_inactivity' => [
            'info' => '💪 ¿Listo para tu próximo entrenamiento?',
            'warning' => '🏃 Tu cuerpo extraña el movimiento. ¡Es hora de activarte!',
            'critical' => '⚡ Una semana sin ejercicio. ¡Recupera tu ritmo hoy!',
        ],
        'general_inactivity' => [
            'warning' => '🌟 Te extrañamos. ¡Vuelve y continúa tu transformación!',
            'critical' => '🎯 Han pasado dos semanas. Tu salud te espera. ¡Regresa!',
        ],
        'streak_broken' => [
            'info' => '🔥 Tu racha se rompió, pero puedes comenzar una nueva hoy.',
        ],
    ];

    /**
     * Detectar inactividad para todos los usuarios activos
     */
    public function detectInactivityForAllUsers(): array
    {
        $stats = [
            'users_checked' => 0,
            'alerts_created' => 0,
            'alerts_by_type' => [],
        ];

        // Obtener todos los usuarios con stats (que han tenido actividad alguna vez)
        $users = User::whereHas('profile')->with(['profile'])->get();

        foreach ($users as $user) {
            $stats['users_checked']++;
            $alerts = $this->detectInactivityForUser($user);
            $stats['alerts_created'] += count($alerts);

            foreach ($alerts as $alert) {
                $type = $alert['type'];
                $stats['alerts_by_type'][$type] = ($stats['alerts_by_type'][$type] ?? 0) + 1;
            }
        }

        Log::info('Detección de inactividad completada', $stats);
        return $stats;
    }

    /**
     * Detectar inactividad para un usuario específico
     */
    public function detectInactivityForUser(User $user): array
    {
        $alerts = [];

        // Verificar si el usuario tiene UserStats
        $userStats = DB::table('user_stats')->where('user_id', $user->id)->first();

        if (!$userStats || !$userStats->last_activity_date) {
            // Usuario nuevo o sin actividad, no generar alertas aún
            return $alerts;
        }

        $lastActivityDate = Carbon::parse($userStats->last_activity_date);
        $daysSinceLastActivity = $lastActivityDate->diffInDays(now());

        // 1. Verificar inactividad general
        $generalAlert = $this->checkGeneralInactivity($user, $daysSinceLastActivity, $lastActivityDate);
        if ($generalAlert) {
            $alerts[] = $generalAlert;
        }

        // 2. Verificar inactividad de hidratación
        $hydrationAlert = $this->checkHydrationInactivity($user);
        if ($hydrationAlert) {
            $alerts[] = $hydrationAlert;
        }

        // 3. Verificar inactividad de comidas
        $mealAlert = $this->checkMealInactivity($user);
        if ($mealAlert) {
            $alerts[] = $mealAlert;
        }

        // 4. Verificar inactividad de ejercicio
        $exerciseAlert = $this->checkExerciseInactivity($user);
        if ($exerciseAlert) {
            $alerts[] = $exerciseAlert;
        }

        // 5. Verificar rachas rotas
        $streakAlerts = $this->checkBrokenStreaks($user);
        $alerts = array_merge($alerts, $streakAlerts);

        return $alerts;
    }

    /**
     * Verificar inactividad general
     */
    private function checkGeneralInactivity(User $user, int $daysInactive, Carbon $lastActivityDate): ?array
    {
        $severity = null;

        if ($daysInactive >= self::THRESHOLDS['general']['critical']) {
            $severity = InactivityAlert::SEVERITY_CRITICAL;
        } elseif ($daysInactive >= self::THRESHOLDS['general']['warning']) {
            $severity = InactivityAlert::SEVERITY_WARNING;
        }

        if (!$severity) {
            return null;
        }

        // Verificar si ya existe una alerta similar no resuelta
        if ($this->alertExists($user->id, InactivityAlert::TYPE_GENERAL, $severity)) {
            return null;
        }

        return $this->createAlertData(
            $user->id,
            InactivityAlert::TYPE_GENERAL,
            $severity,
            $daysInactive,
            $lastActivityDate,
            self::MESSAGES['general_inactivity'][$severity],
            'Registra cualquier actividad para volver al camino'
        );
    }

    /**
     * Verificar inactividad de hidratación
     */
    private function checkHydrationInactivity(User $user): ?array
    {
        $lastHydration = DB::table('hydration_records')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastHydration) {
            // Usuario nunca ha registrado hidratación
            return null;
        }

        $lastHydrationDate = Carbon::parse($lastHydration->created_at);
        $daysInactive = $lastHydrationDate->diffInDays(now());

        $severity = null;
        if ($daysInactive >= self::THRESHOLDS['hydration']['critical']) {
            $severity = InactivityAlert::SEVERITY_CRITICAL;
        } elseif ($daysInactive >= self::THRESHOLDS['hydration']['warning']) {
            $severity = InactivityAlert::SEVERITY_WARNING;
        } elseif ($daysInactive >= self::THRESHOLDS['hydration']['info']) {
            $severity = InactivityAlert::SEVERITY_INFO;
        }

        if (!$severity || $this->alertExists($user->id, InactivityAlert::TYPE_HYDRATION, $severity)) {
            return null;
        }

        return $this->createAlertData(
            $user->id,
            InactivityAlert::TYPE_HYDRATION,
            $severity,
            $daysInactive,
            $lastHydrationDate,
            self::MESSAGES['hydration_inactivity'][$severity],
            'Registra tu consumo de agua diario'
        );
    }

    /**
     * Verificar inactividad de comidas
     */
    private function checkMealInactivity(User $user): ?array
    {
        $lastMeal = DB::table('meal_records')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastMeal) {
            return null;
        }

        $lastMealDate = Carbon::parse($lastMeal->created_at);
        $daysInactive = $lastMealDate->diffInDays(now());

        $severity = null;
        if ($daysInactive >= self::THRESHOLDS['meals']['critical']) {
            $severity = InactivityAlert::SEVERITY_CRITICAL;
        } elseif ($daysInactive >= self::THRESHOLDS['meals']['warning']) {
            $severity = InactivityAlert::SEVERITY_WARNING;
        } elseif ($daysInactive >= self::THRESHOLDS['meals']['info']) {
            $severity = InactivityAlert::SEVERITY_INFO;
        }

        if (!$severity || $this->alertExists($user->id, InactivityAlert::TYPE_MEAL, $severity)) {
            return null;
        }

        return $this->createAlertData(
            $user->id,
            InactivityAlert::TYPE_MEAL,
            $severity,
            $daysInactive,
            $lastMealDate,
            self::MESSAGES['meal_inactivity'][$severity],
            'Registra tus comidas para seguir tu progreso nutricional'
        );
    }

    /**
     * Verificar inactividad de ejercicio
     */
    private function checkExerciseInactivity(User $user): ?array
    {
        $lastExercise = DB::table('exercise_logs')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastExercise) {
            return null;
        }

        $lastExerciseDate = Carbon::parse($lastExercise->created_at);
        $daysInactive = $lastExerciseDate->diffInDays(now());

        $severity = null;
        if ($daysInactive >= self::THRESHOLDS['exercise']['critical']) {
            $severity = InactivityAlert::SEVERITY_CRITICAL;
        } elseif ($daysInactive >= self::THRESHOLDS['exercise']['warning']) {
            $severity = InactivityAlert::SEVERITY_WARNING;
        } elseif ($daysInactive >= self::THRESHOLDS['exercise']['info']) {
            $severity = InactivityAlert::SEVERITY_INFO;
        }

        if (!$severity || $this->alertExists($user->id, InactivityAlert::TYPE_EXERCISE, $severity)) {
            return null;
        }

        return $this->createAlertData(
            $user->id,
            InactivityAlert::TYPE_EXERCISE,
            $severity,
            $daysInactive,
            $lastExerciseDate,
            self::MESSAGES['exercise_inactivity'][$severity],
            'Completa un ejercicio hoy para retomar tu rutina'
        );
    }

    /**
     * Verificar rachas rotas
     */
    private function checkBrokenStreaks(User $user): array
    {
        $alerts = [];

        $brokenStreaks = UserStreak::where('user_id', $user->id)
            ->where('is_active', false)
            ->where('current_count', 0)
            ->where('longest_count', '>', 0) // Solo si tuvo una racha antes
            ->whereDate('last_activity_date', '>=', now()->subDays(7)) // Rota en los últimos 7 días
            ->get();

        foreach ($brokenStreaks as $streak) {
            // Verificar si ya existe alerta para esta racha
            $existingAlert = InactivityAlert::where('user_id', $user->id)
                ->where('type', InactivityAlert::TYPE_STREAK_BROKEN)
                ->where('is_resolved', false)
                ->where('metadata->streak_type', $streak->type)
                ->first();

            if ($existingAlert) {
                continue;
            }

            $streakTypeName = $this->getStreakTypeName($streak->type);
            $message = "🔥 Tu racha de {$streakTypeName} de {$streak->longest_count} días se rompió. ¡Pero puedes comenzar una nueva hoy!";

            $alerts[] = $this->createAlertData(
                $user->id,
                InactivityAlert::TYPE_STREAK_BROKEN,
                InactivityAlert::SEVERITY_INFO,
                now()->diffInDays($streak->last_activity_date),
                Carbon::parse($streak->last_activity_date),
                $message,
                "Retoma tu hábito de {$streakTypeName}",
                ['streak_type' => $streak->type, 'longest_count' => $streak->longest_count]
            );
        }

        return $alerts;
    }

    /**
     * Crear datos de alerta
     */
    private function createAlertData(
        int $userId,
        string $type,
        string $severity,
        int $daysInactive,
        Carbon $lastActivityDate,
        string $message,
        string $actionSuggested,
        array $metadata = []
    ): array {
        $alertData = [
            'user_id' => $userId,
            'type' => $type,
            'severity' => $severity,
            'days_inactive' => $daysInactive,
            'last_activity_date' => $lastActivityDate->toDateString(),
            'message' => $message,
            'action_suggested' => $actionSuggested,
            'metadata' => $metadata,
        ];

        // Crear la alerta en la base de datos
        InactivityAlert::create($alertData);

        return $alertData;
    }

    /**
     * Verificar si ya existe una alerta similar no resuelta
     */
    private function alertExists(int $userId, string $type, string $severity): bool
    {
        return InactivityAlert::where('user_id', $userId)
            ->where('type', $type)
            ->where('severity', $severity)
            ->where('is_resolved', false)
            ->exists();
    }

    /**
     * Obtener nombre legible del tipo de racha
     */
    private function getStreakTypeName(string $type): string
    {
        return match ($type) {
            'meal_logging' => 'registro de comidas',
            'exercise' => 'ejercicio',
            'hydration' => 'hidratación',
            'daily_login' => 'inicio de sesión diario',
            default => $type,
        };
    }

    /**
     * Resolver alertas automáticamente cuando el usuario vuelve a estar activo
     */
    public function resolveAlertsForUser(User $user, string $type): void
    {
        InactivityAlert::where('user_id', $user->id)
            ->where('type', $type)
            ->where('is_resolved', false)
            ->update([
                'is_resolved' => true,
                'resolved_at' => now(),
            ]);
    }

    /**
     * Resolver todas las alertas de un usuario
     */
    public function resolveAllAlertsForUser(User $user): void
    {
        InactivityAlert::where('user_id', $user->id)
            ->where('is_resolved', false)
            ->update([
                'is_resolved' => true,
                'resolved_at' => now(),
            ]);
    }

    /**
     * Limpiar alertas antiguas resueltas (más de 30 días)
     */
    public function cleanupOldAlerts(): int
    {
        return InactivityAlert::where('is_resolved', true)
            ->where('resolved_at', '<', now()->subDays(30))
            ->delete();
    }
}
