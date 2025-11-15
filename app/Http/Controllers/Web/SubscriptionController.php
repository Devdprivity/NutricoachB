<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\PaymentHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Mostrar planes de suscripción
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Obtener todos los planes activos
        $plans = SubscriptionPlan::active()->get();

        // Suscripción activa del usuario
        $activeSubscription = $user->activeSubscription()->with('subscriptionPlan')->first();

        // Historial de suscripciones
        $subscriptionHistory = Subscription::where('user_id', $user->id)
            ->with('subscriptionPlan')
            ->latest()
            ->limit(5)
            ->get();

        // Historial de pagos
        $paymentHistory = PaymentHistory::where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('subscription', [
            'plans' => $plans,
            'activeSubscription' => $activeSubscription,
            'currentPlan' => $user->currentSubscriptionPlan,
            'isPremium' => $user->isPremium(),
            'subscriptionHistory' => $subscriptionHistory,
            'paymentHistory' => $paymentHistory,
        ]);
    }

    /**
     * Suscribirse a un plan (demo - sin pago real)
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        // Cancelar suscripción activa si existe
        $activeSubscription = $user->activeSubscription()->first();
        if ($activeSubscription) {
            $activeSubscription->cancel('Upgrade/Downgrade a nuevo plan');
        }

        // Calcular fechas
        $months = $validated['billing_cycle'] === 'yearly' ? 12 : 1;
        $amount = $plan->getPrice($validated['billing_cycle']);

        // Crear nueva suscripción
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => $validated['billing_cycle'],
            'start_date' => now(),
            'end_date' => now()->addMonths($months),
            'next_billing_date' => now()->addMonths($months),
            'amount' => $amount,
            'payment_method' => 'demo',
            'payment_id' => 'DEMO-' . time(),
            'auto_renew' => true,
        ]);

        // Actualizar usuario
        $user->update([
            'current_subscription_plan_id' => $plan->id,
            'is_premium' => !$plan->isFree(),
        ]);

        // Crear registro de pago (demo)
        PaymentHistory::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'amount' => $amount,
            'currency' => 'USD',
            'status' => 'completed',
            'payment_method' => 'demo',
            'transaction_id' => 'TXN-' . time(),
            'payment_gateway' => 'demo',
            'description' => "Suscripción a {$plan->name} ({$validated['billing_cycle']})",
            'paid_at' => now(),
        ]);

        return redirect()->back()->with('success', '¡Suscripción activada exitosamente!');
    }

    /**
     * Cancelar suscripción
     */
    public function cancel(Request $request)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $activeSubscription = $user->activeSubscription()->first();

        if (!$activeSubscription) {
            return redirect()->back()->with('error', 'No tienes una suscripción activa');
        }

        $activeSubscription->cancel($validated['reason'] ?? null);

        // Si era plan de pago, volver a plan gratuito
        if (!$activeSubscription->subscriptionPlan->isFree()) {
            $freePlan = SubscriptionPlan::where('slug', 'free')->first();
            if ($freePlan) {
                $user->update([
                    'current_subscription_plan_id' => $freePlan->id,
                    'is_premium' => false,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Suscripción cancelada');
    }

    /**
     * Cambiar ciclo de facturación
     */
    public function changeBillingCycle(Request $request)
    {
        $validated = $request->validate([
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $activeSubscription = $user->activeSubscription()->first();

        if (!$activeSubscription) {
            return redirect()->back()->with('error', 'No tienes una suscripción activa');
        }

        $activeSubscription->update([
            'billing_cycle' => $validated['billing_cycle'],
            'amount' => $activeSubscription->subscriptionPlan->getPrice($validated['billing_cycle']),
        ]);

        return redirect()->back()->with('success', 'Ciclo de facturación actualizado');
    }

    /**
     * Reactivar renovación automática
     */
    public function reactivateAutoRenew(Request $request)
    {
        $user = $request->user();
        $activeSubscription = $user->activeSubscription()->first();

        if (!$activeSubscription) {
            return redirect()->back()->with('error', 'No tienes una suscripción activa');
        }

        $activeSubscription->update([
            'auto_renew' => true,
            'status' => 'active',
            'cancelled_at' => null,
        ]);

        return redirect()->back()->with('success', 'Renovación automática activada');
    }

    /**
     * Ver factura de un pago
     */
    public function showInvoice(Request $request, int $paymentId): Response
    {
        $payment = PaymentHistory::where('id', $paymentId)
            ->where('user_id', $request->user()->id)
            ->with(['subscription.subscriptionPlan'])
            ->firstOrFail();

        return Inertia::render('invoice', [
            'payment' => $payment,
        ]);
    }
}
