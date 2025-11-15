<?php

use App\Http\Controllers\Auth\SocialController as AuthSocialController;
use App\Http\Controllers\Web\BarcodeController;
use App\Http\Controllers\Web\CoachingController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ExercisesController;
use App\Http\Controllers\Web\FavoriteMealController;
use App\Http\Controllers\Web\GamificationController;
use App\Http\Controllers\Web\HydrationController;
use App\Http\Controllers\Web\NutritionController;
use App\Http\Controllers\Web\ProgressPhotoController;
use App\Http\Controllers\Web\SocialController;
use App\Http\Controllers\Web\WorkoutPlanController;
use App\Http\Controllers\Web\RecipeController;
use App\Http\Controllers\Web\WeeklyMealPlanController;
use App\Http\Controllers\Web\SubscriptionController;
use App\Http\Controllers\Web\SpotifyController;
use App\Http\Controllers\Web\YouTubeMusicController;
use App\Http\Controllers\Web\AppleMusicController;
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

    // Códigos de Barras
    Route::post('barcode/search', [BarcodeController::class, 'searchByBarcode'])->name('barcode.search');
    Route::post('barcode/search-text', [BarcodeController::class, 'searchByText'])->name('barcode.search-text');

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

    // Sistema Social
    Route::get('social', [SocialController::class, 'index'])->name('social');
    Route::post('social/follow/{userId}', [SocialController::class, 'follow'])->name('social.follow');
    Route::post('social/unfollow/{userId}', [SocialController::class, 'unfollow'])->name('social.unfollow');
    Route::get('social/followers/{userId}', [SocialController::class, 'followers'])->name('social.followers');
    Route::get('social/following/{userId}', [SocialController::class, 'following'])->name('social.following');
    Route::post('social/activities/{activityId}/like', [SocialController::class, 'likeActivity'])->name('social.activity.like');
    Route::delete('social/activities/{activityId}/like', [SocialController::class, 'unlikeActivity'])->name('social.activity.unlike');
    Route::get('social/search', [SocialController::class, 'searchUsers'])->name('social.search');
    Route::get('social/leaderboard', [SocialController::class, 'leaderboard'])->name('social.leaderboard');

    // Planes de Entrenamiento
    Route::get('workout-plans', [WorkoutPlanController::class, 'index'])->name('workout-plans');
    Route::post('workout-plans', [WorkoutPlanController::class, 'store'])->name('workout-plans.store');
    Route::get('workout-plans/{id}', [WorkoutPlanController::class, 'show'])->name('workout-plans.show');
    Route::put('workout-plans/{id}', [WorkoutPlanController::class, 'update'])->name('workout-plans.update');
    Route::delete('workout-plans/{id}', [WorkoutPlanController::class, 'destroy'])->name('workout-plans.destroy');
    Route::post('workout-plans/log', [WorkoutPlanController::class, 'logWorkout'])->name('workout-plans.log');
    Route::get('workout-plans/today/workout', [WorkoutPlanController::class, 'getTodayWorkout'])->name('workout-plans.today');

    // Recetas
    Route::get('recipes', [RecipeController::class, 'index'])->name('recipes');
    Route::post('recipes', [RecipeController::class, 'store'])->name('recipes.store');
    Route::get('recipes/{id}', [RecipeController::class, 'show'])->name('recipes.show');
    Route::put('recipes/{id}', [RecipeController::class, 'update'])->name('recipes.update');
    Route::delete('recipes/{id}', [RecipeController::class, 'destroy'])->name('recipes.destroy');
    Route::post('recipes/{id}/cooked', [RecipeController::class, 'markAsCooked'])->name('recipes.cooked');
    Route::get('recipes/search/query', [RecipeController::class, 'search'])->name('recipes.search');

    // Planes de Comidas Semanales
    Route::get('weekly-meal-plans', [WeeklyMealPlanController::class, 'index'])->name('weekly-meal-plans');
    Route::post('weekly-meal-plans', [WeeklyMealPlanController::class, 'store'])->name('weekly-meal-plans.store');
    Route::get('weekly-meal-plans/{id}', [WeeklyMealPlanController::class, 'show'])->name('weekly-meal-plans.show');
    Route::put('weekly-meal-plans/{id}', [WeeklyMealPlanController::class, 'update'])->name('weekly-meal-plans.update');
    Route::delete('weekly-meal-plans/{id}', [WeeklyMealPlanController::class, 'destroy'])->name('weekly-meal-plans.destroy');
    Route::post('weekly-meal-plans/{id}/recipes', [WeeklyMealPlanController::class, 'addRecipe'])->name('weekly-meal-plans.add-recipe');
    Route::delete('weekly-meal-plans/{planId}/recipes/{recipeId}', [WeeklyMealPlanController::class, 'removeRecipe'])->name('weekly-meal-plans.remove-recipe');
    Route::get('weekly-meal-plans/today/plan', [WeeklyMealPlanController::class, 'getTodayPlan'])->name('weekly-meal-plans.today');

    // Suscripciones
    Route::get('subscription', [SubscriptionController::class, 'index'])->name('subscription');
    Route::post('subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
    Route::post('subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');
    Route::post('subscription/change-cycle', [SubscriptionController::class, 'changeBillingCycle'])->name('subscription.change-cycle');
    Route::post('subscription/reactivate', [SubscriptionController::class, 'reactivateAutoRenew'])->name('subscription.reactivate');
    Route::get('subscription/invoice/{paymentId}', [SubscriptionController::class, 'showInvoice'])->name('subscription.invoice');

    Route::get('context', [\App\Http\Controllers\Web\ContextController::class, 'index'])->name('context');

    // Spotify
    Route::get('spotify/redirect', [SpotifyController::class, 'redirectToSpotify'])->name('spotify.redirect');
    Route::get('spotify/callback', [SpotifyController::class, 'handleSpotifyCallback'])->name('spotify.callback');
    // Ruta de compatibilidad para callback de Spotify (si está configurado como /callback en Spotify Dashboard)
    Route::get('callback', [SpotifyController::class, 'handleSpotifyCallback'])->name('spotify.callback.alias');
    Route::post('spotify/disconnect', [SpotifyController::class, 'disconnect'])->name('spotify.disconnect');
    Route::get('spotify/currently-playing', [SpotifyController::class, 'getCurrentlyPlaying'])->name('spotify.currently-playing');
    Route::get('spotify/friends-listening', [SpotifyController::class, 'getFriendsListening'])->name('spotify.friends-listening');
    Route::post('spotify/toggle-share', [SpotifyController::class, 'toggleShareListening'])->name('spotify.toggle-share');
    Route::post('spotify/play', [SpotifyController::class, 'play'])->name('spotify.play');
    Route::post('spotify/pause', [SpotifyController::class, 'pause'])->name('spotify.pause');
    Route::post('spotify/next', [SpotifyController::class, 'next'])->name('spotify.next');
    Route::post('spotify/previous', [SpotifyController::class, 'previous'])->name('spotify.previous');
    Route::get('spotify/search', [SpotifyController::class, 'search'])->name('spotify.search');
    Route::post('spotify/play-track', [SpotifyController::class, 'playTrack'])->name('spotify.play-track');
    Route::get('spotify/devices', [SpotifyController::class, 'getDevices'])->name('spotify.devices');

    // YouTube Music
    Route::get('youtube-music/redirect', [YouTubeMusicController::class, 'redirectToYouTubeMusic'])->name('youtube-music.redirect');
    Route::get('youtube-music/callback', [YouTubeMusicController::class, 'handleYouTubeMusicCallback'])->name('youtube-music.callback');
    Route::post('youtube-music/disconnect', [YouTubeMusicController::class, 'disconnect'])->name('youtube-music.disconnect');
    Route::get('youtube-music/currently-playing', [YouTubeMusicController::class, 'getCurrentlyPlaying'])->name('youtube-music.currently-playing');
    Route::get('youtube-music/friends-listening', [YouTubeMusicController::class, 'getFriendsListening'])->name('youtube-music.friends-listening');
    Route::post('youtube-music/toggle-share', [YouTubeMusicController::class, 'toggleShareListening'])->name('youtube-music.toggle-share');
    Route::get('youtube-music/search', [YouTubeMusicController::class, 'search'])->name('youtube-music.search');
    Route::post('youtube-music/play-video', [YouTubeMusicController::class, 'playVideo'])->name('youtube-music.play-video');

    // Apple Music
    Route::post('apple-music/connect', [AppleMusicController::class, 'connect'])->name('apple-music.connect');
    Route::post('apple-music/disconnect', [AppleMusicController::class, 'disconnect'])->name('apple-music.disconnect');
    Route::get('apple-music/developer-token', [AppleMusicController::class, 'getDeveloperToken'])->name('apple-music.developer-token');
    Route::post('apple-music/save-currently-playing', [AppleMusicController::class, 'saveCurrentlyPlaying'])->name('apple-music.save-currently-playing');
    Route::get('apple-music/currently-playing', [AppleMusicController::class, 'getCurrentlyPlaying'])->name('apple-music.currently-playing');
    Route::get('apple-music/friends-listening', [AppleMusicController::class, 'getFriendsListening'])->name('apple-music.friends-listening');
    Route::post('apple-music/toggle-share', [AppleMusicController::class, 'toggleShareListening'])->name('apple-music.toggle-share');
    Route::get('apple-music/recently-played', [AppleMusicController::class, 'getRecentlyPlayed'])->name('apple-music.recently-played');
});

// Rutas para autenticación con Google
Route::get('/auth/google', [AuthSocialController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthSocialController::class, 'handleGoogleCallback'])->name('auth.google.callback');

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
