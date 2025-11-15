<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XpTransaction extends Model
{
    protected $fillable = ['user_id', 'xp_amount', 'source', 'description', 'earnable_type', 'earnable_id'];

    public function user() { return $this->belongsTo(User::class); }
    public function earnable() { return $this->morphTo(); }
}
