import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Apple, Camera, Clock, Heart, Loader2, Plus, Scan, Sparkles, Star, Trash2, Upload } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
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
    selected_date: string;
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
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Fecha seleccionada para la vista completa (filtro de día)
    const initialSelectedDate =
        nutritionData?.selected_date || new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(initialSelectedDate);

    // Fecha y hora de la comida a registrar (por defecto, fecha seleccionada)
    const [mealDate, setMealDate] = useState(initialSelectedDate);
    const [mealTime, setMealTime] = useState(
        new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        }),
    );
    
    // Determinar automáticamente el tipo de comida basándose en la hora actual
    const getMealTypeByTime = (): string => {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Rangos de horas para cada tipo de comida
        if (currentHour >= 5 && currentHour < 10) {
            return 'breakfast'; // 5:00 - 9:59
        } else if (currentHour >= 10 && currentHour < 12) {
            return 'morning_snack'; // 10:00 - 11:59
        } else if (currentHour >= 12 && currentHour < 15) {
            return 'lunch'; // 12:00 - 14:59
        } else if (currentHour >= 15 && currentHour < 18) {
            return 'afternoon_snack'; // 15:00 - 17:59
        } else if (currentHour >= 18 && currentHour < 21) {
            return 'dinner'; // 18:00 - 20:59
        } else if (currentHour >= 21 || currentHour < 5) {
            return 'evening_snack'; // 21:00 - 4:59
        }
        
        return 'breakfast'; // Default
    };
    
    const [mealType, setMealType] = useState(() => getMealTypeByTime());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Actualizar hora cada minuto
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Actualizar cada minuto

        return () => clearInterval(interval);
    }, []);

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

    const handleDateFilterChange = (date: string) => {
        setSelectedDate(date);
        setMealDate(date);
        router.get(
            '/nutrition',
            { date },
            {
                preserveScroll: true,
            },
        );
    };

    const handleChangeDay = (offset: number) => {
        const dateObj = new Date(selectedDate);
        dateObj.setDate(dateObj.getDate() + offset);
        const newDate = dateObj.toISOString().split('T')[0];
        handleDateFilterChange(newDate);
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
        formData.append('time', mealTime);
        formData.append('date', mealDate);
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
        formData.append('time', mealTime);
        formData.append('date', mealDate);

        router.post('/nutrition', formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setSelectedImage(null);
                setImagePreview(null);
            },
        });
    };

    const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nutrición" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header con título y botón de escáner */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Nutrición</h1>
                        <p className="text-muted-foreground">
                            Registra tus comidas con fotos y sigue tu progreso nutricional con IA
                        </p>
                    </div>
                    <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10">
                                <Scan className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Scan className="h-5 w-5" />
                                    Escanear Código de Barras
                                </DialogTitle>
                                <DialogDescription>
                                    Busca productos por código de barras y registra su información nutricional
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
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
                                            <Button onClick={() => {
                                                handleAddBarcodeProduct();
                                                setIsBarcodeDialogOpen(false);
                                            }} className="flex-shrink-0">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Agregar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filtro de fecha para toda la vista */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeDay(-1)}
                        >
                            Día anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                handleDateFilterChange(
                                    new Date().toISOString().split('T')[0],
                                )
                            }
                        >
                            Hoy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeDay(1)}
                        >
                            Día siguiente
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="date-filter">Fecha</Label>
                        <Input
                            id="date-filter"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateFilterChange(e.target.value)}
                            className="w-[180px]"
                        />
                    </div>
                </div>

                {/* Primera fila: Próxima comida pequeña y Grid principal */}
                <div className="flex gap-4 items-start">
                    {/* Columna izquierda: Cards pequeñas */}
                    <div className="flex flex-col gap-4 w-[180px] flex-shrink-0">
                        {/* Card de usuario con avatar, nombre y hora */}
                        {auth?.user && (
                            <Card>
                                <CardContent className="p-3">
                                    <div className="flex flex-col items-center gap-2">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-center">
                                            <p className="text-xs font-semibold truncate w-full" title={auth.user.name}>
                                                {auth.user.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tarjeta pequeña de próxima comida */}
                        {nextMeal && (
                            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                                <CardContent className="p-3">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <div className="text-center">
                                            <p className="text-[10px] font-medium text-blue-900 dark:text-blue-100 uppercase tracking-wide">
                                                Próxima
                                            </p>
                                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                                                {nextMeal.label}
                                            </p>
                                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                                                {nextMeal.hour}:00
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Grid principal: Resumen Nutricional y Registrar Comida */}
                    <div className="grid gap-6 md:grid-cols-2 flex-1">
                        {/* Resumen del Día */}
                        {totals && goals && percentages && (
                        <Card>
                        <CardHeader>
                            <CardTitle>
                                Resumen Nutricional del Día
                            </CardTitle>
                            <CardDescription>
                                {formattedSelectedDate} · Comparación con tus objetivos diarios
                            </CardDescription>
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

                        {/* Registrar Comida con IA */}
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
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Tipo de Comida</Label>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Auto
                                                </span>
                                            </div>
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
                                            <Label htmlFor="meal-date">Fecha de la comida</Label>
                                            <Input
                                                id="meal-date"
                                                type="date"
                                                value={mealDate}
                                                onChange={(e) => setMealDate(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="meal-time">Hora de la comida</Label>
                                            <Input
                                                id="meal-time"
                                                type="time"
                                                value={mealTime}
                                                onChange={(e) => setMealTime(e.target.value)}
                                                disabled={isSubmitting}
                                            />
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
                                            <div className="flex justify-center">
                                                <div className="relative h-[100px] w-[100px] overflow-hidden rounded-lg border">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <Button
                                            type="submit"
                                            disabled={!selectedImage || isSubmitting}
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
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Registros del día - Tabla Moderna */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comidas del día</CardTitle>
                        <CardDescription>
                            {formattedSelectedDate} · Historial de consumo del día
                        </CardDescription>
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
                            <div className="rounded-lg border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Imagen</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Tipo</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Descripción</th>
                                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Calorías</th>
                                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Proteína</th>
                                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Carbos</th>
                                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Grasas</th>
                                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Hora</th>
                                                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((record) => (
                                                <tr key={record.id} className="border-b transition-colors hover:bg-muted/30">
                                                    <td className="p-3">
                                                        {record.image_path ? (
                                                            <div className="w-12 h-12 rounded-md overflow-hidden border">
                                                                <img
                                                                    src={record.image_url || (record.image_path.startsWith('http') ? record.image_path : `/storage/${record.image_path}`)}
                                                                    alt="Meal"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                                                                <Apple className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{mealTypeLabels[record.meal_type]}</span>
                                                            {record.ai_analyzed && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                                    <Sparkles className="h-2.5 w-2.5" />
                                                                    IA
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="max-w-xs">
                                                            {record.ai_description && (
                                                                <p className="text-sm font-medium truncate" title={record.ai_description}>
                                                                    {record.ai_description}
                                                                </p>
                                                            )}
                                                            {record.food_items && (
                                                                <p className="text-xs text-muted-foreground truncate" title={record.food_items}>
                                                                    {record.food_items}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-sm font-semibold">{Math.round(record.calories)}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">kcal</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-sm font-semibold">{Math.round(record.protein)}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">g</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-sm font-semibold">{Math.round(record.carbs)}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">g</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-sm font-semibold">{Math.round(record.fat)}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">g</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-xs text-muted-foreground">{record.time}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => handleSaveAsFavorite(record.id)}
                                                                title="Guardar como favorito"
                                                            >
                                                                <Heart className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => handleDeleteRecord(record.id)}
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
