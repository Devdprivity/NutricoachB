<?php

use App\Http\Controllers\Auth\SocialController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Vistas principales
    Route::get('hydration', function () {
        return Inertia::render('hydration');
    })->name('hydration');

    Route::get('nutrition', function () {
        return Inertia::render('nutrition');
    })->name('nutrition');

    Route::get('exercises', function () {
        return Inertia::render('exercises');
    })->name('exercises');

    Route::get('coaching', function () {
        return Inertia::render('coaching');
    })->name('coaching');

    Route::get('progress', function () {
        return Inertia::render('progress');
    })->name('progress');

    Route::get('context', function () {
        return Inertia::render('context');
    })->name('context');
});

// Rutas para autenticación con Google
Route::get('/auth/google', [SocialController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialController::class, 'handleGoogleCallback'])->name('auth.google.callback');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
