<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Programar detección de inactividad diaria
Schedule::command('inactivity:detect')
    ->dailyAt('09:00')
    ->timezone('America/Mexico_City')
    ->name('Detección diaria de inactividad')
    ->withoutOverlapping()
    ->onOneServer();

// Limpieza de alertas antiguas (mensual)
Schedule::command('inactivity:detect --cleanup')
    ->monthlyOn(1, '02:00')
    ->timezone('America/Mexico_City')
    ->name('Limpieza de alertas antiguas')
    ->onOneServer();
