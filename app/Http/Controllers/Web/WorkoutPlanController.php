<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\WorkoutPlan;
use App\Models\WorkoutExercise;
use App\Models\WorkoutLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkoutPlanController extends Controller
{
    /**
     * Mostrar todos los planes de entrenamiento del usuario
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $plans = WorkoutPlan::where('user_id', $user->id)
            ->withCount('exercises')
            ->with(['exercises' => function ($query) {
                $query->orderBy('order')->limit(3);
            }])
            ->latest()
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'difficulty' => $plan->difficulty,
                    'duration_weeks' => $plan->duration_weeks,
                    'schedule' => $plan->schedule,
                    'goal' => $plan->goal,
                    'is_active' => $plan->is_active,
                    'is_public' => $plan->is_public,
                    'times_completed' => $plan->times_completed,
                    'exercises_count' => $plan->exercises_count,
                    'exercises' => $plan->exercises,
                    'today_progress' => $plan->today_progress,
                    'created_at' => $plan->created_at->toISOString(),
                ];
            });

        // Obtener planes públicos destacados
        $publicPlans = WorkoutPlan::where('is_public', true)
            ->where('user_id', '!=', $user->id)
            ->withCount('exercises')
            ->latest()
            ->limit(6)
            ->get();

        // Estadísticas del usuario
        $stats = [
            'total_plans' => WorkoutPlan::where('user_id', $user->id)->count(),
            'active_plans' => WorkoutPlan::where('user_id', $user->id)->where('is_active', true)->count(),
            'total_workouts_logged' => WorkoutLog::where('user_id', $user->id)->where('completed', true)->count(),
            'workouts_this_week' => WorkoutLog::where('user_id', $user->id)
                ->where('completed', true)
                ->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
        ];

        return Inertia::render('workout-plans', [
            'plans' => $plans,
            'publicPlans' => $publicPlans,
            'stats' => $stats,
        ]);
    }

    /**
     * Crear un nuevo plan de entrenamiento
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'duration_weeks' => 'nullable|integer|min:1',
            'schedule' => 'nullable|array',
            'goal' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'exercises' => 'required|array|min:1',
            'exercises.*.name' => 'required|string|max:255',
            'exercises.*.description' => 'nullable|string',
            'exercises.*.muscle_group' => 'nullable|string',
            'exercises.*.sets' => 'required|integer|min:1',
            'exercises.*.reps' => 'nullable|integer|min:1',
            'exercises.*.duration_seconds' => 'nullable|integer|min:1',
            'exercises.*.weight_kg' => 'nullable|numeric|min:0',
            'exercises.*.rest_seconds' => 'nullable|integer|min:0',
            'exercises.*.order' => 'nullable|integer|min:0',
            'exercises.*.video_url' => 'nullable|url',
            'exercises.*.image_url' => 'nullable|url',
            'exercises.*.instructions' => 'nullable|array',
        ]);

        $plan = WorkoutPlan::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'difficulty' => $validated['difficulty'],
            'duration_weeks' => $validated['duration_weeks'] ?? null,
            'schedule' => $validated['schedule'] ?? null,
            'goal' => $validated['goal'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        // Crear ejercicios del plan
        foreach ($validated['exercises'] as $index => $exerciseData) {
            WorkoutExercise::create([
                'workout_plan_id' => $plan->id,
                'name' => $exerciseData['name'],
                'description' => $exerciseData['description'] ?? null,
                'muscle_group' => $exerciseData['muscle_group'] ?? null,
                'sets' => $exerciseData['sets'],
                'reps' => $exerciseData['reps'] ?? null,
                'duration_seconds' => $exerciseData['duration_seconds'] ?? null,
                'weight_kg' => $exerciseData['weight_kg'] ?? null,
                'rest_seconds' => $exerciseData['rest_seconds'] ?? 60,
                'order' => $exerciseData['order'] ?? $index,
                'video_url' => $exerciseData['video_url'] ?? null,
                'image_url' => $exerciseData['image_url'] ?? null,
                'instructions' => $exerciseData['instructions'] ?? null,
            ]);
        }

        return redirect()->back()->with('success', 'Plan de entrenamiento creado exitosamente');
    }

    /**
     * Ver detalles de un plan específico
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        $plan = WorkoutPlan::with(['exercises' => function ($query) {
            $query->orderBy('order');
        }])
            ->where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('is_public', true);
            })
            ->firstOrFail();

        // Obtener logs recientes para este plan
        $recentLogs = WorkoutLog::where('workout_plan_id', $plan->id)
            ->where('user_id', $user->id)
            ->with('workoutExercise')
            ->orderBy('date', 'desc')
            ->limit(20)
            ->get();

        // Progreso semanal
        $weeklyProgress = WorkoutLog::where('workout_plan_id', $plan->id)
            ->where('user_id', $user->id)
            ->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])
            ->selectRaw('DATE(date) as day, COUNT(*) as count')
            ->groupBy('day')
            ->get();

        return Inertia::render('workout-plan-detail', [
            'plan' => $plan,
            'recentLogs' => $recentLogs,
            'weeklyProgress' => $weeklyProgress,
        ]);
    }

    /**
     * Actualizar un plan de entrenamiento
     */
    public function update(Request $request, int $id)
    {
        $plan = WorkoutPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'sometimes|in:beginner,intermediate,advanced',
            'duration_weeks' => 'nullable|integer|min:1',
            'schedule' => 'nullable|array',
            'goal' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        $plan->update($validated);

        return redirect()->back()->with('success', 'Plan actualizado exitosamente');
    }

    /**
     * Eliminar un plan de entrenamiento
     */
    public function destroy(Request $request, int $id)
    {
        $plan = WorkoutPlan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $plan->delete();

        return redirect()->route('workout-plans')->with('success', 'Plan eliminado exitosamente');
    }

    /**
     * Registrar un ejercicio completado
     */
    public function logWorkout(Request $request)
    {
        $validated = $request->validate([
            'workout_plan_id' => 'required|exists:workout_plans,id',
            'workout_exercise_id' => 'required|exists:workout_exercises,id',
            'date' => 'required|date',
            'sets_completed' => 'required|integer|min:0',
            'reps_completed' => 'nullable|integer|min:0',
            'weight_used_kg' => 'nullable|numeric|min:0',
            'duration_seconds' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'difficulty_felt' => 'nullable|in:easy,medium,hard',
            'completed' => 'boolean',
        ]);

        $log = WorkoutLog::create([
            'user_id' => $request->user()->id,
            'workout_plan_id' => $validated['workout_plan_id'],
            'workout_exercise_id' => $validated['workout_exercise_id'],
            'date' => $validated['date'],
            'sets_completed' => $validated['sets_completed'],
            'reps_completed' => $validated['reps_completed'] ?? null,
            'weight_used_kg' => $validated['weight_used_kg'] ?? null,
            'duration_seconds' => $validated['duration_seconds'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'difficulty_felt' => $validated['difficulty_felt'] ?? null,
            'completed' => $validated['completed'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Ejercicio registrado exitosamente');
    }

    /**
     * Obtener entrenamientos programados para hoy
     */
    public function getTodayWorkout(Request $request)
    {
        $user = $request->user();
        $today = now()->format('l'); // Monday, Tuesday, etc.

        $activePlans = WorkoutPlan::where('user_id', $user->id)
            ->where('is_active', true)
            ->with(['exercises' => function ($query) {
                $query->orderBy('order');
            }])
            ->get()
            ->filter(function ($plan) use ($today) {
                if (!$plan->schedule) {
                    return true; // Sin horario = entrenar todos los días
                }
                return $plan->schedule[strtolower($today)] ?? false;
            });

        return response()->json([
            'plans' => $activePlans,
        ]);
    }
}
