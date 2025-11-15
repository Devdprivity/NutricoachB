<?php

use App\Http\Controllers\Auth\SocialController;
use App\Http\Controllers\Web\CoachingController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ExercisesController;
use App\Http\Controllers\Web\FavoriteMealController;
use App\Http\Controllers\Web\GamificationController;
use App\Http\Controllers\Web\HydrationController;
use App\Http\Controllers\Web\NutritionController;
use App\Http\Controllers\Web\ProgressPhotoController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Hidratación
    Route::get('hydration', [HydrationController::class, 'index'])->name('hydration');
    Route::post('hydration', [HydrationController::class, 'store'])->name('hydration.store');
    Route::delete('hydration/{id}', [HydrationController::class, 'destroy'])->name('hydration.destroy');

    // Nutrición
    Route::get('nutrition', [NutritionController::class, 'index'])->name('nutrition');
    Route::post('nutrition', [NutritionController::class, 'store'])->name('nutrition.store');
    Route::delete('nutrition/{id}', [NutritionController::class, 'destroy'])->name('nutrition.destroy');

    // Comidas Favoritas
    Route::get('favorite-meals', [FavoriteMealController::class, 'index'])->name('favorite-meals.index');
    Route::post('favorite-meals', [FavoriteMealController::class, 'store'])->name('favorite-meals.store');
    Route::post('favorite-meals/from-meal/{mealId}', [FavoriteMealController::class, 'createFromMeal'])->name('favorite-meals.from-meal');
    Route::post('favorite-meals/{id}/use', [FavoriteMealController::class, 'use'])->name('favorite-meals.use');
    Route::put('favorite-meals/{id}', [FavoriteMealController::class, 'update'])->name('favorite-meals.update');
    Route::delete('favorite-meals/{id}', [FavoriteMealController::class, 'destroy'])->name('favorite-meals.destroy');

    // Ejercicios
    Route::get('exercises', [ExercisesController::class, 'index'])->name('exercises');
    Route::post('exercises', [ExercisesController::class, 'store'])->name('exercises.store');
    Route::delete('exercises/{id}', [ExercisesController::class, 'destroy'])->name('exercises.destroy');

    // Coaching
    Route::get('coaching', [CoachingController::class, 'index'])->name('coaching');
    Route::post('coaching/message', [CoachingController::class, 'sendMessage'])->name('coaching.message');
    Route::delete('coaching/clear', [CoachingController::class, 'clearHistory'])->name('coaching.clear');

    // Gamificación
    Route::get('achievements', [GamificationController::class, 'index'])->name('achievements');
    Route::get('gamification/stats', [GamificationController::class, 'getStats'])->name('gamification.stats');

    Route::get('progress', [\App\Http\Controllers\Web\ProgressController::class, 'index'])->name('progress');

    // Fotos de Progreso
    Route::post('progress/photos', [ProgressPhotoController::class, 'store'])->name('progress.photos.store');
    Route::delete('progress/photos/{id}', [ProgressPhotoController::class, 'destroy'])->name('progress.photos.destroy');
    Route::post('progress/photos/{id}/baseline', [ProgressPhotoController::class, 'setBaseline'])->name('progress.photos.baseline');
    Route::post('progress/photos/{id}/notes', [ProgressPhotoController::class, 'updateNotes'])->name('progress.photos.notes');

    Route::get('context', [\App\Http\Controllers\Web\ContextController::class, 'index'])->name('context');
});

// Rutas para autenticación con Google
Route::get('/auth/google', [SocialController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Ruta alternativa para servir imágenes de comidas (útil en Windows donde symlinks pueden fallar)
Route::get('/meal-images/{filename}', function ($filename) {
    $path = 'meals/' . $filename;
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    return Storage::disk('public')->response($path);
})->middleware(['auth'])->where('filename', '.*')->name('meal.image');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
