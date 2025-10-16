<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CoachingController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\FoodItemController;
use App\Http\Controllers\Api\HydrationController;
use App\Http\Controllers\Api\MealPlanController;
use App\Http\Controllers\Api\NutritionalDataController;
use App\Http\Controllers\Api\UserContextController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Logout para app móvil
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    // Revocar el token actual
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
});

// Rutas protegidas por autenticación
Route::middleware('auth:sanctum')->group(function () {
    
    // Rutas de perfil de usuario
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserProfileController::class, 'show']);
        Route::post('/', [UserProfileController::class, 'store']);
        Route::put('/', [UserProfileController::class, 'update']);
    });

    // Rutas de datos nutricionales
    Route::prefix('nutrition')->group(function () {
        Route::get('/', [NutritionalDataController::class, 'index']);
        Route::post('/', [NutritionalDataController::class, 'store']);
        Route::get('/daily-summary', [NutritionalDataController::class, 'dailySummary']);
        Route::get('/weekly-summary', [NutritionalDataController::class, 'weeklySummary']);
        Route::get('/{nutritionalData}', [NutritionalDataController::class, 'show']);
        Route::put('/{nutritionalData}', [NutritionalDataController::class, 'update']);
        Route::delete('/{nutritionalData}', [NutritionalDataController::class, 'destroy']);
    });

    // Rutas de alimentos
    Route::prefix('foods')->group(function () {
        Route::get('/', [FoodItemController::class, 'index']);
        Route::get('/categories', [FoodItemController::class, 'categories']);
        Route::get('/tags', [FoodItemController::class, 'popularTags']);
        Route::get('/{foodItem}', [FoodItemController::class, 'show']);
        Route::post('/{foodItem}/calculate', [FoodItemController::class, 'calculateNutrition']);
    });

    // Rutas de hidratación
    Route::prefix('hydration')->group(function () {
        Route::get('/', [HydrationController::class, 'index']);
        Route::post('/', [HydrationController::class, 'store']);
        Route::get('/daily-summary', [HydrationController::class, 'dailySummary']);
        Route::get('/weekly-summary', [HydrationController::class, 'weeklySummary']);
        Route::get('/drink-types', [HydrationController::class, 'drinkTypes']);
        Route::put('/{hydrationRecord}', [HydrationController::class, 'update']);
        Route::delete('/{hydrationRecord}', [HydrationController::class, 'destroy']);
    });

    // Rutas de coaching
    Route::prefix('coaching')->group(function () {
        Route::get('/messages', [CoachingController::class, 'getMessages']);
        Route::post('/messages/{coachingMessage}/read', [CoachingController::class, 'markAsRead']);
        Route::post('/daily-summary', [CoachingController::class, 'dailySummary']);
        Route::post('/progress-check', [CoachingController::class, 'progressCheck']);
        Route::post('/difficult-day', [CoachingController::class, 'difficultDay']);
        Route::post('/craving-sos', [CoachingController::class, 'cravingSos']);
        Route::post('/social-situation', [CoachingController::class, 'socialSituation']);
    });

    // Rutas de chat con Gemini IA
    Route::prefix('chat')->group(function () {
        // Enviar mensaje al chat
        Route::post('/send', [ChatController::class, 'sendMessage']);
        
        // Obtener historial de conversaciones
        Route::get('/conversations', [ChatController::class, 'getConversations']);
        
        // Obtener conversación de una sesión específica
        Route::get('/session/{sessionId}', [ChatController::class, 'getSessionConversation']);
        
        // Marcar conversación como leída
        Route::post('/conversations/{conversation}/read', [ChatController::class, 'markAsRead']);
        
        // Obtener estadísticas de conversación
        Route::get('/stats', [ChatController::class, 'getConversationStats']);
        
        // Obtener sugerencias de seguimiento populares
        Route::get('/suggestions', [ChatController::class, 'getFollowUpSuggestions']);
        
        // Crear nueva sesión de chat
        Route::post('/session', [ChatController::class, 'createSession']);
        
        // Obtener contexto del usuario
        Route::get('/context', [ChatController::class, 'getUserContext']);
        
        // Obtener contexto reciente para conversación
        Route::get('/recent-context', [ChatController::class, 'getRecentContext']);
    });

    // Rutas de alertas y seguridad
    Route::prefix('alerts')->group(function () {
        Route::get('/', [AlertController::class, 'index']);
        Route::post('/check', [AlertController::class, 'checkAndGenerateAlerts']);
        Route::post('/{userAlert}/dismiss', [AlertController::class, 'dismiss']);
        Route::get('/medical-disclaimer', [AlertController::class, 'getMedicalDisclaimer']);
        Route::post('/medical-disclaimer/accept', [AlertController::class, 'acceptMedicalDisclaimer']);
    });

    // Rutas de contexto del usuario
    Route::prefix('context')->group(function () {
        Route::get('/', [UserContextController::class, 'index']);
        Route::post('/', [UserContextController::class, 'store']);
        Route::get('/tolerance', [UserContextController::class, 'getAdjustedTolerance']);
        Route::get('/adherence', [UserContextController::class, 'evaluateAdherenceWithContext']);
        Route::get('/recommendations', [UserContextController::class, 'getContextualRecommendations']);
        Route::put('/{userContext}', [UserContextController::class, 'update']);
        Route::delete('/{userContext}', [UserContextController::class, 'destroy']);
    });

    // Rutas de planes de comida
    Route::prefix('meal-plans')->group(function () {
        Route::get('/', [MealPlanController::class, 'index']);
        Route::post('/', [MealPlanController::class, 'store']);
        Route::post('/generate', [MealPlanController::class, 'generateAutomaticPlan']);
        Route::get('/daily-summary', [MealPlanController::class, 'getDailyPlanSummary']);
        Route::get('/weekly-progress', [MealPlanController::class, 'getWeeklyPlanProgress']);
        Route::post('/{mealPlan}/complete', [MealPlanController::class, 'markAsCompleted']);
        Route::put('/{mealPlan}', [MealPlanController::class, 'update']);
        Route::delete('/{mealPlan}', [MealPlanController::class, 'destroy']);
    });

    // Rutas de ejercicios
    Route::prefix('exercises')->group(function () {
        // Obtener recomendaciones basadas en calorías y músculos descansados
        Route::get('/recommendations', [ExerciseController::class, 'recommendations']);

        // Listar ejercicios con filtros
        Route::get('/', [ExerciseController::class, 'index']);

        // Obtener estado de músculos (fatigados/descansados)
        Route::get('/muscle-status', [ExerciseController::class, 'muscleStatus']);

        // Registrar ejercicio completado
        Route::post('/log', [ExerciseController::class, 'logExercise']);

        // Historial de ejercicios del usuario
        Route::get('/history', [ExerciseController::class, 'history']);

        // Resumen diario de ejercicios
        Route::get('/summary', [ExerciseController::class, 'summary']);

        // Sincronizar ejercicios desde API externa
        Route::post('/sync', [ExerciseController::class, 'syncFromApi']);

        // Catálogos
        Route::get('/types', [ExerciseController::class, 'types']);
        Route::get('/muscles', [ExerciseController::class, 'muscles']);
        Route::get('/difficulties', [ExerciseController::class, 'difficulties']);

        // Detalles de ejercicio específico
        Route::get('/{exercise}', [ExerciseController::class, 'show']);
    });

    // Rutas de administración (solo para administradores)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('foods', FoodItemController::class);
    });
});
