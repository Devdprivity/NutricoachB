import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Apple, Camera, Clock, Heart, Loader2, Plus, Scan, Sparkles, Star, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Nutrición', href: '/nutrition' },
];

interface MealRecord {
    id: number;
    meal_type: string;
    time: string;
    image_path?: string;
    image_url?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    food_items?: string;
    ai_description?: string;
    ai_analyzed: boolean;
}

interface FavoriteMeal {
    id: number;
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    portion_size?: string;
    meal_type?: string;
    image_url?: string;
    times_used: number;
}

interface BarcodeProduct {
    barcode: string;
    name: string;
    brand?: string;
    image_url?: string;
    quantity?: string;
    serving_size: string;
    nutritional_data: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        sodium?: number;
        sugars?: number;
        saturated_fat?: number;
    };
    ingredients_text?: string;
    categories?: string;
}

interface NutritionData {
    today_records: MealRecord[];
    today_totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    goals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    percentages: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    next_meal?: {
        type: string;
        label: string;
        hour: number;
    };
    favorite_meals?: FavoriteMeal[];
}

export default function Nutrition({ nutritionData }: { nutritionData?: NutritionData }) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mealType, setMealType] = useState('breakfast');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Barcode scanner state
    const [barcodeInput, setBarcodeInput] = useState('');
    const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
    const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);
    const [servingAmount, setServingAmount] = useState('100');

    const totals = nutritionData?.today_totals;
    const goals = nutritionData?.goals;
    const percentages = nutritionData?.percentages;
    const records = nutritionData?.today_records || [];
    const nextMeal = nutritionData?.next_meal;
    const favoriteMeals = nutritionData?.favorite_meals || [];

    const handleUseFavorite = (favorite: FavoriteMeal) => {
        router.post(`/favorite-meals/${favorite.id}/use`, {
            meal_type: mealType,
        }, {
            onSuccess: () => {
                // Se recargará la página automáticamente
            },
        });
    };

    const handleSaveAsFavorite = (mealId: number) => {
        router.post(`/favorite-meals/from-meal/${mealId}`, {}, {
            onSuccess: () => {
                alert('Comida guardada como favorita');
            },
        });
    };

    const handleBarcodeSearch = async () => {
        if (!barcodeInput.trim()) return;

        setIsSearchingBarcode(true);
        setBarcodeError(null);
        setBarcodeProduct(null);

        try {
            const response = await axios.post('/barcode/search', {
                barcode: barcodeInput.trim(),
            });

            if (response.data.found) {
                setBarcodeProduct(response.data.product);
            } else {
                setBarcodeError(response.data.message || 'Producto no encontrado');
            }
        } catch (error: any) {
            setBarcodeError(error.response?.data?.message || 'Error al buscar el producto');
        } finally {
            setIsSearchingBarcode(false);
        }
    };

    const handleAddBarcodeProduct = () => {
        if (!barcodeProduct) return;

        const servingMultiplier = parseFloat(servingAmount) / 100;
        const nutritional = barcodeProduct.nutritional_data;

        const formData = new FormData();
        formData.append('meal_type', mealType);
        formData.append('time', new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
        formData.append('date', new Date().toISOString().split('T')[0]);
        formData.append('calories', String(Math.round(nutritional.calories * servingMultiplier)));
        formData.append('protein', String(Math.round(nutritional.protein * servingMultiplier)));
        formData.append('carbs', String(Math.round(nutritional.carbs * servingMultiplier)));
        formData.append('fat', String(Math.round(nutritional.fat * servingMultiplier)));
        if (nutritional.fiber) {
            formData.append('fiber', String(Math.round(nutritional.fiber * servingMultiplier)));
        }
        formData.append('notes', `${barcodeProduct.name}${barcodeProduct.brand ? ' - ' + barcodeProduct.brand : ''} (${servingAmount}g)`);

        router.post('/nutrition', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setBarcodeInput('');
                setBarcodeProduct(null);
                setServingAmount('100');
            },
        });
    };

    const handleDeleteRecord = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            router.delete(`/nutrition/${id}`);
        }
    };

    const mealTypeLabels: Record<string, string> = {
        breakfast: 'Desayuno',
        morning_snack: 'Colación Matutina',
        lunch: 'Almuerzo',
        afternoon_snack: 'Colación Vespertina',
        dinner: 'Cena',
        evening_snack: 'Colación Nocturna',
        other: 'Otro',
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedImage) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('meal_type', mealType);
        formData.append('time', new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
        formData.append('date', new Date().toISOString().split('T')[0]);

        router.post('/nutrition', formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedImage(null);
                setImagePreview(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nutrición" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nutrición</h1>
                    <p className="text-muted-foreground">
                        Registra tus comidas con fotos y sigue tu progreso nutricional con IA
                    </p>
                </div>

                {/* Alerta de próxima comida */}
                {nextMeal && (
                    <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                    Próxima comida sugerida: {nextMeal.label}
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Horario recomendado: {nextMeal.hour}:00
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Resumen del Día */}
                {totals && goals && percentages && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen Nutricional de Hoy</CardTitle>
                            <CardDescription>Comparación con tus objetivos diarios</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Calorías */}
                            <div className="space-y-2">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {Math.round(totals.calories)} kcal
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            de {goals.calories} kcal
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">{percentages.calories}%</div>
                                        <p className="text-xs text-muted-foreground">Consumido</p>
                                    </div>
                                </div>
                                <Progress
                                    value={Math.min(percentages.calories, 100)}
                                    className="h-2"
                                />
                            </div>

                            {/* Macronutrientes */}
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Proteína */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Proteína</Label>
                                        <span className="text-sm font-medium">{percentages.protein}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{Math.round(totals.protein)}g</span>
                                        <span>{goals.protein}g</span>
                                    </div>
                                    <Progress value={Math.min(percentages.protein, 100)} className="h-2" />
                                </div>

                                {/* Carbohidratos */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Carbohidratos</Label>
                                        <span className="text-sm font-medium">{percentages.carbs}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{Math.round(totals.carbs)}g</span>
                                        <span>{goals.carbs}g</span>
                                    </div>
                                    <Progress value={Math.min(percentages.carbs, 100)} className="h-2" />
                                </div>

                                {/* Grasas */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Grasas</Label>
                                        <span className="text-sm font-medium">{percentages.fat}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{Math.round(totals.fat)}g</span>
                                        <span>{goals.fat}g</span>
                                    </div>
                                    <Progress value={Math.min(percentages.fat, 100)} className="h-2" />
                                </div>
                            </div>

                            {percentages.calories < 100 && (
                                <p className="text-sm text-muted-foreground">
                                    Te faltan {Math.round(goals.calories - totals.calories)} kcal para tu meta
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Comidas Favoritas */}
                {favoriteMeals.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Comidas Favoritas
                            </CardTitle>
                            <CardDescription>
                                Registro rápido de tus comidas más frecuentes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {favoriteMeals.map((favorite) => (
                                    <div
                                        key={favorite.id}
                                        className="flex gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => handleUseFavorite(favorite)}
                                    >
                                        {favorite.image_url && (
                                            <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border">
                                                <img
                                                    src={favorite.image_url}
                                                    alt={favorite.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold truncate">{favorite.name}</h4>
                                                    {favorite.description && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {favorite.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="ml-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUseFavorite(favorite);
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs">
                                                <span><strong>{Math.round(favorite.calories)}</strong> kcal</span>
                                                <span><strong>{Math.round(favorite.protein)}</strong>g P</span>
                                                <span><strong>{Math.round(favorite.carbs)}</strong>g C</span>
                                                <span><strong>{Math.round(favorite.fat)}</strong>g G</span>
                                            </div>
                                            {favorite.times_used > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Usado {favorite.times_used} {favorite.times_used === 1 ? 'vez' : 'veces'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Escáner de Códigos de Barras */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scan className="h-5 w-5" />
                            Escanear Código de Barras
                        </CardTitle>
                        <CardDescription>
                            Busca productos por código de barras y registra su información nutricional
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Ingresa el código de barras (8-13 dígitos)"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                                    disabled={isSearchingBarcode}
                                />
                            </div>
                            <Button
                                onClick={handleBarcodeSearch}
                                disabled={isSearchingBarcode || !barcodeInput.trim()}
                            >
                                {isSearchingBarcode ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Scan className="mr-2 h-4 w-4" />
                                        Buscar
                                    </>
                                )}
                            </Button>
                        </div>

                        {barcodeError && (
                            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                                {barcodeError}
                            </div>
                        )}

                        {barcodeProduct && (
                            <div className="border rounded-lg p-4 space-y-4">
                                <div className="flex gap-4">
                                    {barcodeProduct.image_url && (
                                        <div className="flex-shrink-0 w-24 h-24 rounded overflow-hidden border">
                                            <img
                                                src={barcodeProduct.image_url}
                                                alt={barcodeProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{barcodeProduct.name}</h3>
                                        {barcodeProduct.brand && (
                                            <p className="text-sm text-muted-foreground">{barcodeProduct.brand}</p>
                                        )}
                                        {barcodeProduct.quantity && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Cantidad: {barcodeProduct.quantity}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Calorías</p>
                                        <p className="text-lg font-semibold">
                                            {Math.round(barcodeProduct.nutritional_data.calories)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">kcal</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Proteína</p>
                                        <p className="text-lg font-semibold">
                                            {Math.round(barcodeProduct.nutritional_data.protein)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">g</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Carbohidratos</p>
                                        <p className="text-lg font-semibold">
                                            {Math.round(barcodeProduct.nutritional_data.carbs)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">g</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Grasas</p>
                                        <p className="text-lg font-semibold">
                                            {Math.round(barcodeProduct.nutritional_data.fat)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">g</p>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    Valores nutricionales por {barcodeProduct.serving_size}
                                </div>

                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label htmlFor="serving-amount">Cantidad consumida (g)</Label>
                                        <Input
                                            id="serving-amount"
                                            type="number"
                                            min="1"
                                            value={servingAmount}
                                            onChange={(e) => setServingAmount(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleAddBarcodeProduct} className="flex-shrink-0">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar a {mealTypeLabels[mealType]}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Registrar Comida */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Registrar Comida con IA
                        </CardTitle>
                        <CardDescription>
                            Sube una foto de tu comida y la IA analizará sus valores nutricionales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Tipo de Comida</Label>
                                    <Select value={mealType} onValueChange={setMealType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(mealTypeLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Foto de la Comida</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        disabled={isSubmitting}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {imagePreview && (
                                <div className="space-y-2">
                                    <Label>Vista Previa</Label>
                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={!selectedImage || isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        Analizando con IA...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Subir y Analizar
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Registros de Hoy */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comidas de Hoy</CardTitle>
                        <CardDescription>Historial de consumo del día</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <div className="text-center py-12">
                                <Apple className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No has registrado comidas hoy
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {record.image_path && (
                                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border">
                                                <img
                                                    src={record.image_url || `/storage/${record.image_path}`}
                                                    alt="Meal"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">
                                                            {mealTypeLabels[record.meal_type]}
                                                        </h3>
                                                        {record.ai_analyzed && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                                <Sparkles className="h-3 w-3" />
                                                                IA
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {record.time}
                                                    </p>
                                                    {record.ai_description && (
                                                        <p className="text-sm mt-1">
                                                            {record.ai_description}
                                                        </p>
                                                    )}
                                                    {record.food_items && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {record.food_items}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleSaveAsFavorite(record.id)}
                                                        title="Guardar como favorito"
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteRecord(record.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Calorías</p>
                                                    <p className="font-semibold">{Math.round(record.calories)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Proteína</p>
                                                    <p className="font-semibold">{Math.round(record.protein)}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Carbos</p>
                                                    <p className="font-semibold">{Math.round(record.carbs)}g</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Grasas</p>
                                                    <p className="font-semibold">{Math.round(record.fat)}g</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
