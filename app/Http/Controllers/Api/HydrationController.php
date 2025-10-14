<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HydrationRecord;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class HydrationController extends Controller
{
    /**
     * Obtener registros de hidratación
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->hydrationRecords();

        // Filtros
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 20);
        $records = $query->orderBy('date', 'desc')
                        ->orderBy('time', 'desc')
                        ->paginate($perPage);

        return response()->json([
            'message' => 'Registros de hidratación obtenidos exitosamente',
            'data' => $records
        ]);
    }

    /**
     * Crear un nuevo registro de hidratación
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount_ml' => 'required|integer|min:1|max:2000',
            'time' => 'required|date_format:H:i',
            'type' => 'required|string|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        $record = auth()->user()->hydrationRecords()->create($validated);

        return response()->json([
            'message' => 'Registro de hidratación creado exitosamente',
            'data' => $record
        ], 201);
    }

    /**
     * Obtener resumen diario de hidratación
     */
    public function dailySummary(Request $request): JsonResponse
    {
        $date = $request->get('date', Carbon::today()->toDateString());
        $user = auth()->user();
        $userProfile = $user->profile;

        $records = $user->hydrationRecords()
                       ->whereDate('date', $date)
                       ->orderBy('time', 'asc')
                       ->get();

        $totalAmount = $records->sum('amount_ml');
        $goal = $userProfile ? $userProfile->water_goal : 4000; // 4L por defecto
        $percentage = $goal > 0 ? round(($totalAmount / $goal) * 100, 1) : 0;

        // Generar recomendaciones
        $recommendations = $this->generateHydrationRecommendations($totalAmount, $goal, $records);

        return response()->json([
            'message' => 'Resumen de hidratación obtenido exitosamente',
            'data' => [
                'date' => $date,
                'records' => $records,
                'total_amount_ml' => $totalAmount,
                'goal_ml' => $goal,
                'percentage' => $percentage,
                'status' => $this->getHydrationStatus($percentage),
                'recommendations' => $recommendations
            ]
        ]);
    }

    /**
     * Obtener resumen semanal de hidratación
     */
    public function weeklySummary(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfWeek()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfWeek()->toDateString());
        $user = auth()->user();
        $userProfile = $user->profile;

        $weeklyData = [];
        $currentDate = Carbon::parse($startDate);

        while ($currentDate->lte(Carbon::parse($endDate))) {
            $dateStr = $currentDate->toDateString();
            $records = $user->hydrationRecords()
                           ->whereDate('date', $dateStr)
                           ->get();
            
            $totalAmount = $records->sum('amount_ml');
            $goal = $userProfile ? $userProfile->water_goal : 4000;
            $percentage = $goal > 0 ? round(($totalAmount / $goal) * 100, 1) : 0;

            $weeklyData[] = [
                'date' => $dateStr,
                'total_amount_ml' => $totalAmount,
                'goal_ml' => $goal,
                'percentage' => $percentage,
                'status' => $this->getHydrationStatus($percentage),
                'records_count' => $records->count()
            ];

            $currentDate->addDay();
        }

        // Calcular promedio semanal
        $weeklyAverage = collect($weeklyData)->avg('percentage');
        $weeklyTotal = collect($weeklyData)->sum('total_amount_ml');

        return response()->json([
            'message' => 'Resumen semanal de hidratación obtenido exitosamente',
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'weekly_data' => $weeklyData,
                'weekly_average' => round($weeklyAverage, 1),
                'weekly_total_ml' => $weeklyTotal,
                'overall_status' => $this->getHydrationStatus($weeklyAverage)
            ]
        ]);
    }

    /**
     * Actualizar un registro de hidratación
     */
    public function update(Request $request, HydrationRecord $hydrationRecord): JsonResponse
    {
        // Verificar que el registro pertenece al usuario autenticado
        if ($hydrationRecord->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'amount_ml' => 'sometimes|integer|min:1|max:2000',
            'time' => 'sometimes|date_format:H:i',
            'type' => 'sometimes|string|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        $hydrationRecord->update($validated);

        return response()->json([
            'message' => 'Registro de hidratación actualizado exitosamente',
            'data' => $hydrationRecord
        ]);
    }

    /**
     * Eliminar un registro de hidratación
     */
    public function destroy(HydrationRecord $hydrationRecord): JsonResponse
    {
        // Verificar que el registro pertenece al usuario autenticado
        if ($hydrationRecord->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $hydrationRecord->delete();

        return response()->json([
            'message' => 'Registro de hidratación eliminado exitosamente'
        ]);
    }

    /**
     * Obtener tipos de bebidas disponibles
     */
    public function drinkTypes(): JsonResponse
    {
        $types = [
            'water' => 'Agua',
            'tea' => 'Té',
            'coffee' => 'Café',
            'juice' => 'Jugo',
            'smoothie' => 'Batido',
            'sports_drink' => 'Bebida deportiva',
            'coconut_water' => 'Agua de coco',
            'herbal_tea' => 'Té de hierbas',
            'other' => 'Otro'
        ];

        return response()->json([
            'message' => 'Tipos de bebidas obtenidos exitosamente',
            'data' => $types
        ]);
    }

    // Métodos privados

    private function generateHydrationRecommendations(int $totalAmount, int $goal, $records): array
    {
        $recommendations = [];
        $percentage = $goal > 0 ? ($totalAmount / $goal) * 100 : 0;

        if ($percentage < 50) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Tu hidratación está muy baja. Intenta beber más agua durante el día.',
                'suggestion' => 'Establece recordatorios cada 2 horas para beber agua'
            ];
        } elseif ($percentage < 80) {
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Estás progresando bien con tu hidratación.',
                'suggestion' => 'Continúa bebiendo agua regularmente'
            ];
        } else {
            $recommendations[] = [
                'type' => 'success',
                'message' => '¡Excelente! Has cumplido tu meta de hidratación.',
                'suggestion' => 'Mantén este hábito consistente'
            ];
        }

        // Recomendación basada en la distribución
        if ($records->count() < 4) {
            $recommendations[] = [
                'type' => 'tip',
                'message' => 'Intenta distribuir tu hidratación a lo largo del día.',
                'suggestion' => 'Bebe pequeñas cantidades más frecuentemente'
            ];
        }

        return $recommendations;
    }

    private function getHydrationStatus(float $percentage): string
    {
        if ($percentage >= 100) {
            return 'excellent';
        } elseif ($percentage >= 80) {
            return 'good';
        } elseif ($percentage >= 60) {
            return 'fair';
        } elseif ($percentage >= 40) {
            return 'poor';
        } else {
            return 'critical';
        }
    }
}