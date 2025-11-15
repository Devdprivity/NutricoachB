<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\PaymentHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    /**
     * Manejar webhooks de Stripe
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Manejar el evento
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;

            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event->data->object);
                break;

            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event->data->object);
                break;

            default:
                \Log::info('Unhandled Stripe webhook event: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Manejar checkout completado
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        $userId = $session->metadata->user_id;
        $planId = $session->metadata->plan_id;
        $billingCycle = $session->metadata->billing_cycle;

        $user = User::find($userId);
        if (!$user) {
            \Log::error('User not found for Stripe checkout session', ['user_id' => $userId]);
            return;
        }

        // Cancelar suscripción activa anterior
        $activeSubscription = $user->activeSubscription()->first();
        if ($activeSubscription) {
            $activeSubscription->cancel('Upgrade/Downgrade a nuevo plan');
        }

        // Obtener la suscripción de Stripe
        $stripeSubscription = \Stripe\Subscription::retrieve($session->subscription);

        // Crear nueva suscripción
        $subscription = Subscription::create([
            'user_id' => $userId,
            'subscription_plan_id' => $planId,
            'stripe_subscription_id' => $session->subscription,
            'stripe_payment_intent_id' => $session->payment_intent,
            'status' => 'active',
            'billing_cycle' => $billingCycle,
            'start_date' => now(),
            'end_date' => now()->addMonths($billingCycle === 'yearly' ? 12 : 1),
            'next_billing_date' => now()->addMonths($billingCycle === 'yearly' ? 12 : 1),
            'amount' => $session->amount_total / 100, // Stripe usa centavos
            'payment_method' => 'stripe',
            'payment_id' => $session->payment_intent,
            'auto_renew' => true,
        ]);

        // Actualizar usuario
        $user->update([
            'current_subscription_plan_id' => $planId,
            'is_premium' => true,
        ]);

        // Crear registro de pago
        PaymentHistory::create([
            'user_id' => $userId,
            'subscription_id' => $subscription->id,
            'amount' => $session->amount_total / 100,
            'currency' => strtoupper($session->currency),
            'status' => 'completed',
            'payment_method' => 'stripe',
            'transaction_id' => $session->payment_intent,
            'stripe_charge_id' => $session->payment_intent,
            'payment_gateway' => 'stripe',
            'description' => "Suscripción vía Stripe",
            'paid_at' => now(),
        ]);

        \Log::info('Stripe subscription created', [
            'user_id' => $userId,
            'subscription_id' => $subscription->id,
            'stripe_subscription_id' => $session->subscription,
        ]);
    }

    /**
     * Manejar actualización de suscripción
     */
    protected function handleSubscriptionUpdated($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        if (!$subscription) {
            \Log::warning('Subscription not found for Stripe update', ['stripe_subscription_id' => $stripeSubscription->id]);
            return;
        }

        // Actualizar estado
        $status = match($stripeSubscription->status) {
            'active' => 'active',
            'canceled' => 'cancelled',
            'past_due' => 'past_due',
            'unpaid' => 'unpaid',
            default => 'active',
        };

        $subscription->update([
            'status' => $status,
            'end_date' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
            'next_billing_date' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
        ]);

        \Log::info('Stripe subscription updated', [
            'subscription_id' => $subscription->id,
            'status' => $status,
        ]);
    }

    /**
     * Manejar eliminación de suscripción
     */
    protected function handleSubscriptionDeleted($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        if (!$subscription) {
            \Log::warning('Subscription not found for Stripe deletion', ['stripe_subscription_id' => $stripeSubscription->id]);
            return;
        }

        $subscription->cancel('Cancelado por Stripe');

        // Volver al plan gratuito
        $freePlan = \App\Models\SubscriptionPlan::where('slug', 'free')->first();
        if ($freePlan && $subscription->user) {
            $subscription->user->update([
                'current_subscription_plan_id' => $freePlan->id,
                'is_premium' => false,
            ]);
        }

        \Log::info('Stripe subscription deleted', [
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Manejar pago exitoso de factura
     */
    protected function handleInvoicePaymentSucceeded($invoice)
    {
        if (!$invoice->subscription) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();

        if (!$subscription) {
            \Log::warning('Subscription not found for invoice', ['stripe_subscription_id' => $invoice->subscription]);
            return;
        }

        // Crear registro de pago
        PaymentHistory::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'amount' => $invoice->amount_paid / 100,
            'currency' => strtoupper($invoice->currency),
            'status' => 'completed',
            'payment_method' => 'stripe',
            'transaction_id' => $invoice->payment_intent,
            'stripe_charge_id' => $invoice->charge,
            'stripe_invoice_id' => $invoice->id,
            'payment_gateway' => 'stripe',
            'description' => "Renovación de suscripción",
            'paid_at' => now(),
        ]);

        \Log::info('Invoice payment succeeded', [
            'subscription_id' => $subscription->id,
            'amount' => $invoice->amount_paid / 100,
        ]);
    }

    /**
     * Manejar fallo de pago de factura
     */
    protected function handleInvoicePaymentFailed($invoice)
    {
        if (!$invoice->subscription) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();

        if (!$subscription) {
            \Log::warning('Subscription not found for failed invoice', ['stripe_subscription_id' => $invoice->subscription]);
            return;
        }

        // Actualizar estado de suscripción
        $subscription->update([
            'status' => 'past_due',
        ]);

        // Crear registro de pago fallido
        PaymentHistory::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'amount' => $invoice->amount_due / 100,
            'currency' => strtoupper($invoice->currency),
            'status' => 'failed',
            'payment_method' => 'stripe',
            'transaction_id' => $invoice->payment_intent,
            'stripe_invoice_id' => $invoice->id,
            'payment_gateway' => 'stripe',
            'description' => "Pago fallido - Renovación de suscripción",
            'paid_at' => null,
        ]);

        \Log::warning('Invoice payment failed', [
            'subscription_id' => $subscription->id,
            'amount' => $invoice->amount_due / 100,
        ]);

        // TODO: Enviar notificación al usuario sobre el pago fallido
    }
}
