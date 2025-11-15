<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SubscriptionPlan;
use App\Services\StripeService;

class SetupStripeProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:setup-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crear productos y precios en Stripe para los planes de suscripción';

    /**
     * Execute the console command.
     */
    public function handle(StripeService $stripeService)
    {
        $this->info('🔧 Configurando productos en Stripe...');
        $this->newLine();

        // Obtener planes que no son gratuitos
        $plans = SubscriptionPlan::where('slug', '!=', 'free')
            ->where('is_active', true)
            ->get();

        if ($plans->isEmpty()) {
            $this->warn('No hay planes de pago para configurar.');
            return Command::SUCCESS;
        }

        foreach ($plans as $plan) {
            $this->info("Procesando: {$plan->name}");

            try {
                $result = $stripeService->createProductAndPrices($plan);

                // Actualizar plan con los IDs de Stripe
                $plan->update([
                    'stripe_product_id' => $result['product']->id,
                    'stripe_price_id_monthly' => $result['price_monthly']?->id,
                    'stripe_price_id_yearly' => $result['price_yearly']?->id,
                ]);

                $this->line("  ✓ Producto creado: {$result['product']->id}");
                if ($result['price_monthly']) {
                    $this->line("  ✓ Precio mensual: {$result['price_monthly']->id}");
                }
                if ($result['price_yearly']) {
                    $this->line("  ✓ Precio anual: {$result['price_yearly']->id}");
                }
                $this->newLine();
            } catch (\Exception $e) {
                $this->error("  ✗ Error: {$e->getMessage()}");
                $this->newLine();
            }
        }

        $this->info('✅ Configuración de Stripe completada!');
        $this->newLine();

        $this->table(
            ['Plan', 'Producto ID', 'Precio Mensual', 'Precio Anual'],
            SubscriptionPlan::where('slug', '!=', 'free')
                ->where('is_active', true)
                ->get()
                ->map(function ($plan) {
                    return [
                        $plan->name,
                        $plan->stripe_product_id ?? 'N/A',
                        $plan->stripe_price_id_monthly ?? 'N/A',
                        $plan->stripe_price_id_yearly ?? 'N/A',
                    ];
                })
        );

        return Command::SUCCESS;
    }
}
