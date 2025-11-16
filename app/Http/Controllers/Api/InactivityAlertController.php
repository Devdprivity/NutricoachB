<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InactivityAlert;
use App\Services\InactivityDetectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InactivityAlertController extends Controller
{
    private InactivityDetectionService $inactivityService;

    public function __construct(InactivityDetectionService $inactivityService)
    {
        $this->inactivityService = $inactivityService;
    }

    /**
     * Obtener todas las alertas no resueltas del usuario autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $alerts = InactivityAlert::where('user_id', $user->id)
            ->unresolved()
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'summary' => [
                'total' => $alerts->count(),
                'critical' => $alerts->where('severity', InactivityAlert::SEVERITY_CRITICAL)->count(),
                'warning' => $alerts->where('severity', InactivityAlert::SEVERITY_WARNING)->count(),
                'info' => $alerts->where('severity', InactivityAlert::SEVERITY_INFO)->count(),
            ],
        ]);
    }

    /**
     * Obtener alertas por tipo
     */
    public function byType(Request $request, string $type): JsonResponse
    {
        $user = $request->user();

        $alerts = InactivityAlert::where('user_id', $user->id)
            ->where('type', $type)
            ->unresolved()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }

    /**
     * Obtener alertas por severidad
     */
    public function bySeverity(Request $request, string $severity): JsonResponse
    {
        $user = $request->user();

        $alerts = InactivityAlert::where('user_id', $user->id)
            ->where('severity', $severity)
            ->unresolved()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }

    /**
     * Obtener una alerta específica
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $alert = InactivityAlert::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alerta no encontrada',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $alert,
        ]);
    }

    /**
     * Resolver una alerta específica
     */
    public function resolve(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $alert = InactivityAlert::where('user_id', $user->id)
            ->where('id', $id)
            ->where('is_resolved', false)
            ->first();

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alerta no encontrada o ya resuelta',
            ], 404);
        }

        $alert->resolve();

        return response()->json([
            'success' => true,
            'message' => 'Alerta marcada como resuelta',
            'data' => $alert,
        ]);
    }

    /**
     * Resolver todas las alertas del usuario
     */
    public function resolveAll(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->inactivityService->resolveAllAlertsForUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Todas las alertas han sido resueltas',
        ]);
    }

    /**
     * Resolver alertas por tipo
     */
    public function resolveByType(Request $request, string $type): JsonResponse
    {
        $user = $request->user();

        $this->inactivityService->resolveAlertsForUser($user, $type);

        return response()->json([
            'success' => true,
            'message' => "Alertas de tipo {$type} resueltas",
        ]);
    }

    /**
     * Obtener estadísticas de alertas del usuario
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalAlerts = InactivityAlert::where('user_id', $user->id)->count();
        $unresolvedAlerts = InactivityAlert::where('user_id', $user->id)
            ->where('is_resolved', false)
            ->count();
        $resolvedAlerts = InactivityAlert::where('user_id', $user->id)
            ->where('is_resolved', true)
            ->count();

        $alertsByType = InactivityAlert::where('user_id', $user->id)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type');

        $alertsBySeverity = InactivityAlert::where('user_id', $user->id)
            ->where('is_resolved', false)
            ->selectRaw('severity, COUNT(*) as count')
            ->groupBy('severity')
            ->get()
            ->pluck('count', 'severity');

        return response()->json([
            'success' => true,
            'data' => [
                'total_alerts' => $totalAlerts,
                'unresolved_alerts' => $unresolvedAlerts,
                'resolved_alerts' => $resolvedAlerts,
                'alerts_by_type' => $alertsByType,
                'alerts_by_severity' => $alertsBySeverity,
            ],
        ]);
    }

    /**
     * Verificar inactividad del usuario actual manualmente
     */
    public function checkInactivity(Request $request): JsonResponse
    {
        $user = $request->user();

        $alerts = $this->inactivityService->detectInactivityForUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Verificación de inactividad completada',
            'alerts_detected' => count($alerts),
            'data' => $alerts,
        ]);
    }

    /**
     * Obtener historial de alertas (incluyendo resueltas)
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        $alerts = InactivityAlert::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }
}
