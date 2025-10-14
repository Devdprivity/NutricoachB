<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\CoachingController;
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

    // Rutas de administración (solo para administradores)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('foods', FoodItemController::class);
    });
});
