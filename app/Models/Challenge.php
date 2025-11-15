<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $fillable = ['name', 'description', 'type', 'category', 'goal_criteria', 'xp_reward', 'difficulty', 'start_date', 'end_date', 'is_recurring', 'icon', 'is_active'];
    protected $casts = ['goal_criteria' => 'array', 'start_date' => 'date', 'end_date' => 'date', 'is_recurring' => 'boolean', 'is_active' => 'boolean'];

    public function userChallenges() { return $this->hasMany(UserChallenge::class); }
}
