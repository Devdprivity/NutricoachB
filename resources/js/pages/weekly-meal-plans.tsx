import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Target, ChefHat, CheckCircle2, TrendingUp, Sparkles, Loader2, RefreshCw, Save, Utensils } from 'lucide-react';

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

interface UserRecipe {
    id: number;
    name: string;
    category: string;
    calories_per_serving: number | null;
    description: string | null;
}

interface GeneratedMeal {
    meal_label: string;
    recipe: {
        id: number;
        name: string;
        calories_per_serving: number | null;
        description: string | null;
    };
}

interface GeneratedDay {
    date: string;
    day_label: string;
    meals: {
        breakfast: GeneratedMeal;
        lunch: GeneratedMeal;
        dinner: GeneratedMeal;
    };
}

interface GeneratedPlan {
    name: string;
    start_date: string;
    end_date: string;
    days: GeneratedDay[];
}

interface WeeklyMealPlansProps {
    plans: WeeklyMealPlan[];
    publicPlans: WeeklyMealPlan[];
    stats: Stats;
    userRecipes: UserRecipe[];
}

export default function WeeklyMealPlans({ plans, publicPlans, stats, userRecipes }: WeeklyMealPlansProps) {
    const [draftPlan, setDraftPlan] = useState<GeneratedPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [changeSlot, setChangeSlot] = useState<{ dayIdx: number; mealType: string } | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setAiError(null);
        try {
            const res = await axios.post('/weekly-meal-plans/ai-generate');
            setDraftPlan(res.data);
        } catch (e: any) {
            setAiError(e.response?.data?.error ?? 'Error al generar el plan.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSavePlan = () => {
        if (!draftPlan) return;
        setIsSaving(true);
        router.post('/weekly-meal-plans', {
            name: draftPlan.name,
            start_date: draftPlan.start_date,
            end_date: draftPlan.end_date,
            is_active: true,
            recipes: draftPlan.days.flatMap(day =>
                Object.entries(day.meals).map(([mealType, meal]) => ({
                    recipe_id: meal.recipe.id,
                    day_of_week: new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
                    meal_type: mealType,
                    servings: 1,
                }))
            ),
        }, { onFinish: () => setIsSaving(false) });
    };

    const handleChangeRecipe = (recipe: UserRecipe) => {
        if (!changeSlot || !draftPlan) return;
        const updated = JSON.parse(JSON.stringify(draftPlan)) as GeneratedPlan;
        (updated.days[changeSlot.dayIdx].meals as any)[changeSlot.mealType].recipe = {
            id: recipe.id,
            name: recipe.name,
            calories_per_serving: recipe.calories_per_serving,
            description: recipe.description,
        };
        setDraftPlan(updated);
        setChangeSlot(null);
    };

    const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;

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

                {/* AI Plan Generator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Generar plan con IA
                        </CardTitle>
                        <CardDescription>
                            La IA creará un plan de desayuno, almuerzo y cena desde hoy hasta el domingo, usando tus recetas existentes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!draftPlan && (
                            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generando plan...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generar plan con IA para esta semana
                                    </>
                                )}
                            </Button>
                        )}

                        {aiError && (
                            <p className="text-sm text-destructive">{aiError}</p>
                        )}

                        {draftPlan && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">{draftPlan.name}</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating} className="gap-1">
                                            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                            Regenerar
                                        </Button>
                                        <Button size="sm" onClick={handleSavePlan} disabled={isSaving} className="gap-1">
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Guardar plan
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {draftPlan.days.map((day, dayIdx) => (
                                        <Card key={day.date} className="border border-muted">
                                            <CardHeader className="py-3 px-4">
                                                <CardTitle className="text-base font-semibold capitalize">{day.day_label}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="py-2 px-4 space-y-2">
                                                {mealTypes.map(mealType => {
                                                    const meal = day.meals[mealType];
                                                    if (!meal) return null;
                                                    return (
                                                        <div key={mealType} className="flex items-center justify-between gap-2 py-1 border-b last:border-0">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">
                                                                    {meal.meal_label}
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium truncate">{meal.recipe.name}</p>
                                                                    {meal.recipe.calories_per_serving && (
                                                                        <p className="text-xs text-muted-foreground">{meal.recipe.calories_per_serving} kcal</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="shrink-0 text-xs"
                                                                onClick={() => setChangeSlot({ dayIdx, mealType })}
                                                            >
                                                                Cambiar
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleSavePlan} disabled={isSaving} className="gap-2">
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Guardar plan
                                    </Button>
                                    <Button variant="outline" onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                        Regenerar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Existing Plans Tabs */}
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

            {/* Change Slot Dialog */}
            <Dialog open={changeSlot !== null} onOpenChange={(open) => { if (!open) setChangeSlot(null); }}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Utensils className="h-4 w-4" />
                            Cambiar receta
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-2">
                        {userRecipes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No tienes recetas guardadas. Crea recetas primero.
                            </p>
                        ) : (
                            userRecipes.map((recipe) => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleChangeRecipe(recipe)}
                                    className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <div className="font-medium text-sm">{recipe.name}</div>
                                    <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                                        <span className="capitalize">{recipe.category}</span>
                                        {recipe.calories_per_serving && (
                                            <span>· {recipe.calories_per_serving} kcal</span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
