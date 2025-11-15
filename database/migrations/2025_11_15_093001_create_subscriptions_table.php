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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_plan_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'cancelled', 'expired', 'pending'])->default('pending');
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('next_billing_date')->nullable();
            $table->decimal('amount', 8, 2)->default(0);
            $table->string('payment_method')->nullable(); // stripe, paypal, etc.
            $table->string('payment_id')->nullable(); // ID de transacción
            $table->boolean('auto_renew')->default(true);
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
