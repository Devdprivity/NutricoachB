<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MealRecord;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use OpenAI;

class NutritionController extends Controller
{
    /**
     * Mostrar la vista de nutrición
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = now()->toDateString();

        // Obtener registros de hoy
        $todayRecords = MealRecord::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->orderBy('time', 'desc')
            ->get()
            ->map(function ($record) {
                // Convertir image_path a URL completa
                if ($record->image_path) {
                    $filename = basename($record->image_path);
                    $record->image_url = route('meal.image', ['filename' => $filename]);
                }

                return $record;
            });

        // Obtener perfil nutricional del usuario
        $profile = $user->profile;

        // Calcular totales del día
        $todayTotals = [
            'calories' => $todayRecords->sum('calories'),
            'protein' => $todayRecords->sum('protein'),
            'carbs' => $todayRecords->sum('carbs'),
            'fat' => $todayRecords->sum('fat'),
            'fiber' => $todayRecords->sum('fiber'),
        ];

        // Obtener metas del perfil
        $goals = [
            'calories' => $profile?->daily_calorie_goal ?? 2000,
            'protein' => $profile?->protein_goal ?? 150,
            'carbs' => $profile?->carbs_goal ?? 200,
            'fat' => $profile?->fat_goal ?? 65,
        ];

        // Calcular porcentajes
        $percentages = [
            'calories' => $goals['calories'] > 0 ? round(($todayTotals['calories'] / $goals['calories']) * 100, 1) : 0,
            'protein' => $goals['protein'] > 0 ? round(($todayTotals['protein'] / $goals['protein']) * 100, 1) : 0,
            'carbs' => $goals['carbs'] > 0 ? round(($todayTotals['carbs'] / $goals['carbs']) * 100, 1) : 0,
            'fat' => $goals['fat'] > 0 ? round(($todayTotals['fat'] / $goals['fat']) * 100, 1) : 0,
        ];

        // Determinar próxima comida sugerida
        $currentHour = now()->hour;
        $nextMeal = $this->getNextMealSuggestion($currentHour, $todayRecords);

        $nutritionData = [
            'today_records' => $todayRecords,
            'today_totals' => $todayTotals,
            'goals' => $goals,
            'percentages' => $percentages,
            'next_meal' => $nextMeal,
        ];

        return Inertia::render('nutrition', [
            'nutritionData' => $nutritionData,
        ]);
    }

    /**
     * Registrar nuevo consumo de comida
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'nullable|image|max:10240', // 10MB max
            'meal_type' => 'required|string|in:breakfast,morning_snack,lunch,afternoon_snack,dinner,evening_snack,other',
            'time' => 'nullable|string',
            'date' => 'nullable|date',
            'calories' => 'nullable|numeric|min:0',
            'protein' => 'nullable|numeric|min:0',
            'carbs' => 'nullable|numeric|min:0',
            'fat' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $imagePath = null;
        $aiAnalysis = null;

        // Si hay imagen, subirla y analizarla
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('meals', 'public');

            // Analizar imagen con OpenAI si está configurado
            if (config('services.openai.api_key')) {
                try {
                    $aiAnalysis = $this->analyzeImageWithAI($imagePath);
                } catch (\Exception $e) {
                    logger()->error('Error analyzing image with AI: '.$e->getMessage());
                }
            }
        }

        // Crear el registro
        $mealData = [
            'user_id' => $user->id,
            'date' => $validated['date'] ?? now()->toDateString(),
            'meal_type' => $validated['meal_type'],
            'time' => $validated['time'] ?? now()->format('H:i'),
            'image_path' => $imagePath,
            'notes' => $validated['notes'] ?? null,
        ];

        // Si hay análisis de IA, usar esos valores; de lo contrario, usar los proporcionados
        if ($aiAnalysis) {
            $mealData['calories'] = $aiAnalysis['calories'];
            $mealData['protein'] = $aiAnalysis['protein'];
            $mealData['carbs'] = $aiAnalysis['carbs'];
            $mealData['fat'] = $aiAnalysis['fat'];
            $mealData['fiber'] = $aiAnalysis['fiber'] ?? null;
            $mealData['food_items'] = $aiAnalysis['food_items'];
            $mealData['ai_description'] = $aiAnalysis['description'];
            $mealData['ai_analyzed'] = true;
        } else {
            $mealData['calories'] = $validated['calories'] ?? 0;
            $mealData['protein'] = $validated['protein'] ?? 0;
            $mealData['carbs'] = $validated['carbs'] ?? 0;
            $mealData['fat'] = $validated['fat'] ?? 0;
            $mealData['ai_analyzed'] = false;
        }

        MealRecord::create($mealData);

        // Registrar actividad en gamificación
        app(GamificationService::class)->logMealActivity($user);

        return redirect()->route('nutrition');
    }

    /**
     * Eliminar registro
     */
    public function destroy(Request $request, $id)
    {
        $record = MealRecord::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Eliminar imagen si existe
        if ($record->image_path) {
            Storage::disk('public')->delete($record->image_path);
        }

        $record->delete();

        return redirect()->route('nutrition');
    }

    /**
     * Analizar imagen con OpenAI Vision API
     */
    private function analyzeImageWithAI(string $imagePath): array
    {
        $client = OpenAI::client(config('services.openai.api_key'));

        // Convertir imagen a base64
        $imageContent = Storage::disk('public')->get($imagePath);
        $base64Image = base64_encode($imageContent);
        $mimeType = Storage::disk('public')->mimeType($imagePath);

        $response = $client->chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Analiza esta imagen de comida y proporciona la siguiente información en formato JSON:
{
  "food_items": "lista de alimentos identificados separados por comas",
  "description": "descripción breve de la comida",
  "calories": número estimado de calorías totales,
  "protein": gramos de proteína,
  "carbs": gramos de carbohidratos,
  "fat": gramos de grasa,
  "fiber": gramos de fibra (opcional)
}
Sé preciso y realista en las estimaciones. Responde SOLO con el JSON, sin texto adicional.',
                        ],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:{$mimeType};base64,{$base64Image}",
                            ],
                        ],
                    ],
                ],
            ],
            'max_tokens' => 500,
        ]);

        $content = $response->choices[0]->message->content;

        // Extraer JSON de la respuesta
        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');

        if ($jsonStart !== false && $jsonEnd !== false) {
            $jsonString = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
            $data = json_decode($jsonString, true);

            if ($data) {
                return $data;
            }
        }

        throw new \Exception('No se pudo parsear la respuesta de OpenAI');
    }

    /**
     * Obtener sugerencia de próxima comida
     */
    private function getNextMealSuggestion(int $currentHour, $todayRecords): ?array
    {
        $mealTimes = [
            ['type' => 'breakfast', 'label' => 'Desayuno', 'hour' => 7],
            ['type' => 'morning_snack', 'label' => 'Colación Matutina', 'hour' => 10],
            ['type' => 'lunch', 'label' => 'Almuerzo', 'hour' => 13],
            ['type' => 'afternoon_snack', 'label' => 'Colación Vespertina', 'hour' => 16],
            ['type' => 'dinner', 'label' => 'Cena', 'hour' => 19],
            ['type' => 'evening_snack', 'label' => 'Colación Nocturna', 'hour' => 21],
        ];

        $recordedMealTypes = $todayRecords->pluck('meal_type')->toArray();

        foreach ($mealTimes as $meal) {
            if ($currentHour <= $meal['hour'] && ! in_array($meal['type'], $recordedMealTypes)) {
                return [
                    'type' => $meal['type'],
                    'label' => $meal['label'],
                    'hour' => $meal['hour'],
                ];
            }
        }

        return null;
    }
}
