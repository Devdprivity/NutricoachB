<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLike extends Model
{
    protected $fillable = [
        'activity_id',
        'user_id',
    ];

    /**
     * La actividad que recibió el like
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * El usuario que dio el like
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
