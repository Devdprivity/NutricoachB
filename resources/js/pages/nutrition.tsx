import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Apple, Camera, Clock, Sparkles, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

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
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    food_items?: string;
    ai_description?: string;
    ai_analyzed: boolean;
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
}

export default function Nutrition({ nutritionData }: { nutritionData?: NutritionData }) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mealType, setMealType] = useState('breakfast');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totals = nutritionData?.today_totals;
    const goals = nutritionData?.goals;
    const percentages = nutritionData?.percentages;
    const records = nutritionData?.today_records || [];
    const nextMeal = nutritionData?.next_meal;

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

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro de comida?')) {
            router.delete(`/nutrition/${id}`, { preserveScroll: true });
        }
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
                                                    src={`/storage/${record.image_path}`}
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
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
