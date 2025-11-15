import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, ChefHat, CheckCircle2, TrendingUp } from 'lucide-react';

interface WeeklyMealPlan {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    goal?: string;
    is_active: boolean;
    is_public: boolean;
    times_completed: number;
    recipes_count: number;
    target_calories?: number;
    duration_days: number;
    is_currently_active: boolean;
    created_at: string;
}

interface Stats {
    total_plans: number;
    active_plans: number;
    completed_plans: number;
}

interface WeeklyMealPlansProps {
    plans: WeeklyMealPlan[];
    publicPlans: WeeklyMealPlan[];
    stats: Stats;
}

export default function WeeklyMealPlans({ plans, publicPlans, stats }: WeeklyMealPlansProps) {
    return (
        <AppLayout>
            <Head title="Planes de Comidas Semanales" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Planes de Comidas Semanales</h1>
                        <p className="text-muted-foreground">Organiza tus comidas de la semana</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_plans}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_plans}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Planes Completados</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed_plans}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="my-plans" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="my-plans">Mis Planes</TabsTrigger>
                        <TabsTrigger value="public">Planes Públicos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-plans" className="space-y-4">
                        {plans.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No tienes planes semanales aún</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {plans.map((plan) => (
                                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                {plan.name}
                                                {plan.is_currently_active && (
                                                    <Badge variant="default">Activo</Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                {plan.goal && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Target className="h-3 w-3" />
                                                        <span>{plan.goal}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <ChefHat className="h-3 w-3" />
                                                    <span>{plan.recipes_count} recetas</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{plan.duration_days} días</span>
                                                </div>
                                            </div>

                                            {plan.target_calories && (
                                                <div className="text-sm">
                                                    <span className="font-medium">{plan.target_calories}</span> kcal/día objetivo
                                                </div>
                                            )}

                                            <div className="text-xs text-muted-foreground">
                                                Completado {plan.times_completed} veces
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="public" className="space-y-4">
                        {publicPlans.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No hay planes públicos disponibles</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicPlans.map((plan) => (
                                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle>{plan.name}</CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {plan.goal && (
                                                <Badge variant="outline">{plan.goal}</Badge>
                                            )}
                                            <div className="text-sm text-muted-foreground">
                                                <ChefHat className="inline h-3 w-3 mr-1" />
                                                {plan.recipes_count} recetas
                                            </div>
                                            {plan.target_calories && (
                                                <div className="text-sm">
                                                    {plan.target_calories} kcal/día
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
