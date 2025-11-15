<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserStreak extends Model
{
    protected $fillable = ['user_id', 'type', 'current_count', 'longest_count', 'last_activity_date', 'streak_start_date', 'is_active'];
    protected $casts = ['last_activity_date' => 'date', 'streak_start_date' => 'date', 'is_active' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
}
