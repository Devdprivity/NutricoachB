<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\ExerciseLog;
use App\Models\MealRecord;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExercisesController extends Controller
{
    /**
     * Mostrar la vista de ejercicios
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = now()->toDateString();

        // Obtener registros de comidas de hoy
        $todayMeals = MealRecord::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->get();

        // Obtener ejercicios realizados hoy
        $todayExercises = ExerciseLog::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->with('exercise')
            ->get();

        // Calcular balance calórico
        $caloriesConsumed = $todayMeals->sum('calories');
        $caloriesBurned = $todayExercises->sum('calories_burned');
        $calorieGoal = $user->profile?->daily_calorie_goal ?? 2000;

        // Calcular calorías netas y recomendar ejercicios
        $netCalories = $caloriesConsumed - $caloriesBurned;
        $caloriesOverGoal = max(0, $netCalories - $calorieGoal);

        // Obtener ejercicios desde la base de datos local (ya no usamos API)
        $exercises = Exercise::all()->map(function ($exercise) {
            return [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'body_part' => $exercise->body_part,
                'equipment' => $exercise->equipment,
                'target' => $exercise->target,
                'category' => $exercise->category,
                'difficulty' => $exercise->difficulty,
                'gif_url' => $exercise->gif_url,
                'instructions' => $exercise->instructions,
            ];
        });

        // Generar recomendaciones personalizadas
        $recommendations = $this->generateRecommendations(
            $caloriesOverGoal,
            $user->profile?->activity_level ?? 'sedentary',
            $exercises
        );

        $exerciseData = [
            'exercises' => $exercises->values()->all(),
            'today_logs' => $todayExercises->map(function ($log) {
                return [
                    'id' => $log->id,
                    'exercise' => [
                        'id' => $log->exercise->id,
                        'name' => $log->exercise->name,
                        'image_url' => $log->exercise->image_url,
                    ],
                    'duration_minutes' => $log->duration_minutes,
                    'calories_burned' => $log->calories_burned,
                    'intensity' => $log->intensity,
                    'status' => $log->status,
                    'start_time' => $log->start_time,
                    'notes' => $log->notes,
                ];
            }),
            'calorie_balance' => [
                'consumed' => round($caloriesConsumed, 2),
                'burned' => round($caloriesBurned, 2),
                'net' => round($netCalories, 2),
                'goal' => $calorieGoal,
                'over_goal' => round($caloriesOverGoal, 2),
            ],
            'recommendations' => $recommendations,
        ];

        return Inertia::render('exercises', [
            'exerciseData' => $exerciseData,
        ]);
    }

    /**
     * Generar recomendaciones de ejercicios basadas en balance calórico
     */
    private function generateRecommendations(float $caloriesOverGoal, string $activityLevel, $exercises)
    {
        $recommendations = [];

        if ($caloriesOverGoal > 0) {
            // Si hay calorías de más, recomendar ejercicios para quemarlas
            $minutesNeeded = ceil($caloriesOverGoal / 10); // Promedio 10 cal/min

            $recommendations[] = [
                'type' => 'calorie_burn',
                'message' => "Has consumido {$caloriesOverGoal} calorías por encima de tu meta. Te recomendamos ejercicios para balancear:",
                'minutes_needed' => $minutesNeeded,
                'exercises' => $exercises->filter(function ($ex) {
                    return $ex['category'] === 'cardio' && $ex['difficulty'] === 'beginner';
                })->take(3)->values(),
            ];
        }

        // Recomendar según nivel de actividad
        switch ($activityLevel) {
            case 'sedentary':
                $recommendations[] = [
                    'type' => 'activity_level',
                    'message' => 'Como tienes un nivel de actividad sedentario, estos ejercicios suaves son perfectos para comenzar:',
                    'exercises' => $exercises->filter(function ($ex) {
                        return $ex['difficulty'] === 'beginner' && in_array($ex['category'], ['flexibility', 'balance']);
                    })->take(3)->values(),
                ];
                break;

            case 'light':
            case 'moderate':
                $recommendations[] = [
                    'type' => 'activity_level',
                    'message' => 'Basado en tu nivel de actividad, estos ejercicios te ayudarán a seguir progresando:',
                    'exercises' => $exercises->filter(function ($ex) {
                        return in_array($ex['difficulty'], ['beginner', 'intermediate']) && $ex['category'] === 'strength';
                    })->take(3)->values(),
                ];
                break;

            case 'active':
            case 'very_active':
                $recommendations[] = [
                    'type' => 'activity_level',
                    'message' => 'Para mantener tu alto nivel de actividad, prueba estos desafíos:',
                    'exercises' => $exercises->filter(function ($ex) {
                        return in_array($ex['difficulty'], ['intermediate', 'advanced']);
                    })->take(3)->values(),
                ];
                break;
        }

        // Recomendación general de variedad
        $recommendations[] = [
            'type' => 'variety',
            'message' => 'Para un entrenamiento completo, incluye ejercicios de diferentes categorías:',
            'exercises' => $exercises->groupBy('category')->map(function ($group) {
                return $group->first();
            })->take(5)->values(),
        ];

        return $recommendations;
    }

    /**
     * Registrar inicio de ejercicio
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exercise_id' => 'required|exists:exercises,id',
            'duration_minutes' => 'required|integer|min:1',
            'intensity' => 'nullable|integer|min:1|max:10',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $exercise = Exercise::findOrFail($validated['exercise_id']);

        // Calcular calorías quemadas
        $caloriesBurned = $exercise->calories_per_minute * $validated['duration_minutes'];

        ExerciseLog::create([
            'user_id' => $user->id,
            'exercise_id' => $validated['exercise_id'],
            'date' => now()->toDateString(),
            'start_time' => now()->format('H:i'),
            'duration_minutes' => $validated['duration_minutes'],
            'calories_burned' => $caloriesBurned,
            'intensity' => $validated['intensity'] ?? 5,
            'notes' => $validated['notes'] ?? null,
            'status' => 'completed',
        ]);

        // Registrar actividad en gamificación
        app(GamificationService::class)->logExerciseActivity($user);

        return redirect()->route('exercises');
    }

    /**
     * Eliminar registro de ejercicio
     */
    public function destroy(Request $request, $id)
    {
        $log = ExerciseLog::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $log->delete();

        return redirect()->route('exercises');
    }
}
