import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    TrendingUp,
    Target,
    Calendar,
    Activity,
    Apple,
    Droplet,
    CheckCircle2,
    AlertCircle,
    Info,
    Dumbbell,
    Heart,
    Scale,
    Camera,
    Upload,
    Trash2,
    Flag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProgressSkeleton } from '@/components/skeletons/progress-skeleton';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Progreso', href: '/progress' },
];

interface ProgressData {
    profileData?: {
        weight?: number;
        target_weight?: number;
        target_date?: string;
        age?: number;
        height?: number;
        gender?: string;
        bmi?: number;
        bmi_category?: string;
        medical_conditions?: string;
        dietary_restrictions?: string;
        is_medically_supervised?: boolean;
        body_frame?: string;
        body_type?: string;
        body_fat_percentage?: number;
        muscle_mass_percentage?: number;
    };
    weightProgress?: {
        current: number;
        target: number;
        difference: number;
        percentage: number;
        is_achieved: boolean;
        days_remaining?: number;
    };
    exerciseHistory?: Array<{
        id: number;
        date: string;
        exercise_name: string;
        duration_minutes: number;
        calories_burned: number;
        sets?: number;
        reps?: number;
        weight_kg?: number;
    }>;
    exerciseSummary?: {
        total_days: number;
        total_calories_burned: number;
        total_duration_minutes: number;
        average_per_week: number;
    };
    nutritionHistory?: Array<{
        date: string;
        total_calories: number;
        total_protein: number;
        total_carbs: number;
        total_fat: number;
        meals_count: number;
    }>;
    nutritionSummary?: {
        total_calories: number;
        total_protein: number;
        total_carbs: number;
        total_fat: number;
        average_daily_calories: number;
        days_tracked: number;
        goal_compliance: {
            compliant_days: number;
            total_days: number;
            percentage: number;
        };
    };
    contextHistory?: Array<{
        id: number;
        date: string;
        special_day_type?: string;
        stress_level?: number;
        emotional_state?: string;
        sleep_hours?: number;
        notes?: string;
    }>;
    contextSummary?: {
        total_days: number;
        average_stress: number;
        average_sleep: number;
        special_days_count: number;
    };
    hydrationSummary?: {
        total_ml: number;
        average_daily_ml: number;
        goal_compliance: {
            compliant_days: number;
            total_days: number;
            percentage: number;
        };
    };
    progressPhotos?: Array<{
        id: number;
        date: string;
        image_url: string;
        weight?: number;
        body_fat_percentage?: number;
        measurements?: Record<string, number>;
        notes?: string;
        is_baseline: boolean;
        visibility: string;
        days_since_baseline?: number;
        weight_change?: number;
    }>;
    progressPhotosSummary?: {
        total_photos: number;
        baseline_photo?: {
            id: number;
            date: string;
            image_url: string;
            weight?: number;
        };
        latest_photo?: {
            id: number;
            date: string;
            image_url: string;
            weight?: number;
            weight_change?: number;
        };
        total_weight_change?: number;
    };
    error?: string;
}

export default function ProgressPage() {
    const { progressData } = usePage<{ progressData: ProgressData }>().props;
    const data = progressData || {};

    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [compareMode, setCompareMode] = useState(false);

    // Initial load
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // Navigation events
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

    if (data.error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Progreso" />
                <div className="flex flex-col gap-6 p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{data.error}</AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    const profile = data.profileData;
    const weightProgress = data.weightProgress;
    const exerciseSummary = data.exerciseSummary;
    const nutritionSummary = data.nutritionSummary;
    const contextSummary = data.contextSummary;
    const hydrationSummary = data.hydrationSummary;
    const progressPhotos = data.progressPhotos || [];
    const photosSummary = data.progressPhotosSummary;

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

    const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedImage) return;

        setIsUploading(true);
        const formData = new FormData(e.currentTarget);

        router.post('/progress/photos', formData, {
            onSuccess: () => {
                setShowUploadDialog(false);
                setSelectedImage(null);
                setImagePreview(null);
                setIsUploading(false);
            },
            onError: () => {
                setIsUploading(false);
            },
        });
    };

    const handleDelete = (photoId: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta foto?')) {
            router.delete(`/progress/photos/${photoId}`);
        }
    };

    const handleSetBaseline = (photoId: number) => {
        router.post(`/progress/photos/${photoId}/baseline`, {});
    };

    const getBMIBadge = (category?: string) => {
        const badges = {
            underweight: { label: 'Bajo peso', variant: 'secondary' as const },
            normal: { label: 'Normal', variant: 'default' as const },
            overweight: { label: 'Sobrepeso', variant: 'destructive' as const },
            obese: { label: 'Obesidad', variant: 'destructive' as const },
        };
        return category ? badges[category as keyof typeof badges] : null;
    };

    const bmiBadge = getBMIBadge(profile?.bmi_category);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progreso" />

            {isLoading ? (
                <ProgressSkeleton />
            ) : (
                <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Progreso</h1>
                    <p className="text-muted-foreground">
                        Visualiza tu evolución completa y estadísticas
                    </p>
                </div>

                {/* Progreso de Peso y Objetivo */}
                {weightProgress && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Progreso hacia el Objetivo de Peso
                            </CardTitle>
                            <CardDescription>
                                {weightProgress.is_achieved 
                                    ? '¡Felicidades! Has alcanzado tu objetivo' 
                                    : `Te faltan ${Math.abs(weightProgress.difference).toFixed(1)} kg para tu objetivo`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {weightProgress.current} kg
                                    </div>
                                    <p className="text-sm text-muted-foreground">Peso Actual</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {weightProgress.target} kg
                                    </div>
                                    <p className="text-sm text-muted-foreground">Peso Objetivo</p>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${weightProgress.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {weightProgress.difference > 0 ? '+' : ''}{weightProgress.difference.toFixed(1)} kg
                                    </div>
                                    <p className="text-sm text-muted-foreground">Diferencia</p>
                                </div>
                            </div>
                            <ProgressBar value={Math.min(weightProgress.percentage, 100)} className="h-3" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {weightProgress.percentage.toFixed(1)}% del objetivo
                                </span>
                                {weightProgress.days_remaining !== null && (
                                    <span className="text-muted-foreground">
                                        {weightProgress.days_remaining} días restantes
                                    </span>
                                )}
                            </div>
                            {weightProgress.is_achieved && (
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        ¡Has alcanzado tu objetivo de peso! Mantén este logro.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Información del Perfil y Datos Médicos */}
                {profile && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scale className="h-5 w-5" />
                                    Datos Personales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Edad:</span>
                                    <span className="font-medium">{profile.age || 'No especificada'} años</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Altura:</span>
                                    <span className="font-medium">{profile.height || 'No especificada'} cm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Peso:</span>
                                    <span className="font-medium">{profile.weight || 'No especificado'} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Género:</span>
                                    <span className="font-medium capitalize">{profile.gender || 'No especificado'}</span>
                                </div>
                                {profile.bmi && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">IMC:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{profile.bmi}</span>
                                            {bmiBadge && (
                                                <Badge variant={bmiBadge.variant}>{bmiBadge.label}</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {profile.body_fat_percentage && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Grasa Corporal:</span>
                                        <span className="font-medium">{profile.body_fat_percentage}%</span>
                                    </div>
                                )}
                                {profile.muscle_mass_percentage && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Masa Muscular:</span>
                                        <span className="font-medium">{profile.muscle_mass_percentage}%</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Información Médica
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {profile.is_medically_supervised && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                            Estás bajo supervisión médica
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {profile.medical_conditions ? (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Condiciones Médicas:</span>
                                        <p className="text-sm">{profile.medical_conditions}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay condiciones médicas registradas</p>
                                )}
                                {profile.dietary_restrictions ? (
                                    <div>
                                        <span className="text-muted-foreground block mb-1">Restricciones Dietéticas:</span>
                                        <p className="text-sm">{profile.dietary_restrictions}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay restricciones dietéticas registradas</p>
                                )}
                                {profile.body_frame && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contextura:</span>
                                        <span className="font-medium capitalize">{profile.body_frame}</span>
                                    </div>
                                )}
                                {profile.body_type && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tipo de Cuerpo:</span>
                                        <span className="font-medium capitalize">{profile.body_type}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Resumen de Ejercicios */}
                {exerciseSummary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Dumbbell className="h-5 w-5" />
                                Resumen de Ejercicios (Últimos 30 días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {exerciseSummary.total_days}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Días de Ejercicio</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {exerciseSummary.total_calories_burned.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Calorías Quemadas</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {Math.round(exerciseSummary.total_duration_minutes / 60)}h
                                    </div>
                                    <p className="text-sm text-muted-foreground">Tiempo Total</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {exerciseSummary.average_per_week.toFixed(1)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Promedio/Semana</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Resumen Nutricional */}
                {nutritionSummary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Apple className="h-5 w-5" />
                                Resumen Nutricional (Últimos 30 días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {nutritionSummary.average_daily_calories.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Calorías/Día (Promedio)</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {nutritionSummary.total_protein.toFixed(0)}g
                                    </div>
                                    <p className="text-sm text-muted-foreground">Proteína Total</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {nutritionSummary.total_carbs.toFixed(0)}g
                                    </div>
                                    <p className="text-sm text-muted-foreground">Carbohidratos Total</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {nutritionSummary.total_fat.toFixed(0)}g
                                    </div>
                                    <p className="text-sm text-muted-foreground">Grasas Total</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Cumplimiento de Objetivos</span>
                                    <span className="text-sm font-bold">
                                        {nutritionSummary.goal_compliance.percentage}%
                                    </span>
                                </div>
                                <ProgressBar value={nutritionSummary.goal_compliance.percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {nutritionSummary.goal_compliance.compliant_days} de {nutritionSummary.goal_compliance.total_days} días cumplieron los objetivos
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Resumen de Contexto */}
                {contextSummary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Resumen de Contexto (Últimos 30 días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {contextSummary.total_days}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Días Registrados</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {contextSummary.average_stress.toFixed(1)}/10
                                    </div>
                                    <p className="text-sm text-muted-foreground">Estrés Promedio</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {contextSummary.average_sleep.toFixed(1)}h
                                    </div>
                                    <p className="text-sm text-muted-foreground">Sueño Promedio</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {contextSummary.special_days_count}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Días Especiales</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Resumen de Hidratación */}
                {hydrationSummary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplet className="h-5 w-5" />
                                Resumen de Hidratación (Últimos 30 días)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Math.round(hydrationSummary.average_daily_ml / 1000 * 10) / 10}L
                                    </div>
                                    <p className="text-sm text-muted-foreground">Promedio Diario</p>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-cyan-600">
                                        {Math.round(hydrationSummary.total_ml / 1000)}L
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Consumido</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Cumplimiento de Objetivo</span>
                                    <span className="text-sm font-bold">
                                        {hydrationSummary.goal_compliance.percentage}%
                                    </span>
                                </div>
                                <ProgressBar value={hydrationSummary.goal_compliance.percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {hydrationSummary.goal_compliance.compliant_days} de {hydrationSummary.goal_compliance.total_days} días cumplieron el objetivo
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Fotos de Progreso */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                <CardTitle>Fotos de Progreso</CardTitle>
                            </div>
                            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Subir Foto
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Subir Foto de Progreso</DialogTitle>
                                        <DialogDescription>
                                            Documenta tu transformación con fotos
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUpload} className="space-y-4">
                                        <div>
                                            <Label htmlFor="image">Foto *</Label>
                                            <Input
                                                id="image"
                                                name="image"
                                                type="file"
                                                accept="image/*"
                                                required
                                                onChange={handleImageChange}
                                            />
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mt-2 w-full h-48 object-cover rounded"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="date">Fecha *</Label>
                                            <Input
                                                id="date"
                                                name="date"
                                                type="date"
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="weight">Peso (kg)</Label>
                                                <Input
                                                    id="weight"
                                                    name="weight"
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="75.5"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="body_fat_percentage">Grasa Corporal (%)</Label>
                                                <Input
                                                    id="body_fat_percentage"
                                                    name="body_fat_percentage"
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="20.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">Notas</Label>
                                            <Textarea
                                                id="notes"
                                                name="notes"
                                                placeholder="Cómo te sientes hoy..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_baseline"
                                                name="is_baseline"
                                                value="1"
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor="is_baseline" className="font-normal cursor-pointer">
                                                Marcar como foto de referencia (baseline)
                                            </Label>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isUploading || !selectedImage}>
                                            {isUploading ? 'Subiendo...' : 'Subir Foto'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <CardDescription>
                            Documenta tu transformación visual a lo largo del tiempo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Comparador Antes/Después */}
                        {photosSummary?.baseline_photo && photosSummary?.latest_photo && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                                <h3 className="font-semibold mb-4 text-center">Comparación: Antes y Después</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Badge variant="secondary" className="mb-2">Baseline - {photosSummary.baseline_photo.date}</Badge>
                                        <img
                                            src={photosSummary.baseline_photo.image_url}
                                            alt="Baseline"
                                            className="w-full h-64 object-cover rounded"
                                        />
                                        {photosSummary.baseline_photo.weight && (
                                            <p className="text-sm text-center mt-2">{photosSummary.baseline_photo.weight} kg</p>
                                        )}
                                    </div>
                                    <div>
                                        <Badge variant="default" className="mb-2">Actual - {photosSummary.latest_photo.date}</Badge>
                                        <img
                                            src={photosSummary.latest_photo.image_url}
                                            alt="Latest"
                                            className="w-full h-64 object-cover rounded"
                                        />
                                        {photosSummary.latest_photo.weight && (
                                            <div className="text-sm text-center mt-2">
                                                <p>{photosSummary.latest_photo.weight} kg</p>
                                                {photosSummary.total_weight_change !== null && (
                                                    <Badge
                                                        variant={photosSummary.total_weight_change < 0 ? 'default' : 'secondary'}
                                                        className="mt-1"
                                                    >
                                                        {photosSummary.total_weight_change > 0 ? '+' : ''}
                                                        {photosSummary.total_weight_change} kg
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Galería de Fotos */}
                        {progressPhotos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {progressPhotos.map((photo) => (
                                    <div key={photo.id} className="relative group">
                                        <div className="relative">
                                            <img
                                                src={photo.image_url}
                                                alt={`Progreso ${photo.date}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            {photo.is_baseline && (
                                                <Badge className="absolute top-2 left-2 bg-yellow-500">
                                                    <Flag className="h-3 w-3 mr-1" />
                                                    Baseline
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm font-medium">{photo.date}</p>
                                            {photo.weight && (
                                                <p className="text-xs text-muted-foreground">
                                                    {photo.weight} kg
                                                    {photo.weight_change !== null && photo.weight_change !== 0 && (
                                                        <span className={photo.weight_change < 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {' '}({photo.weight_change > 0 ? '+' : ''}{photo.weight_change} kg)
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            {photo.days_since_baseline !== null && (
                                                <p className="text-xs text-muted-foreground">
                                                    Día {photo.days_since_baseline}
                                                </p>
                                            )}
                                            {photo.notes && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {photo.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {!photo.is_baseline && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleSetBaseline(photo.id)}
                                                >
                                                    <Flag className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleDelete(photo.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">
                                    No has subido fotos de progreso aún
                                </p>
                                <Button onClick={() => setShowUploadDialog(true)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir Primera Foto
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Mensaje si no hay datos */}
                {!profile && !weightProgress && !exerciseSummary && !nutritionSummary && (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Completa tu perfil y comienza a registrar datos para ver tu progreso
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            )}
        </AppLayout>
    );
}
