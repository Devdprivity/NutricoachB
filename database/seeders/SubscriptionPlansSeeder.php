<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Plan gratuito con funciones básicas',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'features' => [
                    'Registro de nutrición básico',
                    'Seguimiento de hidratación',
                    '5 recetas',
                    '2 planes de entrenamiento',
                    '1 plan de comidas',
                ],
                'max_recipes' => 5,
                'max_workout_plans' => 2,
                'max_meal_plans' => 1,
                'ai_coaching' => false,
                'progress_analytics' => false,
                'custom_recipes' => false,
                'export_data' => false,
                'priority_support' => false,
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Para usuarios que quieren más funciones',
                'price_monthly' => 9.99,
                'price_yearly' => 99.00,
                'features' => [
                    'Todo lo del plan Free',
                    '50 recetas personalizadas',
                    '10 planes de entrenamiento',
                    '5 planes de comidas semanales',
                    'Análisis de progreso básico',
                    'Exportar datos',
                ],
                'max_recipes' => 50,
                'max_workout_plans' => 10,
                'max_meal_plans' => 5,
                'ai_coaching' => false,
                'progress_analytics' => true,
                'custom_recipes' => true,
                'export_data' => true,
                'priority_support' => false,
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Plan completo con todas las funciones',
                'price_monthly' => 19.99,
                'price_yearly' => 199.00,
                'features' => [
                    'Todo lo del plan Basic',
                    'Recetas ilimitadas',
                    'Planes de entrenamiento ilimitados',
                    'Planes de comidas ilimitados',
                    'Coach AI personalizado',
                    'Análisis avanzado de progreso',
                    'Soporte prioritario',
                    'Acceso a comunidad premium',
                ],
                'max_recipes' => null,
                'max_workout_plans' => null,
                'max_meal_plans' => null,
                'ai_coaching' => true,
                'progress_analytics' => true,
                'custom_recipes' => true,
                'export_data' => true,
                'priority_support' => true,
                'is_active' => true,
                'order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
