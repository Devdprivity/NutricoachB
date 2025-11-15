<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BarcodeController extends Controller
{
    /**
     * Buscar producto por código de barras usando OpenFoodFacts API
     */
    public function searchByBarcode(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string|min:8|max:13',
        ]);

        $barcode = $validated['barcode'];

        try {
            // Consultar API de OpenFoodFacts
            $response = Http::timeout(10)
                ->get("https://world.openfoodfacts.org/api/v2/product/{$barcode}.json");

            if (!$response->successful()) {
                return response()->json([
                    'found' => false,
                    'message' => 'No se pudo conectar con la base de datos de productos',
                ], 500);
            }

            $data = $response->json();

            // Verificar si el producto fue encontrado
            if (!isset($data['status']) || $data['status'] !== 1) {
                return response()->json([
                    'found' => false,
                    'message' => 'Producto no encontrado en la base de datos',
                ], 404);
            }

            $product = $data['product'];

            // Extraer información nutricional
            $nutritionalData = $this->extractNutritionalData($product);

            return response()->json([
                'found' => true,
                'product' => [
                    'barcode' => $barcode,
                    'name' => $product['product_name'] ?? 'Producto sin nombre',
                    'brand' => $product['brands'] ?? null,
                    'image_url' => $product['image_url'] ?? null,
                    'quantity' => $product['quantity'] ?? null,
                    'serving_size' => $product['serving_size'] ?? '100g',
                    'nutritional_data' => $nutritionalData,
                    'ingredients_text' => $product['ingredients_text'] ?? null,
                    'categories' => $product['categories'] ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error searching barcode: ' . $e->getMessage());

            return response()->json([
                'found' => false,
                'message' => 'Error al buscar el producto: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Extraer datos nutricionales del producto
     */
    private function extractNutritionalData(array $product): array
    {
        $nutriments = $product['nutriments'] ?? [];

        // OpenFoodFacts proporciona valores por 100g
        return [
            'calories' => $nutriments['energy-kcal_100g'] ?? $nutriments['energy-kcal'] ?? 0,
            'protein' => $nutriments['proteins_100g'] ?? $nutriments['proteins'] ?? 0,
            'carbs' => $nutriments['carbohydrates_100g'] ?? $nutriments['carbohydrates'] ?? 0,
            'fat' => $nutriments['fat_100g'] ?? $nutriments['fat'] ?? 0,
            'fiber' => $nutriments['fiber_100g'] ?? $nutriments['fiber'] ?? null,
            'sodium' => $nutriments['sodium_100g'] ?? $nutriments['sodium'] ?? null,
            'sugars' => $nutriments['sugars_100g'] ?? $nutriments['sugars'] ?? null,
            'saturated_fat' => $nutriments['saturated-fat_100g'] ?? $nutriments['saturated-fat'] ?? null,
        ];
    }

    /**
     * Buscar productos por texto (búsqueda general)
     */
    public function searchByText(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:3',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = $validated['query'];
        $page = $validated['page'] ?? 1;

        try {
            $response = Http::timeout(10)
                ->get('https://world.openfoodfacts.org/cgi/search.pl', [
                    'search_terms' => $query,
                    'search_simple' => 1,
                    'action' => 'process',
                    'json' => 1,
                    'page' => $page,
                    'page_size' => 20,
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo realizar la búsqueda',
                ], 500);
            }

            $data = $response->json();
            $products = [];

            foreach ($data['products'] ?? [] as $product) {
                $products[] = [
                    'barcode' => $product['code'] ?? null,
                    'name' => $product['product_name'] ?? 'Sin nombre',
                    'brand' => $product['brands'] ?? null,
                    'image_url' => $product['image_url'] ?? null,
                    'nutritional_data' => $this->extractNutritionalData($product),
                ];
            }

            return response()->json([
                'success' => true,
                'products' => $products,
                'count' => $data['count'] ?? 0,
                'page' => $page,
            ]);
        } catch (\Exception $e) {
            Log::error('Error searching products: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al buscar productos: ' . $e->getMessage(),
            ], 500);
        }
    }
}
