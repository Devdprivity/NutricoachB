<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\PaymentHistory;
use App\Services\StripeService;
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
     * Suscribirse a un plan con Stripe
     */
    public function subscribe(Request $request, StripeService $stripeService)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        // Si es plan gratuito, no usar Stripe
        if ($plan->slug === 'free' || $plan->getPrice($validated['billing_cycle']) == 0) {
            $this->subscribeFree($user, $plan, $validated['billing_cycle']);
            return response()->json(['success' => true]);
        }

        try {
            // Crear sesión de Stripe Checkout
            $session = $stripeService->createCheckoutSession($user, $plan, $validated['billing_cycle']);

            // Devolver la URL de Stripe Checkout
            return response()->json([
                'success' => true,
                'checkout_url' => $session->url,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating Stripe checkout session', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el pago. Por favor, intenta nuevamente.',
            ], 500);
        }
    }

    /**
     * Suscribirse al plan gratuito (sin Stripe)
     */
    protected function subscribeFree($user, $plan, $billingCycle)
    {
        // Cancelar suscripción activa si existe
        $activeSubscription = $user->activeSubscription()->first();
        if ($activeSubscription) {
            $activeSubscription->cancel('Cambio a plan gratuito');
        }

        // Crear nueva suscripción gratuita
        Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => $billingCycle,
            'start_date' => now(),
            'end_date' => now()->addYears(100), // Plan gratuito no expira
            'next_billing_date' => null,
            'amount' => 0,
            'payment_method' => 'free',
            'payment_id' => null,
            'auto_renew' => false,
        ]);

        // Actualizar usuario
        $user->update([
            'current_subscription_plan_id' => $plan->id,
            'is_premium' => false,
        ]);

        return redirect()->back()->with('success', '¡Ahora estás en el plan gratuito!');
    }

    /**
     * Página de éxito después del pago
     */
    public function success(Request $request)
    {
        // El webhook ya habrá procesado la suscripción
        return redirect()->route('subscription.index')->with('success', '¡Suscripción activada exitosamente!');
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
