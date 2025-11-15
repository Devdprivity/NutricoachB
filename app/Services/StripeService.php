<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Subscription;
use Stripe\Price;
use Stripe\Product;
use App\Models\User;
use App\Models\SubscriptionPlan;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Crear o obtener cliente de Stripe
     */
    public function getOrCreateCustomer(User $user): Customer
    {
        // Si el usuario ya tiene un Stripe Customer ID, obtenerlo
        if ($user->stripe_customer_id) {
            try {
                return Customer::retrieve($user->stripe_customer_id);
            } catch (\Exception $e) {
                // Si no existe, crear uno nuevo
            }
        }

        // Crear nuevo cliente en Stripe
        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        // Guardar el ID del cliente en la base de datos
        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer;
    }

    /**
     * Crear sesión de Checkout de Stripe
     */
    public function createCheckoutSession(User $user, SubscriptionPlan $plan, string $billingCycle): Session
    {
        $customer = $this->getOrCreateCustomer($user);

        // Obtener el Price ID de Stripe para este plan
        $priceId = $billingCycle === 'yearly' 
            ? $plan->stripe_price_id_yearly 
            : $plan->stripe_price_id_monthly;

        if (!$priceId) {
            throw new \Exception("Price ID de Stripe no configurado para el plan {$plan->name}");
        }

        // Crear sesión de checkout
        $session = Session::create([
            'customer' => $customer->id,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => route('subscription.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('subscription.index'),
            'metadata' => [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'billing_cycle' => $billingCycle,
            ],
        ]);

        return $session;
    }

    /**
     * Cancelar suscripción en Stripe
     */
    public function cancelSubscription(string $stripeSubscriptionId): Subscription
    {
        return Subscription::update($stripeSubscriptionId, [
            'cancel_at_period_end' => true,
        ]);
    }

    /**
     * Reactivar suscripción en Stripe
     */
    public function reactivateSubscription(string $stripeSubscriptionId): Subscription
    {
        return Subscription::update($stripeSubscriptionId, [
            'cancel_at_period_end' => false,
        ]);
    }

    /**
     * Obtener suscripción de Stripe
     */
    public function getSubscription(string $stripeSubscriptionId): Subscription
    {
        return Subscription::retrieve($stripeSubscriptionId);
    }

    /**
     * Crear productos y precios en Stripe (para configuración inicial)
     */
    public function createProductAndPrices(SubscriptionPlan $plan): array
    {
        // Crear producto
        $product = Product::create([
            'name' => $plan->name,
            'description' => $plan->description,
            'metadata' => [
                'plan_id' => $plan->id,
            ],
        ]);

        // Crear precio mensual
        $priceMonthly = null;
        if ($plan->price_monthly > 0) {
            $priceMonthly = Price::create([
                'product' => $product->id,
                'unit_amount' => $plan->price_monthly * 100, // Stripe usa centavos
                'currency' => 'usd',
                'recurring' => [
                    'interval' => 'month',
                ],
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_cycle' => 'monthly',
                ],
            ]);
        }

        // Crear precio anual
        $priceYearly = null;
        if ($plan->price_yearly > 0) {
            $priceYearly = Price::create([
                'product' => $product->id,
                'unit_amount' => $plan->price_yearly * 100, // Stripe usa centavos
                'currency' => 'usd',
                'recurring' => [
                    'interval' => 'year',
                ],
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_cycle' => 'yearly',
                ],
            ]);
        }

        return [
            'product' => $product,
            'price_monthly' => $priceMonthly,
            'price_yearly' => $priceYearly,
        ];
    }
}

