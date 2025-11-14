import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
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
    Scale
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    error?: string;
}

export default function ProgressPage() {
    const { progressData } = usePage<{ progressData: ProgressData }>().props;
    const data = progressData || {};

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
        </AppLayout>
    );
}
