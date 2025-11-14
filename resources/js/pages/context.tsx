import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    Droplet, 
    Apple, 
    Dumbbell, 
    MessageSquare,
    Target,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Info,
    Activity,
    Heart,
    Scale
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contexto', href: '/context' },
];

interface ContextData {
    profile?: {
        weight?: number;
        target_weight?: number;
        height?: number;
        age?: number;
        gender?: string;
        bmi?: number;
        bmi_category?: string;
        daily_calorie_goal?: number;
        protein_goal?: number;
        carbs_goal?: number;
        fat_goal?: number;
        water_goal?: number;
        activity_level?: string;
    };
    hydration?: {
        today: {
            total_ml: number;
            goal_ml: number;
            records_count: number;
        };
        last_7_days: {
            total_ml: number;
            average_daily: number;
            days_tracked: number;
        };
        recent_records: Array<{
            id: number;
            date: string;
            amount_ml: number;
            type: string;
            time: string;
        }>;
    };
    nutrition?: {
        today: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            meals_count: number;
        };
        last_7_days: {
            total_calories: number;
            average_daily_calories: number;
            total_protein: number;
            total_carbs: number;
            total_fat: number;
            days_tracked: number;
        };
        recent_records: Array<{
            id: number;
            date: string;
            calories: number;
            meal_type: string;
            food_name: string;
        }>;
    };
    exercise?: {
        today: {
            calories_burned: number;
            duration_minutes: number;
            exercises_count: number;
        };
        last_7_days: {
            total_calories_burned: number;
            total_duration_minutes: number;
            average_daily_calories: number;
            days_exercised: number;
        };
        recent_records: Array<{
            id: number;
            date: string;
            exercise_name: string;
            duration_minutes: number;
            calories_burned: number;
        }>;
    };
    coaching?: {
        recent_messages: Array<{
            id: number;
            message: string;
            type: string;
            created_at: string;
            is_read: boolean;
        }>;
        total_messages: number;
    };
    user_contexts?: Array<{
        id: number;
        date: string;
        context_type: string;
        description: string;
        stress_level?: number;
        energy_level?: number;
        mood_level?: number;
        affects_nutrition: boolean;
    }>;
    goal_compliance?: {
        hydration: {
            current: number;
            goal: number;
            percentage: number;
            status: string;
        };
        nutrition: {
            calories: { current: number; goal: number; percentage: number };
            protein: { current: number; goal: number; percentage: number };
            carbs: { current: number; goal: number; percentage: number };
            fat: { current: number; goal: number; percentage: number };
            overall_percentage: number;
            status: string;
        };
        exercise: boolean;
    };
}

export default function Context() {
    const { contextData } = usePage<{ contextData: ContextData }>().props;
    const data = contextData || {};

    const profile = data.profile;
    const hydration = data.hydration;
    const nutrition = data.nutrition;
    const exercise = data.exercise;
    const coaching = data.coaching;
    const userContexts = data.user_contexts;
    const goalCompliance = data.goal_compliance;

    const getStatusBadge = (status: string) => {
        const badges = {
            good: { label: 'Bueno', variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            fair: { label: 'Regular', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            poor: { label: 'Bajo', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        return badges[status as keyof typeof badges] || badges.fair;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contexto Completo" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contexto Completo</h1>
                    <p className="text-muted-foreground">
                        Vista integral de tu perfil nutricional, hidratación, nutrición, ejercicios y coaching
                    </p>
                </div>

                {/* Perfil Nutricional */}
                {profile && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5" />
                                Perfil Nutricional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-2xl font-bold">{profile.weight} kg</div>
                                    <p className="text-sm text-muted-foreground">Peso Actual</p>
                                </div>
                                {profile.target_weight && (
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{profile.target_weight} kg</div>
                                        <p className="text-sm text-muted-foreground">Peso Objetivo</p>
                                    </div>
                                )}
                                {profile.bmi && (
                                    <div>
                                        <div className="text-2xl font-bold">{profile.bmi}</div>
                                        <p className="text-sm text-muted-foreground">IMC</p>
                                    </div>
                                )}
                                <div>
                                    <div className="text-2xl font-bold">{profile.age} años</div>
                                    <p className="text-sm text-muted-foreground">Edad</p>
                                </div>
                            </div>
                            {profile.daily_calorie_goal && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Calorías:</span>
                                            <span className="ml-2 font-medium">{profile.daily_calorie_goal} kcal</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Proteína:</span>
                                            <span className="ml-2 font-medium">{profile.protein_goal} g</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Carbos:</span>
                                            <span className="ml-2 font-medium">{profile.carbs_goal} g</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Grasas:</span>
                                            <span className="ml-2 font-medium">{profile.fat_goal} g</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Resumen de Objetivos - Hoy */}
                {goalCompliance && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Hidratación */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Droplet className="h-4 w-4" />
                                    Hidratación Hoy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Consumido</span>
                                    <span className="text-lg font-bold">{goalCompliance.hydration.current} ml</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Objetivo</span>
                                    <span className="text-lg font-bold">{goalCompliance.hydration.goal} ml</span>
                                </div>
                                <ProgressBar value={goalCompliance.hydration.percentage} className="h-2" />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{goalCompliance.hydration.percentage.toFixed(1)}%</span>
                                    <Badge className={getStatusBadge(goalCompliance.hydration.status).className}>
                                        {getStatusBadge(goalCompliance.hydration.status).label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nutrición */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Apple className="h-4 w-4" />
                                    Nutrición Hoy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Calorías</span>
                                    <span className="text-lg font-bold">{goalCompliance.nutrition.calories.current} / {goalCompliance.nutrition.calories.goal}</span>
                                </div>
                                <ProgressBar value={goalCompliance.nutrition.overall_percentage} className="h-2" />
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">P:</span>
                                        <span className="ml-1 font-medium">{goalCompliance.nutrition.protein.percentage.toFixed(0)}%</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">C:</span>
                                        <span className="ml-1 font-medium">{goalCompliance.nutrition.carbs.percentage.toFixed(0)}%</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">G:</span>
                                        <span className="ml-1 font-medium">{goalCompliance.nutrition.fat.percentage.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{goalCompliance.nutrition.overall_percentage.toFixed(1)}%</span>
                                    <Badge className={getStatusBadge(goalCompliance.nutrition.status).className}>
                                        {getStatusBadge(goalCompliance.nutrition.status).label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ejercicio */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Dumbbell className="h-4 w-4" />
                                    Ejercicio Hoy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {goalCompliance.exercise ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Estado</span>
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Completado
                                            </Badge>
                                        </div>
                                        {exercise?.today && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Calorías Quemadas</span>
                                                    <span className="text-lg font-bold">{exercise.today.calories_burned} kcal</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Duración</span>
                                                    <span className="text-lg font-bold">{exercise.today.duration_minutes} min</span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No hay ejercicios registrados hoy</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Resumen de Últimos 7 Días */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Hidratación - 7 días */}
                    {hydration && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Droplet className="h-5 w-5" />
                                    Hidratación (7 días)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Math.round(hydration.last_7_days.average_daily / 1000 * 10) / 10}L
                                    </div>
                                    <p className="text-sm text-muted-foreground">Promedio Diario</p>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="font-medium">{Math.round(hydration.last_7_days.total_ml / 1000)}L</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Días registrados:</span>
                                        <span className="font-medium">{hydration.last_7_days.days_tracked}</span>
                                    </div>
                                </div>
                                {hydration.recent_records.length > 0 && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm font-medium mb-2">Registros Recientes</p>
                                        <div className="space-y-1">
                                            {hydration.recent_records.slice(0, 5).map((record) => (
                                                <div key={record.id} className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">{record.date}</span>
                                                    <span className="font-medium">{record.amount_ml}ml</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Nutrición - 7 días */}
                    {nutrition && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Apple className="h-5 w-5" />
                                    Nutrición (7 días)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {nutrition.last_7_days.average_daily_calories.toLocaleString()} kcal
                                    </div>
                                    <p className="text-sm text-muted-foreground">Promedio Diario</p>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <span className="text-muted-foreground">P:</span>
                                            <span className="ml-1 font-medium">{nutrition.last_7_days.total_protein.toFixed(0)}g</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">C:</span>
                                            <span className="ml-1 font-medium">{nutrition.last_7_days.total_carbs.toFixed(0)}g</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">G:</span>
                                            <span className="ml-1 font-medium">{nutrition.last_7_days.total_fat.toFixed(0)}g</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-muted-foreground">Días registrados:</span>
                                        <span className="font-medium">{nutrition.last_7_days.days_tracked}</span>
                                    </div>
                                </div>
                                {nutrition.recent_records.length > 0 && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm font-medium mb-2">Comidas Recientes</p>
                                        <div className="space-y-1">
                                            {nutrition.recent_records.slice(0, 5).map((record) => (
                                                <div key={record.id} className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">{record.date}</span>
                                                    <span className="font-medium">{record.calories}kcal</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Ejercicio - 7 días */}
                    {exercise && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Dumbbell className="h-5 w-5" />
                                    Ejercicio (7 días)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {exercise.last_7_days.total_calories_burned.toLocaleString()} kcal
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Quemado</p>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tiempo total:</span>
                                        <span className="font-medium">{Math.round(exercise.last_7_days.total_duration_minutes / 60)}h {exercise.last_7_days.total_duration_minutes % 60}m</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Días ejercitados:</span>
                                        <span className="font-medium">{exercise.last_7_days.days_exercised}</span>
                                    </div>
                                </div>
                                {exercise.recent_records.length > 0 && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm font-medium mb-2">Ejercicios Recientes</p>
                                        <div className="space-y-1">
                                            {exercise.recent_records.slice(0, 5).map((record) => (
                                                <div key={record.id} className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">{record.date}</span>
                                                    <span className="font-medium">{record.calories_burned}kcal</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Coaching y Contextos */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Mensajes de Coaching */}
                    {coaching && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Coaching
                                </CardTitle>
                                <CardDescription>
                                    {coaching.total_messages} mensajes en total
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {coaching.recent_messages.length > 0 ? (
                                    <div className="space-y-3">
                                        {coaching.recent_messages.slice(0, 5).map((message) => (
                                            <div key={message.id} className="p-3 border rounded-lg">
                                                <div className="flex items-start justify-between mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {message.type}
                                                    </Badge>
                                                    {!message.is_read && (
                                                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm">{message.message}</p>
                                                <p className="text-xs text-muted-foreground mt-2">{message.created_at}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No hay mensajes de coaching</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Contextos Registrados */}
                    {userContexts && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Contextos Registrados
                                </CardTitle>
                                <CardDescription>
                                    Últimos 7 días
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userContexts.length > 0 ? (
                                    <div className="space-y-3">
                                        {userContexts.slice(0, 5).map((context) => (
                                            <div key={context.id} className="p-3 border rounded-lg">
                                                <div className="flex items-start justify-between mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {context.context_type}
                                                    </Badge>
                                                    {context.affects_nutrition && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Afecta Nutrición
                                                        </Badge>
                                                    )}
                                                </div>
                                                {context.description && (
                                                    <p className="text-sm mb-2">{context.description}</p>
                                                )}
                                                <div className="flex gap-4 text-xs text-muted-foreground">
                                                    {context.stress_level !== null && (
                                                        <span>Estrés: {context.stress_level}/10</span>
                                                    )}
                                                    {context.energy_level !== null && (
                                                        <span>Energía: {context.energy_level}/10</span>
                                                    )}
                                                    {context.mood_level !== null && (
                                                        <span>Ánimo: {context.mood_level}/10</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">{context.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No hay contextos registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Mensaje si no hay datos */}
                {!profile && !hydration && !nutrition && !exercise && (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Completa tu perfil y comienza a registrar datos para ver tu contexto completo
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
