import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Clock, Users, ChefHat, Star, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { RecipesSkeleton } from '@/components/skeletons/recipes-skeleton';

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
    ingredients_count: number;
    ingredients?: Ingredient[];
}

interface Stats {
    total_recipes: number;
    public_recipes: number;
    total_times_cooked: number;
    avg_rating: number;
}

interface RecipesProps {
    myRecipes: Recipe[];
    publicRecipes: Recipe[];
    stats: Stats;
}

export default function Recipes({ myRecipes, publicRecipes, stats }: RecipesProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        prep_time_minutes: '',
        cook_time_minutes: '',
        servings: '1',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        calories_per_serving: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        is_public: false,
    });
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
        name: '',
        quantity: 0,
        unit: 'g',
        order: 0,
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (ingredients.length === 0) {
            alert('Debes agregar al menos un ingrediente');
            return;
        }

        try {
            await axios.post('/recipes', {
                ...formData,
                prep_time_minutes: formData.prep_time_minutes ? parseInt(formData.prep_time_minutes) : null,
                cook_time_minutes: formData.cook_time_minutes ? parseInt(formData.cook_time_minutes) : null,
                servings: parseInt(formData.servings),
                calories_per_serving: formData.calories_per_serving ? parseInt(formData.calories_per_serving) : null,
                protein_g: formData.protein_g ? parseFloat(formData.protein_g) : null,
                carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : null,
                fat_g: formData.fat_g ? parseFloat(formData.fat_g) : null,
                ingredients,
            });

            setIsCreateDialogOpen(false);
            router.reload();
            resetForm();
        } catch (error) {
            console.error('Error creating recipe:', error);
            alert('Error al crear la receta');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            prep_time_minutes: '',
            cook_time_minutes: '',
            servings: '1',
            difficulty: 'medium',
            calories_per_serving: '',
            protein_g: '',
            carbs_g: '',
            fat_g: '',
            is_public: false,
        });
        setIngredients([]);
    };

    const addIngredient = () => {
        if (!currentIngredient.name || currentIngredient.quantity <= 0) {
            alert('Completa los datos del ingrediente');
            return;
        }

        setIngredients([...ingredients, { ...currentIngredient, order: ingredients.length }]);
        setCurrentIngredient({
            name: '',
            quantity: 0,
            unit: 'g',
            order: ingredients.length + 1,
        });
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const deleteRecipe = async (recipeId: number) => {
        if (!confirm('¿Eliminar esta receta?')) return;

        try {
            await axios.delete(`/recipes/${recipeId}`);
            router.reload();
        } catch (error) {
            console.error('Error deleting recipe:', error);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'hard':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'Fácil';
            case 'medium':
                return 'Media';
            case 'hard':
                return 'Difícil';
            default:
                return difficulty;
        }
    };

    return (
        <AppLayout>
            <Head title="Recetas" />

            {isLoading ? (
                <RecipesSkeleton />
            ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Recetas</h1>
                        <p className="text-muted-foreground">Gestiona tus recetas favoritas</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Receta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Crear Nueva Receta</DialogTitle>
                                <DialogDescription>
                                    Define los detalles de tu receta
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desayuno">Desayuno</SelectItem>
                                                <SelectItem value="almuerzo">Almuerzo</SelectItem>
                                                <SelectItem value="cena">Cena</SelectItem>
                                                <SelectItem value="snack">Snack</SelectItem>
                                                <SelectItem value="postre">Postre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="servings">Porciones *</Label>
                                        <Input
                                            id="servings"
                                            type="number"
                                            min="1"
                                            value={formData.servings}
                                            onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty">Dificultad *</Label>
                                        <Select
                                            value={formData.difficulty}
                                            onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">Fácil</SelectItem>
                                                <SelectItem value="medium">Media</SelectItem>
                                                <SelectItem value="hard">Difícil</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="prep_time">Prep (min)</Label>
                                        <Input
                                            id="prep_time"
                                            type="number"
                                            min="0"
                                            value={formData.prep_time_minutes}
                                            onChange={(e) => setFormData({ ...formData, prep_time_minutes: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cook_time">Cocción (min)</Label>
                                        <Input
                                            id="cook_time"
                                            type="number"
                                            min="0"
                                            value={formData.cook_time_minutes}
                                            onChange={(e) => setFormData({ ...formData, cook_time_minutes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="calories">Calorías</Label>
                                        <Input
                                            id="calories"
                                            type="number"
                                            min="0"
                                            value={formData.calories_per_serving}
                                            onChange={(e) => setFormData({ ...formData, calories_per_serving: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="protein">Proteína (g)</Label>
                                        <Input
                                            id="protein"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={formData.protein_g}
                                            onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="carbs">Carbos (g)</Label>
                                        <Input
                                            id="carbs"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={formData.carbs_g}
                                            onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fat">Grasas (g)</Label>
                                        <Input
                                            id="fat"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={formData.fat_g}
                                            onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div className="border rounded-lg p-4 space-y-4">
                                    <h3 className="font-semibold">Ingredientes</h3>
                                    <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-5 space-y-2">
                                            <Label htmlFor="ing_name">Nombre</Label>
                                            <Input
                                                id="ing_name"
                                                value={currentIngredient.name}
                                                onChange={(e) => setCurrentIngredient({ ...currentIngredient, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-2">
                                            <Label htmlFor="ing_quantity">Cantidad</Label>
                                            <Input
                                                id="ing_quantity"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={currentIngredient.quantity || ''}
                                                onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantity: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-2">
                                            <Label htmlFor="ing_unit">Unidad</Label>
                                            <Select
                                                value={currentIngredient.unit}
                                                onValueChange={(value) => setCurrentIngredient({ ...currentIngredient, unit: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="g">g</SelectItem>
                                                    <SelectItem value="kg">kg</SelectItem>
                                                    <SelectItem value="ml">ml</SelectItem>
                                                    <SelectItem value="l">l</SelectItem>
                                                    <SelectItem value="taza">taza</SelectItem>
                                                    <SelectItem value="cucharada">cda</SelectItem>
                                                    <SelectItem value="cucharadita">cdta</SelectItem>
                                                    <SelectItem value="unidad">unidad</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-1 flex items-end">
                                            <Button type="button" onClick={addIngredient} size="sm">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {ingredients.length > 0 && (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {ingredients.map((ing, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                    <span>{ing.name} - {ing.quantity} {ing.unit}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeIngredient(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Crear Receta</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Recetas</CardTitle>
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_recipes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Públicas</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.public_recipes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Veces Cocinadas</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_times_cooked}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_rating?.toFixed(1) || '—'}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="my-recipes" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="my-recipes">Mis Recetas</TabsTrigger>
                        <TabsTrigger value="public">Recetas Públicas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-recipes" className="space-y-4">
                        {myRecipes.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No tienes recetas aún</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myRecipes.map((recipe) => (
                                    <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle>{recipe.name}</CardTitle>
                                                    <CardDescription>{recipe.description}</CardDescription>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteRecipe(recipe.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getDifficultyColor(recipe.difficulty)}>
                                                    {getDifficultyLabel(recipe.difficulty)}
                                                </Badge>
                                                {recipe.category && (
                                                    <Badge variant="outline">{recipe.category}</Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>{recipe.servings} porciones</span>
                                                </div>
                                                {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min</span>
                                                    </div>
                                                )}
                                            </div>

                                            {recipe.calories_per_serving && (
                                                <div className="text-sm">
                                                    <span className="font-medium">{recipe.calories_per_serving}</span> kcal/porción
                                                </div>
                                            )}

                                            <div className="text-xs text-muted-foreground">
                                                Cocinada {recipe.times_cooked} veces
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="public" className="space-y-4">
                        {publicRecipes.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No hay recetas públicas disponibles</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicRecipes.map((recipe) => (
                                    <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle>{recipe.name}</CardTitle>
                                            <CardDescription>{recipe.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Badge className={getDifficultyColor(recipe.difficulty)}>
                                                {getDifficultyLabel(recipe.difficulty)}
                                            </Badge>
                                            <div className="text-sm text-muted-foreground">
                                                <Users className="inline h-3 w-3 mr-1" />
                                                {recipe.servings} porciones
                                            </div>
                                            {recipe.calories_per_serving && (
                                                <div className="text-sm">
                                                    {recipe.calories_per_serving} kcal/porción
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
            )}
        </AppLayout>
    );
}
