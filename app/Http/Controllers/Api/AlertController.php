<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAlert;
use App\Models\UserProfile;
use App\Models\NutritionalData;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AlertController extends Controller
{
    /**
     * Obtener alertas activas del usuario
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->alerts()->active();

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('severity')) {
            $query->bySeverity($request->severity);
        }

        $perPage = $request->get('per_page', 20);
        $alerts = $query->orderBy('severity', 'desc')
                       ->orderBy('created_at', 'desc')
                       ->paginate($perPage);

        return response()->json([
            'message' => 'Alertas obtenidas exitosamente',
            'data' => $alerts
        ]);
    }

    /**
     * Desestimar una alerta
     */
    public function dismiss(UserAlert $userAlert): JsonResponse
    {
        if ($userAlert->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $userAlert->dismiss();

        return response()->json([
            'message' => 'Alerta desestimada exitosamente'
        ]);
    }

    /**
     * Verificar y generar alertas automáticas
     */
    public function checkAndGenerateAlerts(): JsonResponse
    {
        $user = auth()->user();
        $userProfile = $user->profile;
        
        if (!$userProfile) {
            return response()->json([
                'message' => 'Perfil de usuario no encontrado'
            ], 404);
        }

        $alerts = [];

        // Verificar pérdida de peso acelerada
        $rapidWeightLossAlert = $this->checkRapidWeightLoss($user, $userProfile);
        if ($rapidWeightLossAlert) {
            $alerts[] = $rapidWeightLossAlert;
        }

        // Verificar adherencia baja
        $lowAdherenceAlert = $this->checkLowAdherence($user, $userProfile);
        if ($lowAdherenceAlert) {
            $alerts[] = $lowAdherenceAlert;
        }

        // Verificar hidratación baja
        $hydrationAlert = $this->checkLowHydration($user, $userProfile);
        if ($hydrationAlert) {
            $alerts[] = $hydrationAlert;
        }

        // Verificar comportamientos obsesivos
        $obsessiveBehaviorAlert = $this->checkObsessiveBehavior($user, $userProfile);
        if ($obsessiveBehaviorAlert) {
            $alerts[] = $obsessiveBehaviorAlert;
        }

        return response()->json([
            'message' => 'Verificación de alertas completada',
            'data' => [
                'alerts_generated' => count($alerts),
                'alerts' => $alerts
            ]
        ]);
    }

    /**
     * Obtener disclaimer médico
     */
    public function getMedicalDisclaimer(): JsonResponse
    {
        $disclaimer = "IMPORTANTE: Este sistema de apoyo educativo NO reemplaza la supervisión médica profesional. 

Siempre se recomienda consultar con nutricionistas, médicos y entrenadores certificados antes de seguir cualquier plan nutricional o de suplementación.

El sistema está diseñado para acompañar tu proceso de transformación corporal de manera saludable y sostenible, pero no debe ser el único recurso para decisiones médicas importantes.

Si experimentas síntomas inusuales, cambios drásticos en tu salud, o tienes dudas sobre tu plan nutricional, consulta inmediatamente con un profesional de la salud.";

        return response()->json([
            'message' => 'Disclaimer médico obtenido exitosamente',
            'data' => [
                'disclaimer_text' => $disclaimer,
                'version' => '1.0',
                'required' => true
            ]
        ]);
    }

    /**
     * Aceptar disclaimer médico
     */
    public function acceptMedicalDisclaimer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'disclaimer_text' => 'required|string',
            'version' => 'required|string'
        ]);

        $user = auth()->user();

        $disclaimer = $user->medicalDisclaimers()->create([
            'disclaimer_text' => $validated['disclaimer_text'],
            'version' => $validated['version'],
            'is_accepted' => true,
            'accepted_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'message' => 'Disclaimer médico aceptado exitosamente',
            'data' => $disclaimer
        ], 201);
    }

    // Métodos privados para verificar alertas

    private function checkRapidWeightLoss($user, $userProfile): ?UserAlert
    {
        // Verificar pérdida de peso en los últimos 7 días
        $weekAgo = Carbon::now()->subWeek();
        
        // Aquí necesitarías un sistema de seguimiento de peso
        // Por ahora, simularemos la verificación
        
        $weightLossRate = 0; // kg por semana
        
        if ($weightLossRate > 1.5) { // Más de 1.5kg por semana es peligroso
            return UserAlert::create([
                'user_id' => $user->id,
                'type' => 'rapid_weight_loss',
                'title' => 'Pérdida de Peso Acelerada Detectada',
                'message' => 'Has perdido peso a un ritmo acelerado. Es importante consultar con un médico para asegurar que el proceso sea saludable.',
                'data' => [
                    'weight_loss_rate' => $weightLossRate,
                    'recommendation' => 'Consulta médica recomendada'
                ],
                'severity' => 'danger',
                'expires_at' => now()->addDays(7)
            ]);
        }

        return null;
    }

    private function checkLowAdherence($user, $userProfile): ?UserAlert
    {
        // Verificar adherencia en los últimos 3 días
        $threeDaysAgo = Carbon::now()->subDays(3);
        $today = Carbon::today();

        $lowAdherenceDays = 0;
        $currentDate = $threeDaysAgo->copy();

        while ($currentDate->lte($today)) {
            $summary = NutritionalData::getDailySummary($user->id, $currentDate->toDateString());
            
            if ($summary) {
                $adherence = $this->evaluateAdherence($summary, $userProfile);
                if ($adherence['status'] === 'red') {
                    $lowAdherenceDays++;
                }
            }

            $currentDate->addDay();
        }

        if ($lowAdherenceDays >= 2) {
            return UserAlert::create([
                'user_id' => $user->id,
                'type' => 'low_adherence',
                'title' => 'Adherencia Baja Detectada',
                'message' => 'Has tenido dificultades para mantener tu plan nutricional. Recuerda que el 80% de adherencia es más sostenible que el 100%.',
                'data' => [
                    'low_adherence_days' => $lowAdherenceDays,
                    'recommendation' => 'Considera ajustar tus objetivos o buscar apoyo adicional'
                ],
                'severity' => 'warning',
                'expires_at' => now()->addDays(3)
            ]);
        }

        return null;
    }

    private function checkLowHydration($user, $userProfile): ?UserAlert
    {
        $today = Carbon::today();
        $hydrationSummary = $user->hydrationRecords()
                                ->whereDate('date', $today)
                                ->sum('amount_ml');

        $goal = $userProfile ? $userProfile->water_goal : 4000;
        $percentage = $goal > 0 ? ($hydrationSummary / $goal) * 100 : 0;

        if ($percentage < 50) {
            return UserAlert::create([
                'user_id' => $user->id,
                'type' => 'hydration_reminder',
                'title' => 'Recordatorio de Hidratación',
                'message' => 'Tu hidratación está por debajo del 50% de tu meta diaria. Recuerda beber agua regularmente.',
                'data' => [
                    'current_ml' => $hydrationSummary,
                    'goal_ml' => $goal,
                    'percentage' => $percentage
                ],
                'severity' => 'info',
                'expires_at' => now()->addHours(2)
            ]);
        }

        return null;
    }

    private function checkObsessiveBehavior($user, $userProfile): ?UserAlert
    {
        // Verificar patrones obsesivos (múltiples registros en poco tiempo, conteo excesivo, etc.)
        $today = Carbon::today();
        
        $nutritionalEntries = $user->nutritionalData()
                                  ->whereDate('consumption_date', $today)
                                  ->count();

        if ($nutritionalEntries > 15) { // Más de 15 entradas en un día puede ser obsesivo
            return UserAlert::create([
                'user_id' => $user->id,
                'type' => 'safety_warning',
                'title' => 'Patrón de Registro Excesivo',
                'message' => 'Has registrado muchas comidas hoy. Recuerda que la flexibilidad es clave para la adherencia a largo plazo.',
                'data' => [
                    'entries_count' => $nutritionalEntries,
                    'recommendation' => 'Considera relajar el seguimiento y enfocarte en la consistencia general'
                ],
                'severity' => 'warning',
                'expires_at' => now()->addDays(1)
            ]);
        }

        return null;
    }

    private function evaluateAdherence($summary, $userProfile): array
    {
        $calorieDiff = abs($summary->total_calories - $userProfile->daily_calorie_goal);
        $proteinDiff = abs($summary->total_protein - $userProfile->protein_goal);
        $carbsDiff = abs($summary->total_carbs - $userProfile->carbs_goal);
        $fatDiff = abs($summary->total_fat - $userProfile->fat_goal);

        $calorieTolerance = 100;
        $macroTolerance = 15;

        if ($calorieDiff <= $calorieTolerance && 
            $proteinDiff <= $macroTolerance && 
            $carbsDiff <= $macroTolerance && 
            $fatDiff <= $macroTolerance) {
            return ['status' => 'green', 'message' => 'Dentro del rango objetivo'];
        } elseif ($calorieDiff <= 200 && 
                  $proteinDiff <= 25 && 
                  $carbsDiff <= 25 && 
                  $fatDiff <= 25) {
            return ['status' => 'yellow', 'message' => 'Ligeramente fuera del rango'];
        } else {
            return ['status' => 'red', 'message' => 'Significativamente fuera del rango'];
        }
    }
}