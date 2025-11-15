import { type BreadcrumbItem, type ProfileData, type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Activity, Apple, Droplet, Heart, Scale, Star, TrendingUp, User, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardData {
    profileData?: ProfileData;
    todayHydration?: {
        total_ml: number;
        goal_ml: number;
        percentage: number;
        records?: Array<{
            id: number;
            amount_ml: number;
            type: string;
            time: string;
        }>;
    };
    todayNutrition?: {
        total_calories: number;
        goal_calories: number;
        total_protein: number;
        goal_protein: number;
        total_carbs?: number;
        goal_carbs?: number;
        total_fat?: number;
        goal_fat?: number;
        records?: Array<{
            id: number;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            meal_type: string;
            food_name: string;
            time: string;
        }>;
    };
    hydrationChart?: Array<{
        hour: number;
        total_ml: number;
        count: number;
    }>;
    nutritionChart?: Array<{
        type: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        count: number;
    }>;
    hasProfile: boolean;
    gamification?: {
        level: number;
        total_xp: number;
        xp_to_next_level: number;
        progress_percent: number;
        total_achievements: number;
        unlocked_achievements: number;
    };
}

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const dashboardData = usePage<{ dashboardData: DashboardData }>().props.dashboardData;
    const getInitials = useInitials();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulamos que los datos están cargando al montar el componente
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // Detectar cuando Inertia está navegando
    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        router.on('start', handleStart);
        router.on('finish', handleFinish);

        return () => {
            router.off('start', handleStart);
            router.off('finish', handleFinish);
        };
    }, []);

    const hasProfile = dashboardData?.hasProfile;
    const profile = dashboardData?.profileData?.profile;
    const hydration = dashboardData?.todayHydration;
    const nutrition = dashboardData?.todayNutrition;
    const hydrationChart = dashboardData?.hydrationChart;
    const nutritionChart = dashboardData?.nutritionChart;
    const gamification = dashboardData?.gamification;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {isLoading ? (
                <DashboardSkeleton />
            ) : (

            <div className="flex flex-col gap-6 p-6" data-page="dashboard">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                ¡Hola, {auth.user.name}! 👋
                            </h1>
                            <p className="text-muted-foreground">
                                {new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerta si no tiene perfil */}
                {!hasProfile && (
                    <Alert>
                        <User className="h-4 w-4" />
                        <AlertTitle>Completa tu perfil nutricional</AlertTitle>
                        <AlertDescription>
                            Para obtener recomendaciones personalizadas, completa tu perfil con tus datos físicos y objetivos.
                            <Link href="/settings/nutritional-profile">
                                <Button className="mt-2" size="sm">
                                    Completar Perfil
                                </Button>
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Widget de Gamificación */}
                {gamification && (
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    <div>
                                        <CardTitle className="text-2xl">Nivel {gamification.level}</CardTitle>
                                        <CardDescription>
                                            {gamification.total_xp} XP Total
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href="/achievements">
                                    <Button variant="outline" size="sm">
                                        <Star className="h-4 w-4 mr-2" />
                                        Ver Logros
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Progreso al Nivel {gamification.level + 1}</span>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                        {gamification.progress_percent}%
                                    </Badge>
                                </div>
                                <Progress value={gamification.progress_percent} className="h-3" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {gamification.xp_to_next_level - (gamification.total_xp % gamification.xp_to_next_level)} XP restantes
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm font-medium">Logros Desbloqueados</span>
                                </div>
                                <span className="text-sm font-bold">
                                    {gamification.unlocked_achievements} / {gamification.total_achievements}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Resumen del Perfil */}
                {hasProfile && dashboardData?.profileData && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">IMC</CardTitle>
                                <Scale className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {dashboardData.profileData.bmi?.toFixed(1) || '--'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData.profileData.bmi_category === 'normal' && '✅ Normal'}
                                    {dashboardData.profileData.bmi_category === 'underweight' && '⚠️ Bajo peso'}
                                    {dashboardData.profileData.bmi_category === 'overweight' && '⚠️ Sobrepeso'}
                                    {dashboardData.profileData.bmi_category === 'obese' && '🔴 Obesidad'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Peso Actual</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{profile?.weight || '--'} kg</div>
                                {profile?.target_weight && (
                                    <p className="text-xs text-muted-foreground">
                                        Meta: {profile.target_weight} kg
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Metabolismo Basal</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.profileData.bmr || '--'}</div>
                                <p className="text-xs text-muted-foreground">kcal/día</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Gasto Energético</CardTitle>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.profileData.tdee || '--'}</div>
                                <p className="text-xs text-muted-foreground">kcal/día</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tracking de Hoy */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Hidratación */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Droplet className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Hidratación de Hoy</CardTitle>
                                </div>
                                <Link href="/hydration">
                                    <Button variant="outline" size="sm">Ver más</Button>
                                </Link>
                            </div>
                            <CardDescription>Tu consumo de agua del día</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hydration && hydration.total_ml > 0 ? (
                                <>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-3xl font-bold">{hydration.total_ml} ml</div>
                                            <p className="text-sm text-muted-foreground">
                                                de {hydration.goal_ml} ml
                                            </p>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-500">
                                            {hydration.percentage}%
                                        </div>
                                    </div>
                                    <Progress value={hydration.percentage} className="h-2" />
                                    {hydration.percentage >= 100 && (
                                        <p className="text-sm font-medium text-green-600">
                                            ✅ ¡Meta cumplida!
                                        </p>
                                    )}
                                    {hydration.percentage < 100 && (
                                        <p className="text-sm text-muted-foreground">
                                            Te faltan {hydration.goal_ml - hydration.total_ml} ml para tu meta
                                        </p>
                                    )}
                                    
                                    {/* Gráfico de hidratación por horas */}
                                    {hydrationChart && hydrationChart.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-3">Consumo por Horas</p>
                                            <div className="flex items-end gap-1 h-24">
                                                {hydrationChart.map((item, index) => {
                                                    const maxMl = Math.max(...hydrationChart.map(h => h.total_ml), 1);
                                                    const height = (item.total_ml / maxMl) * 100;
                                                    return (
                                                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                                            <div 
                                                                className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                                                style={{ height: `${height}%` }}
                                                                title={`${item.total_ml}ml a las ${item.hour}:00`}
                                                            />
                                                            <span className="text-xs text-muted-foreground">{item.hour}h</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Registros recientes */}
                                    {hydration.records && hydration.records.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-2">Registros Recientes</p>
                                            <div className="space-y-2">
                                                {hydration.records.slice(0, 3).map((record) => (
                                                    <div key={record.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Droplet className="h-4 w-4 text-blue-500" />
                                                            <span>{record.amount_ml} ml</span>
                                                        </div>
                                                        <span className="text-muted-foreground">{record.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        No has registrado agua hoy
                                    </p>
                                    <Link href="/hydration">
                                        <Button className="mt-4" size="sm">
                                            Registrar Agua
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Nutrición */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Apple className="h-5 w-5 text-green-500" />
                                    <CardTitle>Nutrición de Hoy</CardTitle>
                                </div>
                                <Link href="/nutrition">
                                    <Button variant="outline" size="sm">Ver más</Button>
                                </Link>
                            </div>
                            <CardDescription>Calorías y macronutrientes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {nutrition && nutrition.total_calories > 0 ? (
                                <>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">Calorías</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {nutrition.total_calories} / {nutrition.goal_calories} kcal
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(100, (nutrition.total_calories / nutrition.goal_calories) * 100)}
                                                className="h-2"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">Proteínas</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {nutrition.total_protein} / {nutrition.goal_protein} g
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(100, (nutrition.total_protein / nutrition.goal_protein) * 100)}
                                                className="h-2"
                                            />
                                        </div>
                                        {nutrition.total_carbs && nutrition.goal_carbs && (
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium">Carbohidratos</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {nutrition.total_carbs} / {nutrition.goal_carbs} g
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(100, (nutrition.total_carbs / nutrition.goal_carbs) * 100)}
                                                    className="h-2"
                                                />
                                            </div>
                                        )}
                                        {nutrition.total_fat && nutrition.goal_fat && (
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium">Grasas</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {nutrition.total_fat} / {nutrition.goal_fat} g
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(100, (nutrition.total_fat / nutrition.goal_fat) * 100)}
                                                    className="h-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {nutrition.total_calories < nutrition.goal_calories &&
                                            `Te faltan ${nutrition.goal_calories - nutrition.total_calories} kcal`}
                                        {nutrition.total_calories >= nutrition.goal_calories &&
                                            '✅ Meta de calorías cumplida'}
                                    </p>

                                    {/* Gráfico de nutrición por tipo de comida */}
                                    {nutritionChart && nutritionChart.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-3">Calorías por Tipo de Comida</p>
                                            <div className="space-y-2">
                                                {nutritionChart.map((item, index) => {
                                                    const maxCalories = Math.max(...nutritionChart.map(n => n.calories), 1);
                                                    const percentage = (item.calories / maxCalories) * 100;
                                                    const mealTypeLabels: Record<string, string> = {
                                                        breakfast: 'Desayuno',
                                                        lunch: 'Almuerzo',
                                                        dinner: 'Cena',
                                                        snack: 'Snack',
                                                        pre_workout: 'Pre-entreno',
                                                        post_workout: 'Post-entreno',
                                                    };
                                                    return (
                                                        <div key={index} className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-muted-foreground">
                                                                    {mealTypeLabels[item.type] || item.type}
                                                                </span>
                                                                <span className="font-medium">{item.calories} kcal</span>
                                                            </div>
                                                            <Progress value={percentage} className="h-1.5" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Registros recientes */}
                                    {nutrition.records && nutrition.records.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-2">Comidas Recientes</p>
                                            <div className="space-y-2">
                                                {nutrition.records.slice(0, 3).map((record) => (
                                                    <div key={record.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Apple className="h-4 w-4 text-green-500" />
                                                            <span className="truncate">{record.food_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{record.calories} kcal</span>
                                                            <span className="text-muted-foreground">{record.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <Apple className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        No has registrado comidas hoy
                                    </p>
                                    <Link href="/nutrition">
                                        <Button className="mt-4" size="sm">
                                            Registrar Comida
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Accesos Rápidos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accesos Rápidos</CardTitle>
                        <CardDescription>Navega rápidamente a las secciones principales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Link href="/hydration">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                    <Droplet className="h-6 w-6" />
                                    <span>Hidratación</span>
                                </Button>
                            </Link>
                            <Link href="/nutrition">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                    <Apple className="h-6 w-6" />
                                    <span>Nutrición</span>
                                </Button>
                            </Link>
                            <Link href="/exercises">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                    <Activity className="h-6 w-6" />
                                    <span>Ejercicios</span>
                                </Button>
                            </Link>
                            <Link href="/progress">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                                    <TrendingUp className="h-6 w-6" />
                                    <span>Progreso</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            )}
        </AppLayout>
    );
}
