<?php

namespace Database\Seeders;

use App\Models\MealPlan;
use App\Models\User;
use App\Models\FoodItem;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MealPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios y alimentos existentes
        $users = User::all();
        $foodItems = FoodItem::all();

        if ($users->isEmpty()) {
            $this->command->info('No hay usuarios en la base de datos.');
            return;
        }

        if ($foodItems->isEmpty()) {
            $this->command->info('No hay alimentos en la base de datos. Ejecuta primero FoodItemSeeder.');
            return;
        }

        $mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        $mealDistributions = [
            'breakfast' => ['proteina', 'carbohidrato'],
            'lunch' => ['proteina', 'carbohidrato', 'verdura'],
            'dinner' => ['proteina', 'verdura', 'grasa'],
            'snack' => ['proteina', 'fruta']
        ];

        foreach ($users as $user) {
            // Crear planes para los próximos 7 días
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::now()->addDays($i);
                
                foreach ($mealTypes as $mealType) {
                    $categories = $mealDistributions[$mealType];
                    
                    foreach ($categories as $category) {
                        // Buscar alimentos de la categoría
                        $categoryFoods = $foodItems->where('category', $category);
                        
                        if ($categoryFoods->isNotEmpty()) {
                            $foodItem = $categoryFoods->random();
                            $quantity = $this->getQuantityForMeal($mealType, $category);
                            
                            $nutrition = $foodItem->calculateNutrition($quantity);
                            
                            MealPlan::create([
                                'user_id' => $user->id,
                                'date' => $date->toDateString(),
                                'meal_type' => $mealType,
                                'food_item_id' => $foodItem->id,
                                'planned_quantity' => $quantity,
                                'planned_unit' => 'g',
                                'planned_calories' => $nutrition['calories'],
                                'planned_protein' => $nutrition['protein'],
                                'planned_carbs' => $nutrition['carbs'],
                                'planned_fat' => $nutrition['fats'],
                                'is_completed' => rand(1, 100) <= 70, // 70% de probabilidad de completado
                                'completed_at' => rand(1, 100) <= 70 ? Carbon::now()->subHours(rand(1, 8)) : null,
                                'notes' => 'Plan generado automáticamente'
                            ]);
                        }
                    }
                }
            }
        }

        $this->command->info('Planes de comida creados exitosamente.');
    }

    /**
     * Obtener cantidad sugerida según el tipo de comida y categoría
     */
    private function getQuantityForMeal(string $mealType, string $category): int
    {
        $quantities = [
            'breakfast' => [
                'proteina' => rand(80, 120),
                'carbohidrato' => rand(100, 150),
                'verdura' => rand(50, 100),
                'grasa' => rand(20, 40),
                'fruta' => rand(100, 200)
            ],
            'lunch' => [
                'proteina' => rand(120, 180),
                'carbohidrato' => rand(150, 200),
                'verdura' => rand(100, 150),
                'grasa' => rand(30, 50),
                'fruta' => rand(100, 200)
            ],
            'dinner' => [
                'proteina' => rand(100, 150),
                'carbohidrato' => rand(80, 120),
                'verdura' => rand(100, 150),
                'grasa' => rand(20, 40),
                'fruta' => rand(100, 200)
            ],
            'snack' => [
                'proteina' => rand(50, 100),
                'carbohidrato' => rand(50, 100),
                'verdura' => rand(50, 100),
                'grasa' => rand(15, 30),
                'fruta' => rand(100, 200)
            ]
        ];

        return $quantities[$mealType][$category] ?? 100;
    }
}