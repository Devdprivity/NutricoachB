<?php

namespace Database\Seeders;

use App\Models\FoodItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FoodItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $foods = [
            // Proteínas
            [
                'name' => 'Pechuga de pollo',
                'description' => 'Pechuga de pollo a la plancha',
                'category' => 'protein',
                'calories_per_100g' => 165,
                'protein_per_100g' => 31.0,
                'carbs_per_100g' => 0.0,
                'fat_per_100g' => 3.6,
                'fiber_per_100g' => 0.0,
                'sugar_per_100g' => 0.0,
                'sodium_per_100g' => 74.0,
                'is_cooked' => true,
                'cooking_method' => 'A la plancha',
                'tags' => ['healthy', 'high-protein', 'low-carb', 'low-fat'],
            ],
            [
                'name' => 'Huevos',
                'description' => 'Huevos cocidos',
                'category' => 'protein',
                'calories_per_100g' => 155,
                'protein_per_100g' => 13.0,
                'carbs_per_100g' => 1.1,
                'fat_per_100g' => 11.0,
                'fiber_per_100g' => 0.0,
                'sugar_per_100g' => 1.1,
                'sodium_per_100g' => 142.0,
                'is_cooked' => true,
                'cooking_method' => 'Cocidos',
                'tags' => ['healthy', 'high-protein', 'low-carb'],
            ],
            [
                'name' => 'Salmón',
                'description' => 'Salmón a la plancha',
                'category' => 'protein',
                'calories_per_100g' => 208,
                'protein_per_100g' => 25.4,
                'carbs_per_100g' => 0.0,
                'fat_per_100g' => 12.4,
                'fiber_per_100g' => 0.0,
                'sugar_per_100g' => 0.0,
                'sodium_per_100g' => 59.0,
                'is_cooked' => true,
                'cooking_method' => 'A la plancha',
                'tags' => ['healthy', 'high-protein', 'low-carb', 'omega-3'],
            ],

            // Carbohidratos
            [
                'name' => 'Arroz integral',
                'description' => 'Arroz integral cocido',
                'category' => 'carbohydrate',
                'calories_per_100g' => 111,
                'protein_per_100g' => 2.6,
                'carbs_per_100g' => 23.0,
                'fat_per_100g' => 0.9,
                'fiber_per_100g' => 1.8,
                'sugar_per_100g' => 0.4,
                'sodium_per_100g' => 5.0,
                'is_cooked' => true,
                'cooking_method' => 'Hervido',
                'tags' => ['healthy', 'high-fiber', 'whole-food'],
            ],
            [
                'name' => 'Batata',
                'description' => 'Batata asada',
                'category' => 'carbohydrate',
                'calories_per_100g' => 86,
                'protein_per_100g' => 1.6,
                'carbs_per_100g' => 20.1,
                'fat_per_100g' => 0.1,
                'fiber_per_100g' => 3.0,
                'sugar_per_100g' => 4.2,
                'sodium_per_100g' => 54.0,
                'is_cooked' => true,
                'cooking_method' => 'Asada',
                'tags' => ['healthy', 'high-fiber', 'whole-food', 'low-fat'],
            ],
            [
                'name' => 'Avena',
                'description' => 'Avena cocida',
                'category' => 'carbohydrate',
                'calories_per_100g' => 68,
                'protein_per_100g' => 2.4,
                'carbs_per_100g' => 12.0,
                'fat_per_100g' => 1.4,
                'fiber_per_100g' => 1.7,
                'sugar_per_100g' => 0.5,
                'sodium_per_100g' => 49.0,
                'is_cooked' => true,
                'cooking_method' => 'Hervida',
                'tags' => ['healthy', 'high-fiber', 'whole-food', 'low-fat'],
            ],

            // Grasas saludables
            [
                'name' => 'Aguacate',
                'description' => 'Aguacate fresco',
                'category' => 'fat',
                'calories_per_100g' => 160,
                'protein_per_100g' => 2.0,
                'carbs_per_100g' => 8.5,
                'fat_per_100g' => 14.7,
                'fiber_per_100g' => 6.7,
                'sugar_per_100g' => 0.7,
                'sodium_per_100g' => 7.0,
                'is_cooked' => false,
                'tags' => ['healthy', 'high-fiber', 'monounsaturated-fat'],
            ],
            [
                'name' => 'Almendras',
                'description' => 'Almendras naturales',
                'category' => 'fat',
                'calories_per_100g' => 579,
                'protein_per_100g' => 21.2,
                'carbs_per_100g' => 21.6,
                'fat_per_100g' => 49.9,
                'fiber_per_100g' => 12.5,
                'sugar_per_100g' => 4.4,
                'sodium_per_100g' => 1.0,
                'is_cooked' => false,
                'tags' => ['healthy', 'high-protein', 'high-fiber', 'monounsaturated-fat'],
            ],

            // Verduras
            [
                'name' => 'Brócoli',
                'description' => 'Brócoli al vapor',
                'category' => 'vegetable',
                'calories_per_100g' => 35,
                'protein_per_100g' => 2.4,
                'carbs_per_100g' => 7.2,
                'fat_per_100g' => 0.4,
                'fiber_per_100g' => 2.6,
                'sugar_per_100g' => 1.5,
                'sodium_per_100g' => 33.0,
                'is_cooked' => true,
                'cooking_method' => 'Al vapor',
                'tags' => ['healthy', 'low-calorie', 'high-fiber', 'vitamin-c'],
            ],
            [
                'name' => 'Espinacas',
                'description' => 'Espinacas frescas',
                'category' => 'vegetable',
                'calories_per_100g' => 23,
                'protein_per_100g' => 2.9,
                'carbs_per_100g' => 3.6,
                'fat_per_100g' => 0.4,
                'fiber_per_100g' => 2.2,
                'sugar_per_100g' => 0.4,
                'sodium_per_100g' => 79.0,
                'is_cooked' => false,
                'tags' => ['healthy', 'low-calorie', 'high-iron', 'vitamin-k'],
            ],

            // Suplementos
            [
                'name' => 'Proteína en polvo',
                'description' => 'Proteína de suero de leche',
                'category' => 'supplement',
                'calories_per_100g' => 370,
                'protein_per_100g' => 80.0,
                'carbs_per_100g' => 6.0,
                'fat_per_100g' => 5.0,
                'fiber_per_100g' => 0.0,
                'sugar_per_100g' => 3.0,
                'sodium_per_100g' => 200.0,
                'is_cooked' => false,
                'tags' => ['high-protein', 'supplement', 'post-workout'],
            ],
            [
                'name' => 'Creatina',
                'description' => 'Creatina monohidrato',
                'category' => 'supplement',
                'calories_per_100g' => 0,
                'protein_per_100g' => 0.0,
                'carbs_per_100g' => 0.0,
                'fat_per_100g' => 0.0,
                'fiber_per_100g' => 0.0,
                'sugar_per_100g' => 0.0,
                'sodium_per_100g' => 0.0,
                'is_cooked' => false,
                'tags' => ['supplement', 'pre-workout', 'performance'],
            ],
        ];

        foreach ($foods as $food) {
            FoodItem::create($food);
        }
    }
}