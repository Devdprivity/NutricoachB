<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'status',
        'billing_cycle',
        'start_date',
        'end_date',
        'next_billing_date',
        'amount',
        'payment_method',
        'payment_id',
        'auto_renew',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'next_billing_date' => 'date',
        'amount' => 'float',
        'auto_renew' => 'boolean',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Usuario de la suscripción
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Plan de suscripción
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    /**
     * Historial de pagos
     */
    public function payments(): HasMany
    {
        return $this->hasMany(PaymentHistory::class);
    }

    /**
     * Scope para suscripciones activas
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('end_date', '>=', now());
    }

    /**
     * Verificar si la suscripción está activa
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_date >= now();
    }

    /**
     * Verificar si está expirada
     */
    public function isExpired(): bool
    {
        return $this->end_date < now();
    }

    /**
     * Verificar si está cancelada
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled' || $this->cancelled_at !== null;
    }

    /**
     * Días restantes
     */
    public function getDaysRemainingAttribute(): int
    {
        if ($this->isExpired()) {
            return 0;
        }
        return now()->diffInDays($this->end_date);
    }

    /**
     * Cancelar suscripción
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'auto_renew' => false,
        ]);
    }

    /**
     * Renovar suscripción
     */
    public function renew(): void
    {
        $months = $this->billing_cycle === 'yearly' ? 12 : 1;

        $this->update([
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addMonths($months),
            'next_billing_date' => now()->addMonths($months),
        ]);
    }
}
