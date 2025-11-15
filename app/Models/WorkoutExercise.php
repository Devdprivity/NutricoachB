<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutExercise extends Model
{
    protected $fillable = [
        'workout_plan_id',
        'name',
        'description',
        'muscle_group',
        'sets',
        'reps',
        'duration_seconds',
        'weight_kg',
        'rest_seconds',
        'order',
        'video_url',
        'image_url',
        'instructions',
    ];

    protected $casts = [
        'instructions' => 'array',
        'sets' => 'integer',
        'reps' => 'integer',
        'duration_seconds' => 'integer',
        'weight_kg' => 'float',
        'rest_seconds' => 'integer',
        'order' => 'integer',
    ];

    public function workoutPlan(): BelongsTo
    {
        return $this->belongsTo(WorkoutPlan::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(WorkoutLog::class);
    }
}
