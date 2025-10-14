<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\UserExercise;
use App\Models\UserMuscleFatigue;
use App\Services\ExerciseApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExerciseController extends Controller
{
    private ExerciseApiService $exerciseApi;

    public function __construct(ExerciseApiService $exerciseApi)
    {
        $this->exerciseApi = $exerciseApi;
    }

    /**
     * Obtener recomendaciones de ejercicios basadas en calorías a quemar
     * y músculos descansados
     */
    public function recommendations(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'calories_to_burn' => 'required|integer|min:50|max:2000',
            'difficulty' => 'sometimes|in:beginner,intermediate,expert',
            'type' => 'sometimes|in:cardio,strength,olympic_weightlifting,plyometrics,powerlifting,stretching,strongman',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $caloriesToBurn = $request->input('calories_to_burn');
        $difficulty = $request->input('difficulty');
        $type = $request->input('type');

        // Obtener músculos descansados (>48 horas)
        $restedMuscles = UserMuscleFatigue::getRestedMuscles($user->id);

        // Si no hay registro de músculos trabajados, considerar todos descansados
        if ($restedMuscles->isEmpty()) {
            $restedMuscles = collect([
                'abdominals', 'biceps', 'chest', 'glutes', 'hamstrings',
                'lats', 'quadriceps', 'triceps', 'shoulders', 'calves'
            ]);
        }

        // Construir query de ejercicios
        $query = Exercise::query();

        // Filtrar por músculos descansados
        $query->whereIn('muscle', $restedMuscles);

        // Filtrar por dificultad si se especifica
        if ($difficulty) {
            $query->where('difficulty', $difficulty);
        }

        // Filtrar por tipo si se especifica
        if ($type) {
            $query->where('type', $type);
        }

        // Obtener ejercicios y calcular duración necesaria
        $exercises = $query->inRandomOrder()
            ->limit(10)
            ->get()
            ->map(function ($exercise) use ($caloriesToBurn) {
                $durationMinutes = ceil($caloriesToBurn / $exercise->calories_per_minute);

                return [
                    'id' => $exercise->id,
                    'name' => $exercise->name,
                    'type' => $exercise->type,
                    'muscle' => $exercise->muscle,
                    'equipment' => $exercise->equipment,
                    'difficulty' => $exercise->difficulty,
                    'instructions' => $exercise->instructions,
                    'image_url' => $exercise->image_url,
                    'calories_per_minute' => $exercise->calories_per_minute,
                    'recommended_duration_minutes' => $durationMinutes,
                    'estimated_calories_burned' => $exercise->estimateCalories($durationMinutes),
                    'muscle_is_rested' => true,
                ];
            });

        return response()->json([
            'calories_to_burn' => $caloriesToBurn,
            'rested_muscles' => $restedMuscles,
            'recommended_exercises' => $exercises,
            'total_exercises' => $exercises->count(),
        ]);
    }

    /**
     * Listar todos los ejercicios con filtros
     */
    public function index(Request $request)
    {
        $query = Exercise::query();

        if ($request->has('muscle')) {
            $query->where('muscle', $request->input('muscle'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        $perPage = $request->input('per_page', 15);
        $exercises = $query->paginate($perPage);

        return response()->json($exercises);
    }

    /**
     * Obtener detalles de un ejercicio específico
     */
    public function show(Exercise $exercise)
    {
        return response()->json($exercise);
    }

    /**
     * Registrar un ejercicio completado
     */
    public function logExercise(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exercise_id' => 'required|exists:exercises,id',
            'duration_minutes' => 'required|integer|min:1|max:300',
            'exercise_date' => 'sometimes|date',
            'notes' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $exercise = Exercise::findOrFail($request->input('exercise_id'));

        // Calcular calorías quemadas
        $durationMinutes = $request->input('duration_minutes');
        $caloriesBurned = $exercise->estimateCalories($durationMinutes);

        // Registrar ejercicio
        $userExercise = UserExercise::create([
            'user_id' => $user->id,
            'exercise_id' => $exercise->id,
            'exercise_date' => $request->input('exercise_date', now()->toDateString()),
            'duration_minutes' => $durationMinutes,
            'calories_burned' => $caloriesBurned,
            'notes' => $request->input('notes'),
        ]);

        // Actualizar fatiga muscular
        UserMuscleFatigue::recordWorkout($user->id, $exercise->muscle);

        return response()->json([
            'message' => 'Exercise logged successfully',
            'exercise' => $userExercise->load('exercise'),
            'calories_burned' => $caloriesBurned,
        ], 201);
    }

    /**
     * Obtener historial de ejercicios del usuario
     */
    public function history(Request $request)
    {
        $user = $request->user();

        $query = UserExercise::where('user_id', $user->id)
            ->with('exercise');

        if ($request->has('date')) {
            $query->whereDate('exercise_date', $request->input('date'));
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('exercise_date', [
                $request->input('from_date'),
                $request->input('to_date')
            ]);
        }

        $exercises = $query->orderBy('exercise_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($exercises);
    }

    /**
     * Obtener resumen de ejercicios (total calorías, tiempo, etc.)
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $date = $request->input('date', now()->toDateString());

        $dailyExercises = UserExercise::forUserOnDate($user->id, $date);
        $totalCalories = UserExercise::caloriesBurnedOnDate($user->id, $date);
        $totalMinutes = $dailyExercises->sum('duration_minutes');

        return response()->json([
            'date' => $date,
            'total_exercises' => $dailyExercises->count(),
            'total_calories_burned' => $totalCalories,
            'total_duration_minutes' => $totalMinutes,
            'exercises' => $dailyExercises,
        ]);
    }

    /**
     * Obtener estado de músculos (fatigados o descansados)
     */
    public function muscleStatus(Request $request)
    {
        $user = $request->user();

        $allMuscles = [
            'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
            'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
            'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
        ];

        $muscleFatigueRecords = UserMuscleFatigue::where('user_id', $user->id)->get();

        $muscleStatus = collect($allMuscles)->map(function ($muscle) use ($muscleFatigueRecords) {
            $record = $muscleFatigueRecords->firstWhere('muscle_group', $muscle);

            if (!$record) {
                return [
                    'muscle' => $muscle,
                    'status' => 'rested',
                    'days_since_worked' => null,
                    'last_worked_date' => null,
                ];
            }

            return [
                'muscle' => $muscle,
                'status' => $record->isRested() ? 'rested' : 'fatigued',
                'days_since_worked' => $record->getDaysSinceWorked(),
                'last_worked_date' => $record->last_worked_date->toDateString(),
                'intensity_level' => $record->intensity_level,
            ];
        });

        return response()->json([
            'muscle_status' => $muscleStatus,
            'rested_muscles' => $muscleStatus->where('status', 'rested')->pluck('muscle'),
            'fatigued_muscles' => $muscleStatus->where('status', 'fatigued')->pluck('muscle'),
        ]);
    }

    /**
     * Sincronizar ejercicios desde la API externa
     * (Solo para testing o mantenimiento)
     */
    public function syncFromApi(Request $request)
    {
        $muscle = $request->input('muscle');

        if ($muscle) {
            $exercises = $this->exerciseApi->syncExercisesForMuscle($muscle);
            return response()->json([
                'message' => "Synced exercises for muscle: {$muscle}",
                'count' => count($exercises),
            ]);
        }

        // Sincronizar todos (esto puede tomar tiempo)
        $totalSynced = $this->exerciseApi->syncAllExercises();

        return response()->json([
            'message' => 'All exercises synced successfully',
            'total_synced' => $totalSynced,
        ]);
    }

    /**
     * Obtener tipos de ejercicios disponibles
     */
    public function types()
    {
        return response()->json([
            'types' => [
                'cardio',
                'olympic_weightlifting',
                'plyometrics',
                'powerlifting',
                'strength',
                'stretching',
                'strongman',
            ]
        ]);
    }

    /**
     * Obtener grupos musculares disponibles
     */
    public function muscles()
    {
        return response()->json([
            'muscles' => [
                'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
                'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
                'lower_back', 'middle_back', 'neck', 'quadriceps', 'traps', 'triceps'
            ]
        ]);
    }

    /**
     * Obtener niveles de dificultad disponibles
     */
    public function difficulties()
    {
        return response()->json([
            'difficulties' => ['beginner', 'intermediate', 'expert']
        ]);
    }
}
