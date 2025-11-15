<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\UserAchievement;
use App\Models\UserStreak;
use App\Models\XpTransaction;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GamificationController extends Controller
{
    protected GamificationService $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Mostrar página de logros y estadísticas
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Obtener progreso general
        $progress = $this->gamificationService->getUserProgress($user);

        // Obtener todos los achievements disponibles
        $allAchievements = Achievement::where('is_active', true)
            ->orderBy('difficulty')
            ->orderBy('category')
            ->get()
            ->map(function ($achievement) use ($user) {
                $userAchievement = UserAchievement::where('user_id', $user->id)
                    ->where('achievement_id', $achievement->id)
                    ->first();

                return [
                    'id' => $achievement->id,
                    'key' => $achievement->key,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'category' => $achievement->category,
                    'xp_reward' => $achievement->xp_reward,
                    'difficulty' => $achievement->difficulty,
                    'unlocked' => $userAchievement !== null,
                    'unlocked_at' => $userAchievement?->unlocked_at?->format('d/m/Y H:i'),
                    'progress' => $userAchievement?->progress ?? 0,
                ];
            })
            ->groupBy('category');

        // Obtener rachas activas
        $streaks = UserStreak::where('user_id', $user->id)
            ->where('is_active', true)
            ->get()
            ->map(function ($streak) {
                return [
                    'type' => $streak->type,
                    'current_count' => $streak->current_count,
                    'longest_count' => $streak->longest_count,
                    'last_activity' => $streak->last_activity_date?->format('d/m/Y'),
                    'is_active_today' => $streak->last_activity_date?->isToday() ?? false,
                ];
            });

        // Obtener historial reciente de XP
        $recentXp = XpTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'xp_amount' => $transaction->xp_amount,
                    'source' => $transaction->source,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('achievements', [
            'progress' => $progress,
            'achievements' => $allAchievements,
            'streaks' => $streaks,
            'recent_xp' => $recentXp,
        ]);
    }

    /**
     * Obtener datos de gamificación para widgets (API)
     */
    public function getStats(Request $request)
    {
        $user = $request->user();
        $progress = $this->gamificationService->getUserProgress($user);

        return response()->json($progress);
    }
}
