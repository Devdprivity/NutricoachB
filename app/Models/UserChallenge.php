<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserChallenge extends Model
{
    protected $fillable = ['user_id', 'challenge_id', 'progress', 'current_value', 'target_value', 'status', 'started_at', 'completed_at', 'xp_earned'];
    protected $casts = ['progress' => 'array', 'started_at' => 'datetime', 'completed_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function challenge() { return $this->belongsTo(Challenge::class); }
}
