<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Mail\GoalAchievedMail;
use App\Models\FavoriteMeal;
use App\Models\MealRecord;
use App\Services\CloudinaryService;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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
        $date = $request->get('date', now()->toDateString());

        // Obtener registros del día seleccionado
        $todayRecords = MealRecord::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->orderBy('time', 'desc')
            ->get()
            ->map(function ($record) {
                // Si tiene image_path de Cloudinary, usar directamente
                // Si es una ruta local antigua, mantener compatibilidad
                if ($record->image_path) {
                    if (str_starts_with($record->image_path, 'http')) {
                        // Es una URL de Cloudinary
                        $record->image_url = $record->image_path;
                    } else {
                        // Es una ruta local antigua
                        $filename = basename($record->image_path);
                        $record->image_url = route('meal.image', ['filename' => $filename]);
                    }
                }

                return $record;
            });

        // Obtener perfil nutricional del usuario
        $profile = $user->profile;

        // Calcular totales del día seleccionado
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

        // Determinar próxima comida sugerida (según la fecha seleccionada y la hora actual)
        $currentHour = now()->hour;
        $nextMeal = $this->getNextMealSuggestion($currentHour, $todayRecords);

        // Obtener comidas favoritas del usuario
        $favoriteMeals = FavoriteMeal::where('user_id', $user->id)
            ->mostUsed()
            ->limit(10)
            ->get()
            ->map(function ($meal) {
                return [
                    'id' => $meal->id,
                    'name' => $meal->name,
                    'description' => $meal->description,
                    'calories' => (float) $meal->calories,
                    'protein' => (float) $meal->protein,
                    'carbs' => (float) $meal->carbs,
                    'fat' => (float) $meal->fat,
                    'fiber' => $meal->fiber ? (float) $meal->fiber : null,
                    'portion_size' => $meal->portion_size,
                    'meal_type' => $meal->meal_type,
                    'image_url' => $meal->image_url,
                    'times_used' => $meal->times_used,
                ];
            });

        $nutritionData = [
            'selected_date' => $date,
            'today_records' => $todayRecords,
            'today_totals' => $todayTotals,
            'goals' => $goals,
            'percentages' => $percentages,
            'next_meal' => $nextMeal,
            'favorite_meals' => $favoriteMeals,
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
        $imageUrl = null;
        $imagePublicId = null;
        $aiAnalysis = null;

        // Si hay imagen, subirla a Cloudinary y analizarla
        if ($request->hasFile('image')) {
            try {
                $cloudinaryService = app(CloudinaryService::class);
                $date = $validated['date'] ?? now()->toDateString();
                $uploadResult = $cloudinaryService->uploadNutritionImage(
                    $request->file('image'),
                    $user->id,
                    $date
                );
                
                $imageUrl = $uploadResult['secure_url'];
                $imagePublicId = $uploadResult['public_id'];

                // Analizar imagen con OpenAI si está configurado
                if (config('services.openai.api_key')) {
                    try {
                        $aiAnalysis = $this->analyzeImageWithAI($imageUrl);
                    } catch (\Exception $e) {
                        \Log::error('Error analyzing image with AI: '.$e->getMessage());
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Error uploading image to Cloudinary: '.$e->getMessage());
                return redirect()->route('nutrition')
                    ->withErrors(['image' => 'Error al subir la imagen. Por favor intenta nuevamente.']);
            }
        }

        // Crear el registro
        $mealData = [
            'user_id' => $user->id,
            'date' => $validated['date'] ?? now()->toDateString(),
            'meal_type' => $validated['meal_type'],
            'time' => $validated['time'] ?? now()->format('H:i'),
            'image_path' => $imageUrl, // Guardar URL de Cloudinary
            'image_public_id' => $imagePublicId, // Guardar public_id para poder eliminar después
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

        // Verificar si el usuario alcanzó sus objetivos del día
        $this->checkAndNotifyGoalAchievement($user, $mealData['date']);

        return redirect()->route('nutrition', ['date' => $mealData['date']]);
    }

    /**
     * Eliminar registro
     */
    public function destroy(Request $request, $id)
    {
        $record = MealRecord::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $date = $record->date?->toDateString() ?? now()->toDateString();

        // Eliminar imagen de Cloudinary si existe
        if ($record->image_public_id) {
            try {
                $cloudinaryService = app(CloudinaryService::class);
                $cloudinaryService->deleteImage($record->image_public_id);
            } catch (\Exception $e) {
                \Log::error('Error deleting image from Cloudinary: '.$e->getMessage());
            }
        } elseif ($record->image_path && !str_starts_with($record->image_path, 'http')) {
            // Eliminar imagen local antigua si existe
            Storage::disk('public')->delete($record->image_path);
        }

        $record->delete();

        return redirect()->route('nutrition', ['date' => $date]);
    }

    /**
     * Analizar imagen con OpenAI Vision API
     */
    private function analyzeImageWithAI(string $imageUrl): array
    {
        $client = OpenAI::client(config('services.openai.api_key'));

        // Si es una URL de Cloudinary, usarla directamente
        // Si es una ruta local, convertir a base64
        if (str_starts_with($imageUrl, 'http')) {
            // Es una URL de Cloudinary, usar directamente
            $imageUrlForAI = $imageUrl;
        } else {
            // Es una ruta local antigua, convertir a base64
            $imageContent = Storage::disk('public')->get($imageUrl);
            $base64Image = base64_encode($imageContent);
            $mimeType = Storage::disk('public')->mimeType($imageUrl);
            $imageUrlForAI = "data:{$mimeType};base64,{$base64Image}";
        }

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
                                'url' => $imageUrlForAI,
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

    /**
     * Verificar si el usuario alcanzó sus objetivos nutricionales del día y enviar email
     */
    private function checkAndNotifyGoalAchievement($user, $date)
    {
        // Obtener registros del día
        $todayRecords = MealRecord::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->get();

        // Calcular totales del día
        $totals = [
            'calories' => $todayRecords->sum('calories'),
            'protein' => $todayRecords->sum('protein'),
            'carbs' => $todayRecords->sum('carbs'),
            'fat' => $todayRecords->sum('fat'),
        ];

        // Obtener metas del perfil
        $profile = $user->profile;
        $goals = [
            'calories' => $profile?->daily_calorie_goal ?? 2000,
            'protein' => $profile?->protein_goal ?? 150,
            'carbs' => $profile?->carbs_goal ?? 200,
            'fat' => $profile?->fat_goal ?? 65,
        ];

        // Calcular porcentajes alcanzados
        $percentages = [
            'calories' => $goals['calories'] > 0 ? round(($totals['calories'] / $goals['calories']) * 100, 1) : 0,
            'protein' => $goals['protein'] > 0 ? round(($totals['protein'] / $goals['protein']) * 100, 1) : 0,
            'carbs' => $goals['carbs'] > 0 ? round(($totals['carbs'] / $goals['carbs']) * 100, 1) : 0,
            'fat' => $goals['fat'] > 0 ? round(($totals['fat'] / $goals['fat']) * 100, 1) : 0,
        ];

        // Verificar si se alcanzó el objetivo de calorías (entre 90% y 110%)
        $caloriesAchieved = $percentages['calories'] >= 90 && $percentages['calories'] <= 110;

        // Verificar si se alcanzaron al menos 2 de los 3 macronutrientes (entre 80% y 120%)
        $macrosAchieved = 0;
        if ($percentages['protein'] >= 80 && $percentages['protein'] <= 120) $macrosAchieved++;
        if ($percentages['carbs'] >= 80 && $percentages['carbs'] <= 120) $macrosAchieved++;
        if ($percentages['fat'] >= 80 && $percentages['fat'] <= 120) $macrosAchieved++;

        // Si alcanzó el objetivo de calorías Y al menos 2 macros, enviar email
        if ($caloriesAchieved && $macrosAchieved >= 2) {
            // Verificar si ya se envió un email de objetivo alcanzado hoy para evitar spam
            $cacheKey = "goal_achieved_email_sent_{$user->id}_{$date}";
            if (!\Cache::has($cacheKey)) {
                // Preparar datos del objetivo para el email
                $goalData = [
                    'type' => 'Objetivo Nutricional Diario',
                    'description' => 'Meta diaria de calorías y macronutrientes alcanzada',
                    'achieved_at' => now()->format('Y-m-d H:i:s'),
                ];

                $stats = [
                    'calories' => $totals['calories'],
                    'calories_goal' => $goals['calories'],
                    'calories_percentage' => $percentages['calories'],
                    'protein' => $totals['protein'],
                    'protein_goal' => $goals['protein'],
                    'carbs' => $totals['carbs'],
                    'carbs_goal' => $goals['carbs'],
                    'fat' => $totals['fat'],
                    'fat_goal' => $goals['fat'],
                ];

                $achievements = [
                    '✓ Meta de calorías alcanzada',
                    '✓ Balance de macronutrientes óptimo',
                    '✓ ' . $todayRecords->count() . ' comidas registradas',
                ];

                // Enviar email (COLA HIGH - motivacional urgente)
                try {
                    Mail::to($user->email)
                        ->queue(new GoalAchievedMail($user, $goalData, $stats, $achievements))
                        ->onQueue('high');
                    \Log::info('GoalAchievedMail queued on HIGH priority', [
                        'user_id' => $user->id,
                        'date' => $date,
                        'calories_percentage' => $percentages['calories'],
                    ]);

                    // Guardar en caché por 24 horas para evitar enviar múltiples veces
                    \Cache::put($cacheKey, true, now()->addDay());
                } catch (\Exception $e) {
                    \Log::error('Failed to queue GoalAchievedMail: ' . $e->getMessage(), [
                        'user_id' => $user->id,
                        'date' => $date,
                    ]);
                }
            }
        }
    }
}
