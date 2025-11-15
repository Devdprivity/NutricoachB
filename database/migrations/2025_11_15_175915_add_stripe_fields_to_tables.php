<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar stripe_customer_id a users
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('email');
            $table->index('stripe_customer_id');
        });

        // Agregar campos de Stripe a subscription_plans
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->string('stripe_product_id')->nullable()->after('slug');
            $table->string('stripe_price_id_monthly')->nullable()->after('stripe_product_id');
            $table->string('stripe_price_id_yearly')->nullable()->after('stripe_price_id_monthly');
        });

        // Agregar stripe_subscription_id a subscriptions
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('stripe_subscription_id')->nullable()->after('id');
            $table->string('stripe_payment_intent_id')->nullable()->after('stripe_subscription_id');
            $table->index('stripe_subscription_id');
        });

        // Agregar stripe_charge_id a payment_history
        Schema::table('payment_history', function (Blueprint $table) {
            $table->string('stripe_charge_id')->nullable()->after('transaction_id');
            $table->string('stripe_invoice_id')->nullable()->after('stripe_charge_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['stripe_customer_id']);
            $table->dropColumn('stripe_customer_id');
        });

        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['stripe_product_id', 'stripe_price_id_monthly', 'stripe_price_id_yearly']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex(['stripe_subscription_id']);
            $table->dropColumn(['stripe_subscription_id', 'stripe_payment_intent_id']);
        });

        Schema::table('payment_history', function (Blueprint $table) {
            $table->dropColumn(['stripe_charge_id', 'stripe_invoice_id']);
        });
    }
};
