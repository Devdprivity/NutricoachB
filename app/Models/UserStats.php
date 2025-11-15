<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserStats extends Model
{
    protected $fillable = ['user_id', 'total_xp', 'level', 'xp_to_next_level', 'total_achievements', 'total_meals_logged', 'total_exercises_logged', 'total_water_logged', 'days_active', 'first_activity_date', 'last_activity_date', 'badges'];
    protected $casts = ['first_activity_date' => 'date', 'last_activity_date' => 'date', 'badges' => 'array'];

    public function user() { return $this->belongsTo(User::class); }
}
