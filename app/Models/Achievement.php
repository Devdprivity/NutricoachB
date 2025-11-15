<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = ['key', 'name', 'description', 'icon', 'category', 'xp_reward', 'difficulty', 'criteria', 'is_active'];
    protected $casts = ['criteria' => 'array', 'is_active' => 'boolean'];

    public function userAchievements() { return $this->hasMany(UserAchievement::class); }
}
