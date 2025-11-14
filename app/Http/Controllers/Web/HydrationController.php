<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\HydrationRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HydrationController extends Controller
{
    /**
     * Mostrar la vista de hidratación
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = now()->toDateString();

        // Obtener registros de hoy
        $todayRecords = HydrationRecord::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->orderBy('time', 'desc')
            ->get();

        // Obtener meta de agua del perfil
        $waterGoal = $user->profile?->water_goal ?? 4000;

        // Calcular total del día
        $totalMl = $todayRecords->sum('amount_ml');
        $percentage = $waterGoal > 0 ? min(round(($totalMl / $waterGoal) * 100), 100) : 0;

        // Determinar estado
        $status = 'critical';
        if ($percentage >= 100) {
            $status = 'excellent';
        } elseif ($percentage >= 80) {
            $status = 'good';
        } elseif ($percentage >= 60) {
            $status = 'fair';
        } elseif ($percentage >= 40) {
            $status = 'poor';
        }

        $hydrationData = [
            'today_records' => $todayRecords,
            'today_summary' => [
                'total_ml' => $totalMl,
                'goal_ml' => $waterGoal,
                'percentage' => $percentage,
                'status' => $status,
            ],
            'drink_types' => ['water', 'tea', 'coffee', 'juice', 'smoothie', 'sports_drink', 'coconut_water', 'herbal_tea', 'other'],
        ];

        return Inertia::render('hydration', [
            'hydrationData' => $hydrationData,
        ]);
    }

    /**
     * Registrar nuevo consumo de agua
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount_ml' => 'required|integer|min:1|max:2000',
            'type' => 'required|string|in:water,tea,coffee,juice,smoothie,sports_drink,coconut_water,herbal_tea,other',
            'time' => 'nullable|string',
            'date' => 'nullable|date',
        ]);

        $user = $request->user();

        HydrationRecord::create([
            'user_id' => $user->id,
            'date' => $validated['date'] ?? now()->toDateString(),
            'amount_ml' => $validated['amount_ml'],
            'type' => $validated['type'],
            'time' => $validated['time'] ?? now()->format('H:i'),
        ]);

        return redirect()->route('hydration');
    }

    /**
     * Eliminar registro
     */
    public function destroy(Request $request, $id)
    {
        $record = HydrationRecord::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $record->delete();

        return redirect()->route('hydration');
    }
}
