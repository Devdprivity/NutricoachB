import { type BreadcrumbItem, type ProfileData, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, Apple, Droplet, Heart, Scale, TrendingUp, User } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

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
    };
    todayNutrition?: {
        total_calories: number;
        goal_calories: number;
        total_protein: number;
        goal_protein: number;
    };
    hasProfile: boolean;
}

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const dashboardData = usePage<{ dashboardData: DashboardData }>().props.dashboardData;

    const hasProfile = dashboardData?.hasProfile;
    const profile = dashboardData?.profileData?.profile;
    const hydration = dashboardData?.todayHydration;
    const nutrition = dashboardData?.todayNutrition;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
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
                            {hydration ? (
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
                            {nutrition ? (
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
                                                value={(nutrition.total_calories / nutrition.goal_calories) * 100}
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
                                                value={(nutrition.total_protein / nutrition.goal_protein) * 100}
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {nutrition.total_calories < nutrition.goal_calories &&
                                            `Te faltan ${nutrition.goal_calories - nutrition.total_calories} kcal`}
                                        {nutrition.total_calories >= nutrition.goal_calories &&
                                            '✅ Meta de calorías cumplida'}
                                    </p>
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
        </AppLayout>
    );
}
