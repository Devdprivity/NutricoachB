import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, ChefHat, CheckCircle2, Star, Flame, UtensilsCrossed } from 'lucide-react';
import { RecipeDetailSkeleton } from '@/components/skeletons/recipe-detail-skeleton';
import { useState, useEffect } from 'react';

interface Ingredient {
    id?: number;
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
    order: number;
}

interface Recipe {
    id: number;
    name: string;
    description?: string;
    category?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    instructions?: string[];
    image_url?: string;
    is_public: boolean;
    calories_per_serving?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    times_cooked: number;
    rating?: number;
    ingredients: Ingredient[];
}

interface RecipeDetailProps {
    recipe: Recipe;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
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
                <RecipeDetailSkeleton />
            </AppLayout>
        );
    }

    const difficultyColors = {
        easy: 'bg-green-500',
        medium: 'bg-yellow-500',
        hard: 'bg-red-500',
    };

    const difficultyLabels = {
        easy: 'Fácil',
        medium: 'Intermedio',
        hard: 'Difícil',
    };

    const handleMarkAsCooked = () => {
        router.post(`/recipes/${recipe.id}/cooked`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={recipe.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/recipes" preserveScroll>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">{recipe.name}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image */}
                        {recipe.image_url && (
                            <Card>
                                <CardContent className="p-0">
                                    <img
                                        src={recipe.image_url}
                                        alt={recipe.name}
                                        className="w-full h-96 object-cover rounded-lg"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        {recipe.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Descripción</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{recipe.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Ingredients */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UtensilsCrossed className="h-5 w-5" />
                                    Ingredientes
                                </CardTitle>
                                <CardDescription>
                                    Para {recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {recipe.ingredients?.map((ingredient, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span>
                                                <strong>{ingredient.quantity} {ingredient.unit}</strong> {ingredient.name}
                                                {ingredient.notes && (
                                                    <span className="text-muted-foreground"> - {ingredient.notes}</span>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        {recipe.instructions && recipe.instructions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ChefHat className="h-5 w-5" />
                                        Instrucciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-4">
                                        {recipe.instructions.map((step, index) => (
                                            <li key={index} className="flex gap-4">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p>{step}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recipe Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Difficulty */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Dificultad</span>
                                    <Badge className={difficultyColors[recipe.difficulty]}>
                                        {difficultyLabels[recipe.difficulty]}
                                    </Badge>
                                </div>

                                {/* Prep Time */}
                                {recipe.prep_time_minutes && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Tiempo de preparación</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{recipe.prep_time_minutes} min</span>
                                        </div>
                                    </div>
                                )}

                                {/* Cook Time */}
                                {recipe.cook_time_minutes && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Tiempo de cocción</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{recipe.cook_time_minutes} min</span>
                                        </div>
                                    </div>
                                )}

                                {/* Servings */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Porciones</span>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{recipe.servings}</span>
                                    </div>
                                </div>

                                {/* Rating */}
                                {recipe.rating && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Calificación</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span>{recipe.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Times Cooked */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Veces cocinada</span>
                                    <span>{recipe.times_cooked}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nutrition Info */}
                        {(recipe.calories_per_serving || recipe.protein_g || recipe.carbs_g || recipe.fat_g) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Nutricional</CardTitle>
                                    <CardDescription>Por porción</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {recipe.calories_per_serving && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Flame className="h-4 w-4 text-orange-500" />
                                                <span>Calorías</span>
                                            </div>
                                            <span className="font-semibold">{recipe.calories_per_serving} kcal</span>
                                        </div>
                                    )}
                                    {recipe.protein_g && (
                                        <div className="flex items-center justify-between">
                                            <span>Proteína</span>
                                            <span className="font-semibold">{recipe.protein_g} g</span>
                                        </div>
                                    )}
                                    {recipe.carbs_g && (
                                        <div className="flex items-center justify-between">
                                            <span>Carbohidratos</span>
                                            <span className="font-semibold">{recipe.carbs_g} g</span>
                                        </div>
                                    )}
                                    {recipe.fat_g && (
                                        <div className="flex items-center justify-between">
                                            <span>Grasas</span>
                                            <span className="font-semibold">{recipe.fat_g} g</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Button onClick={handleMarkAsCooked} className="w-full" size="lg">
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Marcar como cocinada
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

