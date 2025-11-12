import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Apple, Plus, Utensils } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Nutrición', href: '/nutrition' },
];

interface NutritionSummary {
    total_calories: number;
    goal_calories: number;
    total_protein: number;
    goal_protein: number;
    total_carbs: number;
    goal_carbs: number;
    total_fat: number;
    goal_fat: number;
}

export default function Nutrition({ summary }: { summary?: NutritionSummary }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nutrición" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nutrición</h1>
                    <p className="text-muted-foreground">
                        Registra tus comidas y monitorea tus macronutrientes
                    </p>
                </div>

                {summary && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Calorías</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-4xl font-bold">{summary.total_calories}</div>
                                        <p className="text-sm text-muted-foreground">de {summary.goal_calories} kcal</p>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {Math.round((summary.total_calories / summary.goal_calories) * 100)}%
                                    </div>
                                </div>
                                <Progress value={(summary.total_calories / summary.goal_calories) * 100} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Macronutrientes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Proteínas</span>
                                        <span>{summary.total_protein}/{summary.goal_protein}g</span>
                                    </div>
                                    <Progress value={(summary.total_protein / summary.goal_protein) * 100} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Carbohidratos</span>
                                        <span>{summary.total_carbs}/{summary.goal_carbs}g</span>
                                    </div>
                                    <Progress value={(summary.total_carbs / summary.goal_carbs) * 100} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Grasas</span>
                                        <span>{summary.total_fat}/{summary.goal_fat}g</span>
                                    </div>
                                    <Progress value={(summary.total_fat / summary.goal_fat) * 100} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Registrar Comida</CardTitle>
                        <CardDescription>Agrega una nueva comida a tu registro diario</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Button className="h-24 flex flex-col gap-2">
                                <Utensils className="h-6 w-6" />
                                <span>Desayuno</span>
                            </Button>
                            <Button className="h-24 flex flex-col gap-2">
                                <Utensils className="h-6 w-6" />
                                <span>Almuerzo</span>
                            </Button>
                            <Button className="h-24 flex flex-col gap-2">
                                <Utensils className="h-6 w-6" />
                                <span>Cena</span>
                            </Button>
                            <Button className="h-24 flex flex-col gap-2">
                                <Apple className="h-6 w-6" />
                                <span>Snack</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Comidas de Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Utensils className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No has registrado comidas hoy</p>
                            <Button className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Primera Comida
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
