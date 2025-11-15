<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutLog extends Model
{
    protected $fillable = [
        'user_id',
        'workout_plan_id',
        'workout_exercise_id',
        'date',
        'sets_completed',
        'reps_completed',
        'weight_used_kg',
        'duration_seconds',
        'notes',
        'difficulty_felt',
        'completed',
    ];

    protected $casts = [
        'date' => 'date',
        'sets_completed' => 'integer',
        'reps_completed' => 'integer',
        'weight_used_kg' => 'float',
        'duration_seconds' => 'integer',
        'completed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workoutPlan(): BelongsTo
    {
        return $this->belongsTo(WorkoutPlan::class);
    }

    public function workoutExercise(): BelongsTo
    {
        return $this->belongsTo(WorkoutExercise::class);
    }
}
