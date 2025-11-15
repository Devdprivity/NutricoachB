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
import { Plus, Trash2, Dumbbell, TrendingUp, Calendar, Star, CheckCircle2, Clock, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { WorkoutPlansSkeleton } from '@/components/skeletons/workout-plans-skeleton';
import axios from 'axios';

interface Exercise {
    id?: number;
    name: string;
    description?: string;
    muscle_group?: string;
    sets: number;
    reps?: number;
    duration_seconds?: number;
    weight_kg?: number;
    rest_seconds: number;
    order: number;
    video_url?: string;
    image_url?: string;
    instructions?: string[];
}

interface WorkoutPlan {
    id: number;
    name: string;
    description?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration_weeks?: number;
    schedule?: { [key: string]: boolean };
    goal?: string;
    is_active: boolean;
    is_public: boolean;
    times_completed: number;
    exercises_count: number;
    exercises: Exercise[];
    today_progress: number;
    created_at: string;
}

interface Stats {
    total_plans: number;
    active_plans: number;
    total_workouts_logged: number;
    workouts_this_week: number;
}

interface WorkoutPlansProps {
    plans: WorkoutPlan[];
    publicPlans: WorkoutPlan[];
    stats: Stats;
}

export default function WorkoutPlans({ plans, publicPlans, stats }: WorkoutPlansProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Initial load
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // Navigation events
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
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
        duration_weeks: '',
        goal: '',
        is_active: true,
        is_public: false,
    });
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExercise, setCurrentExercise] = useState<Exercise>({
        name: '',
        description: '',
        muscle_group: '',
        sets: 3,
        reps: 10,
        duration_seconds: undefined,
        weight_kg: undefined,
        rest_seconds: 60,
        order: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (exercises.length === 0) {
            alert('Debes agregar al menos un ejercicio');
            return;
        }

        try {
            await axios.post('/workout-plans', {
                ...formData,
                duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
                exercises,
            });

            setIsCreateDialogOpen(false);
            router.reload();

            // Reset form
            setFormData({
                name: '',
                description: '',
                difficulty: 'intermediate',
                duration_weeks: '',
                goal: '',
                is_active: true,
                is_public: false,
            });
            setExercises([]);
        } catch (error) {
            console.error('Error creating workout plan:', error);
            alert('Error al crear el plan de entrenamiento');
        }
    };

    const addExercise = () => {
        if (!currentExercise.name) {
            alert('El nombre del ejercicio es requerido');
            return;
        }

        setExercises([...exercises, { ...currentExercise, order: exercises.length }]);
        setCurrentExercise({
            name: '',
            description: '',
            muscle_group: '',
            sets: 3,
            reps: 10,
            duration_seconds: undefined,
            weight_kg: undefined,
            rest_seconds: 60,
            order: exercises.length + 1,
        });
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const deletePlan = async (planId: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este plan?')) {
            return;
        }

        try {
            await axios.delete(`/workout-plans/${planId}`);
            router.reload();
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Error al eliminar el plan');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500';
            case 'intermediate':
                return 'bg-yellow-500';
            case 'advanced':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'Principiante';
            case 'intermediate':
                return 'Intermedio';
            case 'advanced':
                return 'Avanzado';
            default:
                return difficulty;
        }
    };

    return (
        <AppLayout>
            <Head title="Planes de Entrenamiento" />

            {isLoading ? (
                <WorkoutPlansSkeleton />
            ) : (
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Planes de Entrenamiento</h1>
                        <p className="text-muted-foreground">Crea y sigue tus rutinas de ejercicio</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Plan de Entrenamiento</DialogTitle>
                                <DialogDescription>
                                    Define tu plan y agrega los ejercicios
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre del Plan *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                                <SelectItem value="beginner">Principiante</SelectItem>
                                                <SelectItem value="intermediate">Intermedio</SelectItem>
                                                <SelectItem value="advanced">Avanzado</SelectItem>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration_weeks">Duración (semanas)</Label>
                                        <Input
                                            id="duration_weeks"
                                            type="number"
                                            min="1"
                                            value={formData.duration_weeks}
                                            onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="goal">Objetivo</Label>
                                        <Input
                                            id="goal"
                                            value={formData.goal}
                                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                            placeholder="ej: Ganar masa muscular"
                                        />
                                    </div>
                                </div>

                                {/* Exercise Builder */}
                                <div className="border rounded-lg p-4 space-y-4">
                                    <h3 className="font-semibold">Agregar Ejercicios</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="exercise_name">Nombre del Ejercicio *</Label>
                                            <Input
                                                id="exercise_name"
                                                value={currentExercise.name}
                                                onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="muscle_group">Grupo Muscular</Label>
                                            <Select
                                                value={currentExercise.muscle_group}
                                                onValueChange={(value) => setCurrentExercise({ ...currentExercise, muscle_group: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pecho">Pecho</SelectItem>
                                                    <SelectItem value="espalda">Espalda</SelectItem>
                                                    <SelectItem value="piernas">Piernas</SelectItem>
                                                    <SelectItem value="hombros">Hombros</SelectItem>
                                                    <SelectItem value="brazos">Brazos</SelectItem>
                                                    <SelectItem value="core">Core</SelectItem>
                                                    <SelectItem value="cardio">Cardio</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sets">Series *</Label>
                                            <Input
                                                id="sets"
                                                type="number"
                                                min="1"
                                                value={currentExercise.sets}
                                                onChange={(e) => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reps">Repeticiones</Label>
                                            <Input
                                                id="reps"
                                                type="number"
                                                min="1"
                                                value={currentExercise.reps || ''}
                                                onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value ? parseInt(e.target.value) : undefined })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weight_kg">Peso (kg)</Label>
                                            <Input
                                                id="weight_kg"
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={currentExercise.weight_kg || ''}
                                                onChange={(e) => setCurrentExercise({ ...currentExercise, weight_kg: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rest_seconds">Descanso (seg)</Label>
                                            <Input
                                                id="rest_seconds"
                                                type="number"
                                                min="0"
                                                value={currentExercise.rest_seconds}
                                                onChange={(e) => setCurrentExercise({ ...currentExercise, rest_seconds: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <Button type="button" onClick={addExercise} variant="outline" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar Ejercicio
                                    </Button>

                                    {/* Exercise List */}
                                    {exercises.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Ejercicios Agregados ({exercises.length})</Label>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {exercises.map((ex, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{ex.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {ex.sets} series × {ex.reps || '—'} reps
                                                                {ex.weight_kg && ` • ${ex.weight_kg}kg`}
                                                                {ex.muscle_group && ` • ${ex.muscle_group}`}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeExercise(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Crear Plan</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Planes</CardTitle>
                            <Dumbbell className="h-4 w-4 text-muted-foreground" />
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
                            <CardTitle className="text-sm font-medium">Entrenamientos Totales</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_workouts_logged}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.workouts_this_week}</div>
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
                                    <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground text-center">
                                        No tienes planes de entrenamiento aún.
                                        <br />
                                        ¡Crea tu primer plan para comenzar!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {plans.map((plan) => (
                                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="flex items-center gap-2">
                                                        {plan.name}
                                                        {plan.is_active && (
                                                            <Badge variant="default" className="text-xs">Activo</Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription>{plan.description}</CardDescription>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deletePlan(plan.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getDifficultyColor(plan.difficulty)}>
                                                    {getDifficultyLabel(plan.difficulty)}
                                                </Badge>
                                                {plan.goal && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Target className="h-3 w-3" />
                                                        {plan.goal}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Progreso hoy</span>
                                                    <span className="font-medium">{plan.today_progress}%</span>
                                                </div>
                                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full transition-all"
                                                        style={{ width: `${plan.today_progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Dumbbell className="h-3 w-3" />
                                                    <span>{plan.exercises_count} ejercicios</span>
                                                </div>
                                                {plan.duration_weeks && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{plan.duration_weeks} semanas</span>
                                                    </div>
                                                )}
                                            </div>

                                            {plan.exercises && plan.exercises.length > 0 && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground mb-1">Ejercicios:</p>
                                                    <div className="space-y-1">
                                                        {plan.exercises.slice(0, 3).map((ex) => (
                                                            <p key={ex.id} className="text-xs">
                                                                • {ex.name} ({ex.sets}×{ex.reps || '—'})
                                                            </p>
                                                        ))}
                                                        {plan.exercises_count > 3 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                +{plan.exercises_count - 3} más...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <Button className="w-full" variant="outline" asChild>
                                                <a href={`/workout-plans/${plan.id}`}>Ver Detalles</a>
                                            </Button>
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
                                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
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
                                        <CardContent className="space-y-3">
                                            <Badge className={getDifficultyColor(plan.difficulty)}>
                                                {getDifficultyLabel(plan.difficulty)}
                                            </Badge>
                                            <div className="text-sm text-muted-foreground">
                                                <Dumbbell className="inline h-3 w-3 mr-1" />
                                                {plan.exercises_count} ejercicios
                                            </div>
                                            <Button className="w-full" variant="outline" asChild>
                                                <a href={`/workout-plans/${plan.id}`}>Ver Detalles</a>
                                            </Button>
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
