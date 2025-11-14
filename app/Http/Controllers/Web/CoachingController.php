<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\CoachingConversation;
use App\Services\CoachingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoachingController extends Controller
{
    protected CoachingService $coachingService;

    public function __construct(CoachingService $coachingService)
    {
        $this->coachingService = $coachingService;
    }

    /**
     * Mostrar la vista de coaching
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Obtener resumen del contexto
        $contextSummary = $this->coachingService->getContextSummary($user);

        // Obtener historial de conversación
        $conversations = CoachingConversation::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($msg) => [
                'id' => $msg->id,
                'role' => $msg->role,
                'message' => $msg->message,
                'created_at' => $msg->created_at->format('H:i'),
            ]);

        return Inertia::render('coaching', [
            'contextSummary' => $contextSummary,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Enviar mensaje al coach IA
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $user = $request->user();

        // Generar respuesta del coach
        $response = $this->coachingService->generateCoachingResponse(
            $user,
            $validated['message']
        );

        if ($response['success']) {
            return redirect()->route('coaching');
        } else {
            return back()->withErrors(['message' => $response['message']]);
        }
    }

    /**
     * Limpiar historial de conversación
     */
    public function clearHistory(Request $request)
    {
        $user = $request->user();

        CoachingConversation::where('user_id', $user->id)->delete();

        return redirect()->route('coaching');
    }
}
