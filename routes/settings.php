<?php

use App\Http\Controllers\Settings\NutritionalProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/nutritional-profile');

    Route::get('settings/nutritional-profile', [NutritionalProfileController::class, 'edit'])->name('nutritional-profile.edit');
    Route::post('settings/nutritional-profile', [NutritionalProfileController::class, 'update'])->name('nutritional-profile.update');
    Route::delete('settings/nutritional-profile', [NutritionalProfileController::class, 'destroy'])->name('nutritional-profile.destroy');

    Route::get('settings/integrations', [\App\Http\Controllers\Settings\IntegrationsController::class, 'index'])->name('integrations.index');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
