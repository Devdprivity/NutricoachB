<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->registerSlowQueryLogger();
    }

    private function registerSlowQueryLogger(): void
    {
        $thresholdMs = (int) config('database.slow_query_threshold_ms', 300);

        DB::whenQueryingForLongerThan($thresholdMs, function (Connection $connection, \Illuminate\Database\Events\QueryExecuted $event) {
            Log::warning('Slow query detected', [
                'sql'        => $event->sql,
                'bindings'   => $event->bindings,
                'time_ms'    => $event->time,
                'connection' => $connection->getName(),
                'url'        => request()->fullUrl(),
            ]);
        });
    }
}
