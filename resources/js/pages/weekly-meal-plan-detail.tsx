import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, UtensilsCrossed, Clock, CheckCircle2, ChefHat } from 'lucide-react';
import { WeeklyMealPlanDetailSkeleton } from '@/components/skeletons/weekly-meal-plan-detail-skeleton';
import { useState, useEffect } from 'react';

interface Recipe {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings: number;
    calories_per_serving?: number;
}

interface WeeklyMealPlan {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    recipes_count: number;
    recipes: Recipe[];
    created_at: string;
}

interface WeeklyMealPlanDetailProps {
    plan: WeeklyMealPlan;
    schedule?: any;
}

export default function WeeklyMealPlanDetail({ plan: mealPlan, schedule }: WeeklyMealPlanDetailProps) {
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return (
            <AppLayout>
                <Head title="Cargando..." />
                <WeeklyMealPlanDetailSkeleton />
            </AppLayout>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title={mealPlan.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/weekly-meal-plans" preserveScroll>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{mealPlan.name}</h1>
                        {mealPlan.description && (
                            <p className="text-muted-foreground mt-1">{mealPlan.description}</p>
                        )}
                    </div>
                    <Badge variant={mealPlan.is_active ? 'default' : 'secondary'}>
                        {mealPlan.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Period */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Período
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Desde</p>
                                        <p className="font-semibold">{formatDate(mealPlan.start_date)}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-8 w-px bg-border"></div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Hasta</p>
                                        <p className="font-semibold">{formatDate(mealPlan.end_date)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recipes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ChefHat className="h-5 w-5" />
                                    Recetas ({mealPlan.recipes_count})
                                </CardTitle>
                                <CardDescription>
                                    Lista de recetas incluidas en este plan semanal
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {mealPlan.recipes && mealPlan.recipes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mealPlan.recipes.map((recipe) => (
                                            <Card key={recipe.id} className="overflow-hidden">
                                                <div className="flex">
                                                    {recipe.image_url && (
                                                        <img
                                                            src={recipe.image_url}
                                                            alt={recipe.name}
                                                            className="h-24 w-24 object-cover flex-shrink-0"
                                                        />
                                                    )}
                                                    <CardContent className="flex-1 p-4">
                                                        <CardTitle className="text-base mb-1">
                                                            {recipe.name}
                                                        </CardTitle>
                                                        {recipe.description && (
                                                            <CardDescription className="text-xs line-clamp-2 mb-2">
                                                                {recipe.description}
                                                            </CardDescription>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            {recipe.prep_time_minutes && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{recipe.prep_time_minutes} min</span>
                                                                </div>
                                                            )}
                                                            {recipe.servings && (
                                                                <div className="flex items-center gap-1">
                                                                    <UtensilsCrossed className="h-3 w-3" />
                                                                    <span>{recipe.servings} porciones</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {recipe.calories_per_serving && (
                                                            <Badge variant="outline" className="mt-2 text-xs">
                                                                {recipe.calories_per_serving} kcal/porción
                                                            </Badge>
                                                        )}
                                                        <Link
                                                            href={`/recipes/${recipe.id}`}
                                                            preserveScroll
                                                            className="block mt-2 text-xs text-primary hover:underline"
                                                        >
                                                            Ver receta →
                                                        </Link>
                                                    </CardContent>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No hay recetas en este plan</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Start Date */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Fecha de inicio</p>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <p className="font-semibold">{formatDate(mealPlan.start_date)}</p>
                                    </div>
                                </div>

                                {/* End Date */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Fecha de fin</p>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <p className="font-semibold">{formatDate(mealPlan.end_date)}</p>
                                    </div>
                                </div>

                                {/* Recipes Count */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total de recetas</span>
                                    <div className="flex items-center gap-1">
                                        <ChefHat className="h-4 w-4" />
                                        <span className="font-semibold">{mealPlan.recipes_count}</span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Estado</span>
                                    <Badge variant={mealPlan.is_active ? 'default' : 'secondary'}>
                                        {mealPlan.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

