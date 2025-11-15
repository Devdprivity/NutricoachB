<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Crear una notificación
     */
    public function create(
        User $user,
        string $type,
        string $title,
        string $message,
        ?string $icon = null,
        ?string $color = null,
        ?string $actionUrl = null,
        ?array $metadata = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'icon' => $icon,
            'color' => $color,
            'action_url' => $actionUrl,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Crear notificación de recordatorio de hidratación
     */
    public function createHydrationReminder(User $user): Notification
    {
        $todayHydration = $user->hydrationRecords()
            ->whereDate('date', Carbon::today())
            ->sum('amount_ml');

        $goal = $user->profile?->water_goal ?? 4000;
        $percentage = $goal > 0 ? ($todayHydration / $goal) * 100 : 0;

        if ($percentage < 50) {
            return $this->create(
                $user,
                'hydration_reminder',
                '💧 Recordatorio de Hidratación',
                "Has consumido {$todayHydration}ml de agua hoy. Tu meta es {$goal}ml. ¡Sigue hidratándote!",
                'Droplet',
                '#3b82f6',
                '/hydration',
                ['current_ml' => $todayHydration, 'goal_ml' => $goal, 'percentage' => round($percentage, 2)]
            );
        }

        return null;
    }

    /**
     * Crear notificación de recordatorio de nutrición
     */
    public function createNutritionReminder(User $user): ?Notification
    {
        $today = Carbon::today();
        $mealsCount = $user->mealRecords()
            ->whereDate('date', $today)
            ->count();

        if ($mealsCount < 3) {
            $mealsNeeded = 3 - $mealsCount;
            return $this->create(
                $user,
                'nutrition_reminder',
                '🍎 Recordatorio de Nutrición',
                "Has registrado {$mealsCount} comidas hoy. Te faltan {$mealsNeeded} comidas por registrar.",
                'Apple',
                '#10b981',
                '/nutrition',
                ['meals_count' => $mealsCount, 'meals_needed' => $mealsNeeded]
            );
        }

        return null;
    }

    /**
     * Crear notificación de follow
     */
    public function createFollowNotification(User $user, User $follower): Notification
    {
        return $this->create(
            $user,
            'follow',
            '👤 Nuevo Seguidor',
            "{$follower->name} comenzó a seguirte",
            'UserPlus',
            '#8b5cf6',
            "/social?user={$follower->id}",
            ['follower_id' => $follower->id, 'follower_name' => $follower->name]
        );
    }

    /**
     * Crear notificación de unfollow
     */
    public function createUnfollowNotification(User $user, User $unfollower): Notification
    {
        return $this->create(
            $user,
            'unfollow',
            '👋 Dejó de Seguirte',
            "{$unfollower->name} dejó de seguirte",
            'UserMinus',
            '#ef4444',
            '/social',
            ['unfollower_id' => $unfollower->id, 'unfollower_name' => $unfollower->name]
        );
    }

    /**
     * Crear notificación de progreso
     */
    public function createProgressNotification(User $user, string $message, ?string $actionUrl = null): Notification
    {
        return $this->create(
            $user,
            'progress',
            '📈 Nuevo Progreso',
            $message,
            'TrendingUp',
            '#f59e0b',
            $actionUrl ?? '/progress'
        );
    }

    /**
     * Crear notificación de coaching
     */
    public function createCoachingNotification(User $user, string $message): Notification
    {
        return $this->create(
            $user,
            'coaching',
            '💬 Nuevo Mensaje de Coaching',
            $message,
            'MessageSquare',
            '#06b6d4',
            '/coaching'
        );
    }

    /**
     * Crear notificación de logro
     */
    public function createAchievementNotification(User $user, string $achievementName, ?string $description = null): Notification
    {
        return $this->create(
            $user,
            'achievement',
            '🏆 ¡Nuevo Logro Desbloqueado!',
            $description ?? "Has desbloqueado el logro: {$achievementName}",
            'Award',
            '#fbbf24',
            '/achievements',
            ['achievement_name' => $achievementName]
        );
    }

    /**
     * Crear notificación de suscripción por vencer
     */
    public function createSubscriptionExpiringNotification(User $user, int $daysLeft): Notification
    {
        return $this->create(
            $user,
            'subscription_expiring',
            '⏰ Tu Suscripción Está Por Vencer',
            "Tu suscripción expira en {$daysLeft} " . ($daysLeft === 1 ? 'día' : 'días'),
            'Clock',
            '#f59e0b',
            '/subscription',
            ['days_left' => $daysLeft]
        );
    }

    /**
     * Crear notificación de suscripción expirada
     */
    public function createSubscriptionExpiredNotification(User $user): Notification
    {
        return $this->create(
            $user,
            'subscription_expired',
            '❌ Suscripción Expirada',
            'Tu suscripción ha expirado. Renueva para seguir disfrutando de todas las funciones premium.',
            'AlertCircle',
            '#ef4444',
            '/subscription'
        );
    }

    /**
     * Verificar y crear notificaciones automáticas
     */
    public function checkAndCreateAutomaticNotifications(User $user): void
    {
        // Recordatorio de hidratación (cada 3 horas si no ha alcanzado el 50%)
        $lastHydrationReminder = $user->notifications()
            ->where('type', 'hydration_reminder')
            ->where('created_at', '>=', Carbon::now()->subHours(3))
            ->exists();

        if (!$lastHydrationReminder) {
            $this->createHydrationReminder($user);
        }

        // Recordatorio de nutrición (si tiene menos de 3 comidas registradas)
        $todayMeals = $user->mealRecords()
            ->whereDate('date', Carbon::today())
            ->count();

        if ($todayMeals < 3) {
            $lastNutritionReminder = $user->notifications()
                ->where('type', 'nutrition_reminder')
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if (!$lastNutritionReminder) {
                $this->createNutritionReminder($user);
            }
        }

        // Verificar suscripción por vencer (7 días antes)
        if ($user->activeSubscription) {
            $endDate = Carbon::parse($user->activeSubscription->end_date);
            $daysLeft = Carbon::now()->diffInDays($endDate, false);

            if ($daysLeft > 0 && $daysLeft <= 7) {
                $lastSubscriptionNotification = $user->notifications()
                    ->where('type', 'subscription_expiring')
                    ->whereDate('created_at', Carbon::today())
                    ->exists();

                if (!$lastSubscriptionNotification) {
                    $this->createSubscriptionExpiringNotification($user, $daysLeft);
                }
            }
        }
    }
}

