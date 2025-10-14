<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserContext;
use App\Models\NutritionalData;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class UserContextController extends Controller
{
    /**
     * Obtener contextos del usuario
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->contexts();

        if ($request->has('date')) {
            $query->forDate($request->input('date'));
        }

        if ($request->has('type')) {
            $query->ofType($request->input('type'));
        }

        $perPage = $request->get('per_page', 20);
        $contexts = $query->orderBy('date', 'desc')
                         ->orderBy('created_at', 'desc')
                         ->paginate($perPage);

        return response()->json([
            'message' => 'Contextos obtenidos exitosamente',
            'data' => $contexts
        ]);
    }

    /**
     * Crear un nuevo contexto
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'context_type' => 'required|in:stressful_day,weekend,illness,travel,social_event,work_pressure,emotional_state',
            'description' => 'nullable|string|max:500',
            'stress_level' => 'nullable|integer|min:1|max:10',
            'energy_level' => 'nullable|integer|min:1|max:10',
            'mood_level' => 'nullable|integer|min:1|max:10',
            'additional_data' => 'nullable|array',
            'affects_nutrition' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $context = auth()->user()->contexts()->create($request->all());

        return response()->json([
            'message' => 'Contexto creado exitosamente',
            'data' => $context
        ], 201);
    }

    /**
     * Actualizar un contexto
     */
    public function update(Request $request, UserContext $userContext): JsonResponse
    {
        if ($userContext->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'date',
            'context_type' => 'in:stressful_day,weekend,illness,travel,social_event,work_pressure,emotional_state',
            'description' => 'nullable|string|max:500',
            'stress_level' => 'nullable|integer|min:1|max:10',
            'energy_level' => 'nullable|integer|min:1|max:10',
            'mood_level' => 'nullable|integer|min:1|max:10',
            'additional_data' => 'nullable|array',
            'affects_nutrition' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userContext->update($request->all());

        return response()->json([
            'message' => 'Contexto actualizado exitosamente',
            'data' => $userContext
        ]);
    }

    /**
     * Eliminar un contexto
     */
    public function destroy(UserContext $userContext): JsonResponse
    {
        if ($userContext->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $userContext->delete();

        return response()->json([
            'message' => 'Contexto eliminado exitosamente'
        ]);
    }

    /**
     * Obtener tolerancia ajustada por contexto para una fecha específica
     */
    public function getAdjustedTolerance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $date = $request->input('date');

        // Buscar contextos activos para esa fecha
        $contexts = $user->contexts()
                        ->forDate($date)
                        ->where('affects_nutrition', true)
                        ->get();

        $baseTolerance = [
            'calories' => 100,
            'macros' => 15
        ];

        $adjustedTolerance = $baseTolerance;

        // Aplicar ajustes basados en contextos
        foreach ($contexts as $context) {
            $contextTolerance = $context->getAdjustedTolerance();
            
            // Tomar el ajuste más permisivo
            $adjustedTolerance['calories'] = max($adjustedTolerance['calories'], $contextTolerance['calories']);
            $adjustedTolerance['macros'] = max($adjustedTolerance['macros'], $contextTolerance['macros']);
        }

        return response()->json([
            'message' => 'Tolerancia ajustada obtenida exitosamente',
            'data' => [
                'date' => $date,
                'base_tolerance' => $baseTolerance,
                'adjusted_tolerance' => $adjustedTolerance,
                'active_contexts' => $contexts,
                'adjustment_factor' => [
                    'calories' => $adjustedTolerance['calories'] / $baseTolerance['calories'],
                    'macros' => $adjustedTolerance['macros'] / $baseTolerance['macros']
                ]
            ]
        ]);
    }

    /**
     * Evaluar adherencia con tolerancia ajustada por contexto
     */
    public function evaluateAdherenceWithContext(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $date = $request->input('date');
        $userProfile = $user->profile;

        if (!$userProfile) {
            return response()->json([
                'message' => 'Perfil de usuario no encontrado'
            ], 404);
        }

        // Obtener resumen nutricional del día
        $summary = NutritionalData::getDailySummary($user->id, $date);
        
        if (!$summary) {
            return response()->json([
                'message' => 'No hay datos nutricionales para esta fecha',
                'data' => null
            ], 404);
        }

        // Obtener tolerancia ajustada
        $toleranceResponse = $this->getAdjustedTolerance($request);
        $toleranceData = $toleranceResponse->getData()->data;
        $adjustedTolerance = $toleranceData->adjusted_tolerance;

        // Evaluar adherencia con tolerancia ajustada
        $evaluation = $this->evaluateAdherence($summary, $userProfile, $adjustedTolerance);

        return response()->json([
            'message' => 'Evaluación de adherencia con contexto completada',
            'data' => [
                'date' => $date,
                'summary' => $summary,
                'tolerance' => $adjustedTolerance,
                'evaluation' => $evaluation,
                'contexts' => $toleranceData->active_contexts
            ]
        ]);
    }

    /**
     * Obtener recomendaciones basadas en contexto
     */
    public function getContextualRecommendations(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $date = $request->input('date');

        $contexts = $user->contexts()
                        ->forDate($date)
                        ->get();

        $recommendations = [];

        foreach ($contexts as $context) {
            $recommendations[] = $this->getRecommendationsForContext($context);
        }

        return response()->json([
            'message' => 'Recomendaciones contextuales obtenidas exitosamente',
            'data' => [
                'date' => $date,
                'contexts' => $contexts,
                'recommendations' => $recommendations
            ]
        ]);
    }

    // Métodos privados

    private function evaluateAdherence($summary, $userProfile, $tolerance): array
    {
        $calorieDiff = abs($summary->total_calories - $userProfile->target_calories);
        $proteinDiff = abs($summary->total_protein - $userProfile->target_protein);
        $carbsDiff = abs($summary->total_carbs - $userProfile->target_carbs);
        $fatDiff = abs($summary->total_fat - $userProfile->target_fat);

        $calorieTolerance = $tolerance['calories'];
        $macroTolerance = $tolerance['macros'];

        $evaluation = [
            'calories' => 'red',
            'protein' => 'red',
            'carbs' => 'red',
            'fats' => 'red',
            'overall' => 'red',
            'message' => 'Significativamente fuera del rango objetivo'
        ];

        // Evaluar Calorías
        if ($calorieDiff <= $calorieTolerance) {
            $evaluation['calories'] = 'green';
        } elseif ($calorieDiff <= $calorieTolerance * 2) {
            $evaluation['calories'] = 'yellow';
        }

        // Evaluar Macronutrientes
        if ($proteinDiff <= $macroTolerance) {
            $evaluation['protein'] = 'green';
        } elseif ($proteinDiff <= $macroTolerance * 2) {
            $evaluation['protein'] = 'yellow';
        }

        if ($carbsDiff <= $macroTolerance) {
            $evaluation['carbs'] = 'green';
        } elseif ($carbsDiff <= $macroTolerance * 2) {
            $evaluation['carbs'] = 'yellow';
        }

        if ($fatDiff <= $macroTolerance) {
            $evaluation['fats'] = 'green';
        } elseif ($fatDiff <= $macroTolerance * 2) {
            $evaluation['fats'] = 'yellow';
        }

        // Evaluación general
        if ($evaluation['calories'] === 'green' && 
            $evaluation['protein'] === 'green' && 
            $evaluation['carbs'] === 'green' && 
            $evaluation['fats'] === 'green') {
            $evaluation['overall'] = 'green';
            $evaluation['message'] = 'Dentro del rango objetivo';
        } elseif (in_array('yellow', $evaluation) || in_array('green', $evaluation)) {
            $evaluation['overall'] = 'yellow';
            $evaluation['message'] = 'Ligeramente fuera del rango objetivo';
        }

        return $evaluation;
    }

    private function getRecommendationsForContext($context): array
    {
        $recommendations = [];

        switch ($context->context_type) {
            case 'stressful_day':
                $recommendations = [
                    'title' => 'Estrategias para Día Estresante',
                    'tips' => [
                        'Prioriza comidas simples y nutritivas',
                        'Evita decisiones complejas sobre comida',
                        'Mantén hidratación constante',
                        'Considera técnicas de relajación'
                    ],
                    'flexibility' => 'Aumenta tolerancia en ±150 kcal y ±20g macros'
                ];
                break;

            case 'weekend':
                $recommendations = [
                    'title' => 'Tips para Fin de Semana',
                    'tips' => [
                        'Disfruta con moderación',
                        'Mantén estructura básica de comidas',
                        'Compensa con actividad física',
                        'No te castigues por un día diferente'
                    ],
                    'flexibility' => 'Aumenta tolerancia en ±120 kcal y ±18g macros'
                ];
                break;

            case 'illness':
                $recommendations = [
                    'title' => 'Cuidados Durante Enfermedad',
                    'tips' => [
                        'Prioriza hidratación y descanso',
                        'Come cuando tengas apetito',
                        'No te preocupes por macros exactos',
                        'Enfócate en recuperación'
                    ],
                    'flexibility' => 'Aumenta tolerancia en ±200 kcal y ±30g macros'
                ];
                break;

            case 'travel':
                $recommendations = [
                    'title' => 'Consejos para Viajes',
                    'tips' => [
                        'Planifica comidas cuando sea posible',
                        'Lleva snacks saludables',
                        'Mantén hidratación en vuelos',
                        'Disfruta la experiencia gastronómica'
                    ],
                    'flexibility' => 'Aumenta tolerancia en ±180 kcal y ±25g macros'
                ];
                break;

            default:
                $recommendations = [
                    'title' => 'Recomendaciones Generales',
                    'tips' => [
                        'Mantén consistencia en tus hábitos',
                        'Escucha a tu cuerpo',
                        'Busca equilibrio'
                    ],
                    'flexibility' => 'Tolerancia estándar aplicada'
                ];
        }

        return array_merge($recommendations, [
            'context_type' => $context->context_type,
            'description' => $context->description
        ]);
    }
}