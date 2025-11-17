import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Apple, Camera, Clock, Heart, Loader2, Plus, Scan, Sparkles, Star, Trash2, Upload } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { NutritionSkeleton } from '@/components/skeletons/nutrition-skeleton';

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
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        document.addEventListener('inertia:start', handleStart);
        document.addEventListener('inertia:finish', handleFinish);

        return () => {
            document.removeEventListener('inertia:start', handleStart);
            document.removeEventListener('inertia:finish', handleFinish);
        };
    }, []);

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

            {isLoading ? (
                <NutritionSkeleton />
            ) : (
            <div className="flex flex-col gap-2 md:gap-6 p-3 md:p-6">
                {/* Header con título y botón de escáner */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Nutrición</h1>
                        <p className="text-xs md:text-base text-muted-foreground">
                            Registra tus comidas con IA
                        </p>
                    </div>
                    <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
                                <Scan className="h-4 w-4 md:h-5 md:w-5" />
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeDay(-1)}
                            className="text-xs sm:text-sm whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Día anterior</span>
                            <span className="sm:hidden">Anterior</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                handleDateFilterChange(
                                    new Date().toISOString().split('T')[0],
                                )
                            }
                            className="text-xs sm:text-sm"
                        >
                            Hoy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeDay(1)}
                            className="text-xs sm:text-sm whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">Día siguiente</span>
                            <span className="sm:hidden">Siguiente</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="date-filter" className="text-sm whitespace-nowrap">Fecha</Label>
                        <Input
                            id="date-filter"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateFilterChange(e.target.value)}
                            className="w-full sm:w-[180px] text-sm"
                        />
                    </div>
                </div>

                {/* Cards de usuario y próxima comida - Horizontal en mobile, vertical en desktop */}
                <div className="grid grid-cols-2 md:hidden gap-2">
                    {/* Card de usuario con avatar, nombre y hora */}
                    {auth?.user && (
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex flex-col items-center gap-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
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

                {/* Primera fila: Próxima comida pequeña y Grid principal */}
                <div className="flex gap-4 items-start">
                    {/* Columna izquierda: Cards pequeñas - Solo visible en desktop */}
                    <div className="hidden md:flex flex-col gap-4 w-[180px] flex-shrink-0">
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
                    <div className="grid gap-2 md:gap-6 lg:grid-cols-2 flex-1">
                        {/* Resumen del Día */}
                        {totals && goals && percentages && (
                        <Card>
                        <CardContent className="p-3 md:p-6">
                            {/* Calorías */}
                            <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xl md:text-2xl font-bold text-blue-600">
                                            {Math.round(totals.calories)} <span className="text-sm md:text-xl">kcal</span>
                                        </div>
                                        <p className="text-[10px] md:text-sm text-muted-foreground">
                                            de {goals.calories} kcal
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg md:text-xl font-bold">{percentages.calories}%</div>
                                        <p className="text-[10px] md:text-xs text-muted-foreground">Consumido</p>
                                    </div>
                                </div>
                                <Progress
                                    value={Math.min(percentages.calories, 100)}
                                    className="h-1.5 md:h-2"
                                />
                            </div>

                            {/* Macronutrientes */}
                            <div className="grid gap-2 md:gap-3 grid-cols-3">
                                {/* Proteína */}
                                <div className="space-y-1 md:space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] md:text-sm">Proteína</Label>
                                        <span className="text-[10px] md:text-sm font-medium">{percentages.protein}%</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] md:text-sm text-muted-foreground">
                                        <span>{Math.round(totals.protein)}g</span>
                                        <span>{goals.protein}g</span>
                                    </div>
                                    <Progress value={Math.min(percentages.protein, 100)} className="h-1 md:h-2" />
                                </div>

                                {/* Carbohidratos */}
                                <div className="space-y-1 md:space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] md:text-sm">Carbs</Label>
                                        <span className="text-[10px] md:text-sm font-medium">{percentages.carbs}%</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] md:text-sm text-muted-foreground">
                                        <span>{Math.round(totals.carbs)}g</span>
                                        <span>{goals.carbs}g</span>
                                    </div>
                                    <Progress value={Math.min(percentages.carbs, 100)} className="h-1 md:h-2" />
                                </div>

                                {/* Grasas */}
                                <div className="space-y-1 md:space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] md:text-sm">Grasas</Label>
                                        <span className="text-[10px] md:text-sm font-medium">{percentages.fat}%</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] md:text-sm text-muted-foreground">
                                        <span>{Math.round(totals.fat)}g</span>
                                        <span>{goals.fat}g</span>
                                    </div>
                                    <Progress value={Math.min(percentages.fat, 100)} className="h-1 md:h-2" />
                                </div>
                            </div>

                            {percentages.calories < 100 && (
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-0">
                                    Te faltan {Math.round(goals.calories - totals.calories)} kcal para tu meta
                                </p>
                            )}
                        </CardContent>
                        </Card>
                        )}

                        {/* Registrar Comida con IA */}
                        <Card>
                            <CardContent className="p-3 md:p-6">
                                <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
                                    <div className="grid gap-2 md:gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-1 md:space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs md:text-sm">Tipo</Label>
                                                <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-0.5">
                                                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                    Auto
                                                </span>
                                            </div>
                                            <Select value={mealType} onValueChange={setMealType}>
                                                <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(mealTypeLabels).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1 md:space-y-2">
                                            <Label htmlFor="meal-date" className="text-xs md:text-sm">Fecha</Label>
                                            <Input
                                                id="meal-date"
                                                type="date"
                                                value={mealDate}
                                                onChange={(e) => setMealDate(e.target.value)}
                                                disabled={isSubmitting}
                                                className="text-xs md:text-sm h-8 md:h-10"
                                            />
                                        </div>

                                        <div className="space-y-1 md:space-y-2">
                                            <Label htmlFor="meal-time" className="text-xs md:text-sm">Hora</Label>
                                            <Input
                                                id="meal-time"
                                                type="time"
                                                value={mealTime}
                                                onChange={(e) => setMealTime(e.target.value)}
                                                disabled={isSubmitting}
                                                className="text-xs md:text-sm h-8 md:h-10"
                                            />
                                        </div>

                                        <div className="space-y-1 md:space-y-2 sm:col-span-2 lg:col-span-3">
                                            <Label htmlFor="image" className="text-xs md:text-sm">Foto de la Comida</Label>
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                disabled={isSubmitting}
                                                onChange={handleImageChange}
                                                className="text-xs md:text-sm h-8 md:h-10"
                                            />
                                        </div>
                                    </div>

                                    {imagePreview && (
                                        <div className="space-y-1 md:space-y-2">
                                            <div className="flex justify-center">
                                                <div className="relative h-20 w-20 md:h-[100px] md:w-[100px] overflow-hidden rounded-lg border">
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
                                            className="h-8 md:h-10 text-xs md:text-sm"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Sparkles className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                                    <span className="hidden md:inline">Analizando con IA...</span>
                                                    <span className="md:hidden">Analizando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                    <span className="hidden md:inline">Subir y Analizar</span>
                                                    <span className="md:hidden">Analizar</span>
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
                {records.length > 0 && (
                <Card>
                    <CardContent className="p-3 md:p-6">
                        {/* Vista de cards para mobile */}
                        <div className="md:hidden space-y-2 md:space-y-3">
                                {records.map((record) => (
                                    <Card key={record.id} className="overflow-hidden">
                                        <CardContent className="p-2.5 md:p-3">
                                            <div className="flex gap-2 md:gap-3">
                                                {/* Imagen */}
                                                {record.image_path ? (
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border flex-shrink-0">
                                                        <img
                                                            src={record.image_url || (record.image_path.startsWith('http') ? record.image_path : `/storage/${record.image_path}`)}
                                                            alt="Meal"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                                        <Apple className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                                                    </div>
                                                )}

                                                {/* Contenido */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-1.5 md:gap-2 mb-1 md:mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                                                <span className="text-xs md:text-sm font-semibold">{mealTypeLabels[record.meal_type]}</span>
                                                                {record.ai_analyzed && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                                                        <Sparkles className="h-2.5 w-2.5" />
                                                                        IA
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{record.time}</p>
                                                        </div>
                                                        <div className="flex gap-1 flex-shrink-0">
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
                                                    </div>

                                                    {record.ai_description && (
                                                        <p className="text-[11px] md:text-xs font-medium mb-1 md:mb-2 line-clamp-2">
                                                            {record.ai_description}
                                                        </p>
                                                    )}
                                                    {record.food_items && (
                                                        <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 line-clamp-1">
                                                            {record.food_items}
                                                        </p>
                                                    )}

                                                    {/* Nutrientes */}
                                                    <div className="grid grid-cols-4 gap-1.5 md:gap-2 mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t">
                                                        <div className="text-center">
                                                            <p className="text-[11px] md:text-xs font-semibold">{Math.round(record.calories)}</p>
                                                            <p className="text-[9px] md:text-[10px] text-muted-foreground">kcal</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[11px] md:text-xs font-semibold">{Math.round(record.protein)}g</p>
                                                            <p className="text-[9px] md:text-[10px] text-muted-foreground">Prot</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[11px] md:text-xs font-semibold">{Math.round(record.carbs)}g</p>
                                                            <p className="text-[9px] md:text-[10px] text-muted-foreground">Carb</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[11px] md:text-xs font-semibold">{Math.round(record.fat)}g</p>
                                                            <p className="text-[9px] md:text-[10px] text-muted-foreground">Gras</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Vista de tabla para desktop */}
                            <div className="hidden md:block rounded-lg border overflow-hidden">
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
                    </CardContent>
                </Card>
                )}
            </div>
            )}
        </AppLayout>
    );
}
