import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Activity, Dumbbell, Play, Flame, TrendingUp, Target, Clock, Zap, X, Video, Info, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ExercisesSkeleton } from '@/components/skeletons/exercises-skeleton';
import { ExerciseSwipe } from '@/components/exercise-swipe';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ejercicios', href: '/exercises' },
];

interface Exercise {
    id: string | number;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    calories_per_minute: number;
    image_url?: string | null;
    video_url?: string | null;
    gif_url?: string | null;
    muscles_worked: string | null;
    instructions: string | null;
    equipment: string | null;
    duration_minutes: number;
}

interface ExerciseLog {
    id: number;
    exercise: {
        id: number;
        name: string;
        image_url: string | null;
    };
    duration_minutes: number;
    calories_burned: number;
    intensity: number;
    status: string;
    start_time: string;
    notes: string | null;
}

interface CalorieBalance {
    consumed: number;
    burned: number;
    net: number;
    goal: number;
    over_goal: number;
}

interface Recommendation {
    type: string;
    message: string;
    minutes_needed?: number;
    exercises: Exercise[];
}

interface ExerciseData {
    exercises: Exercise[];
    today_logs: ExerciseLog[];
    calorie_balance: CalorieBalance;
    recommendations: Recommendation[];
}

interface Props {
    exerciseData: ExerciseData;
}

export default function Exercises({ exerciseData }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

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

    const { data, setData, post, processing, reset } = useForm({
        exercise_id: 0,
        duration_minutes: 30,
        intensity: 5,
        notes: '',
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500';
            case 'intermediate': return 'bg-yellow-500';
            case 'advanced': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'cardio': return <Flame className="h-4 w-4" />;
            case 'strength': return <Dumbbell className="h-4 w-4" />;
            case 'flexibility': return <Activity className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const handleExerciseClick = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setData('exercise_id', exercise.id);
        setData('duration_minutes', exercise.duration_minutes);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('exercises.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
                setSelectedExercise(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este registro de ejercicio?')) {
            router.delete(route('exercises.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const getVideoEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // Filtrado por dificultad
    const filteredExercises = exerciseData.exercises.filter(ex => {
        // Filtro por dificultad
        const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
        return matchesDifficulty;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ejercicios" />

            {isLoading ? (
                <ExercisesSkeleton />
            ) : (
                <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ejercicios y Entrenamiento</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Entrena de forma inteligente basado en tu nutrición</p>
                </div>

                {/* Calorie Balance Dashboard */}
                {/* Mobile: Slider horizontal */}
                <div className="md:hidden overflow-x-auto scrollbar-hide snap-x -mx-3 px-3">
                    <div className="flex gap-2 pb-2">
                        <Card className="flex-shrink-0 w-[140px] snap-start">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2.5">
                                <CardTitle className="text-xs font-medium">Consumidas</CardTitle>
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-2.5 pt-0">
                                <div className="text-lg font-bold">{exerciseData.calorie_balance.consumed}</div>
                                <p className="text-[10px] text-muted-foreground">kcal hoy</p>
                            </CardContent>
                        </Card>

                        <Card className="flex-shrink-0 w-[140px] snap-start">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2.5">
                                <CardTitle className="text-xs font-medium">Quemadas</CardTitle>
                                <Flame className="h-3 w-3 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-2.5 pt-0">
                                <div className="text-lg font-bold">{exerciseData.calorie_balance.burned}</div>
                                <p className="text-[10px] text-muted-foreground">kcal ejercicio</p>
                            </CardContent>
                        </Card>

                        <Card className="flex-shrink-0 w-[140px] snap-start">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2.5">
                                <CardTitle className="text-xs font-medium">Balance</CardTitle>
                                <Target className="h-3 w-3 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-2.5 pt-0">
                                <div className="text-lg font-bold">{exerciseData.calorie_balance.net}</div>
                                <p className="text-[10px] text-muted-foreground">Meta: {exerciseData.calorie_balance.goal}</p>
                            </CardContent>
                        </Card>

                        <Card className="flex-shrink-0 w-[140px] snap-start">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2.5">
                                <CardTitle className="text-xs font-medium">Exceso</CardTitle>
                                <Zap className="h-3 w-3 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-2.5 pt-0">
                                <div className={`text-lg font-bold ${exerciseData.calorie_balance.over_goal > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {exerciseData.calorie_balance.over_goal}
                                </div>
                                <p className="text-[10px] text-muted-foreground">kcal encima</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Desktop: Grid normal */}
                <div className="hidden md:grid md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Calorías Consumidas</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{exerciseData.calorie_balance.consumed}</div>
                            <p className="text-xs text-muted-foreground">kcal hoy</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Calorías Quemadas</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{exerciseData.calorie_balance.burned}</div>
                            <p className="text-xs text-muted-foreground">kcal en ejercicio</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{exerciseData.calorie_balance.net}</div>
                            <p className="text-xs text-muted-foreground">Meta: {exerciseData.calorie_balance.goal} kcal</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Exceso</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${exerciseData.calorie_balance.over_goal > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                {exerciseData.calorie_balance.over_goal}
                            </div>
                            <p className="text-xs text-muted-foreground">kcal por encima</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Exercises and Recommendations */}
                {/* Mobile: Slider horizontal */}
                <div className="md:hidden overflow-x-auto scrollbar-hide snap-x -mx-3 px-3">
                    <div className="flex gap-3 pb-2">
                        <Card className="flex-shrink-0 w-[85vw] snap-start">
                            <CardHeader className="p-3">
                                <CardTitle className="text-sm">Ejercicios de Hoy</CardTitle>
                                <CardDescription className="text-xs">{exerciseData.today_logs.length} completados</CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                {exerciseData.today_logs.length === 0 ? (
                                    <div className="text-center py-3">
                                        <Activity className="h-7 w-7 text-muted-foreground mx-auto mb-1.5" />
                                        <p className="text-xs text-muted-foreground">No has registrado ejercicios hoy</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">¡Empieza ahora!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {exerciseData.today_logs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3 flex-1">
                                                {log.exercise.image_url && (
                                                    <img
                                                        src={log.exercise.image_url}
                                                        alt={log.exercise.name}
                                                        className="h-12 w-12 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{log.exercise.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {log.duration_minutes} min • {log.calories_burned} kcal • {log.start_time}
                                                    </div>
                                                    {log.notes && (
                                                        <div className="text-xs text-muted-foreground mt-1">{log.notes}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Intensidad: {log.intensity}/10</Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(log.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex-shrink-0 w-[85vw] snap-start">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm">Recomendaciones</CardTitle>
                            <CardDescription className="text-xs">Basadas en tu nutrición</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <Tabs defaultValue="0" className="w-full">
                                <TabsList className="grid w-full h-8 text-xs" style={{ gridTemplateColumns: `repeat(${exerciseData.recommendations.length}, 1fr)` }}>
                                    {exerciseData.recommendations.map((_, index) => (
                                        <TabsTrigger key={index} value={index.toString()} className="text-xs">
                                            {index + 1}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {exerciseData.recommendations.map((rec, index) => (
                                    <TabsContent key={index} value={index.toString()} className="space-y-2 mt-2">
                                        <div className="text-xs text-muted-foreground p-2 bg-muted rounded-lg">
                                            {rec.message}
                                            {rec.minutes_needed && (
                                                <div className="mt-1 font-medium text-primary text-[11px]">
                                                    Tiempo: {rec.minutes_needed} min
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                            {rec.exercises.map((exercise) => (
                                                <div
                                                    key={exercise.id}
                                                    className="flex items-center justify-between p-2 border rounded-lg active:bg-muted/50 cursor-pointer transition-colors"
                                                    onClick={() => handleExerciseClick(exercise)}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        {exercise.image_url && (
                                                            <img
                                                                src={exercise.image_url}
                                                                alt={exercise.name}
                                                                className="h-8 w-8 rounded object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-xs truncate">{exercise.name}</div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                {exercise.duration_minutes}m • {exercise.calories_per_minute * exercise.duration_minutes} kcal
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" className="h-7 text-xs px-2 flex-shrink-0 ml-2">
                                                        <Play className="h-2.5 w-2.5 mr-1" />
                                                        Ir
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                    </div>
                </div>

                {/* Desktop: Grid normal */}
                <div className="hidden md:grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="p-6">
                            <CardTitle className="text-lg">Ejercicios de Hoy</CardTitle>
                            <CardDescription className="text-sm">{exerciseData.today_logs.length} ejercicios completados</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            {exerciseData.today_logs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-base text-muted-foreground">No has registrado ejercicios hoy</p>
                                    <p className="text-sm text-muted-foreground mt-1">¡Empieza tu entrenamiento ahora!</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {exerciseData.today_logs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3 flex-1">
                                                {log.exercise.image_url && (
                                                    <img
                                                        src={log.exercise.image_url}
                                                        alt={log.exercise.name}
                                                        className="h-12 w-12 rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{log.exercise.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {log.duration_minutes} min • {log.calories_burned} kcal • {log.start_time}
                                                    </div>
                                                    {log.notes && (
                                                        <div className="text-xs text-muted-foreground mt-1">{log.notes}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Intensidad: {log.intensity}/10</Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(log.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-6">
                            <CardTitle className="text-lg">Recomendaciones Personalizadas</CardTitle>
                            <CardDescription className="text-sm">Basadas en tu nutrición y nivel de actividad</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <Tabs defaultValue="0" className="w-full">
                                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${exerciseData.recommendations.length}, 1fr)` }}>
                                    {exerciseData.recommendations.map((_, index) => (
                                        <TabsTrigger key={index} value={index.toString()}>
                                            {index + 1}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {exerciseData.recommendations.map((rec, index) => (
                                    <TabsContent key={index} value={index.toString()} className="space-y-4">
                                        <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                                            {rec.message}
                                            {rec.minutes_needed && (
                                                <div className="mt-2 font-medium text-primary">
                                                    Tiempo sugerido: {rec.minutes_needed} minutos
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {rec.exercises.map((exercise) => (
                                                <div
                                                    key={exercise.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                    onClick={() => handleExerciseClick(exercise)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {exercise.image_url && (
                                                            <img
                                                                src={exercise.image_url}
                                                                alt={exercise.name}
                                                                className="h-10 w-10 rounded object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{exercise.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {exercise.duration_minutes} min • {exercise.calories_per_minute * exercise.duration_minutes} kcal
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button size="sm">
                                                        <Play className="h-3 w-3 mr-1" />
                                                        Iniciar
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Exercise Library - Diseño Visual Mejorado */}
                <div className="space-y-3 md:space-y-6">
                    {/* Header con Título */}
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Biblioteca de Ejercicios</h2>
                        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Explora todos los ejercicios disponibles con GIFs animados</p>
                    </div>

                    {/* Filtro de dificultad */}
                    <div className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
                        <Button
                            size="sm"
                            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedDifficulty('all')}
                            className="h-7 md:h-8 text-[11px] md:text-xs px-2 md:px-3 flex-shrink-0"
                        >
                            Todos
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
                            onClick={() => setSelectedDifficulty('beginner')}
                            className="h-7 md:h-8 text-[11px] md:text-xs px-2 md:px-3 flex-shrink-0"
                        >
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                            Beginner
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
                            onClick={() => setSelectedDifficulty('intermediate')}
                            className="h-7 md:h-8 text-[11px] md:text-xs px-2 md:px-3 flex-shrink-0"
                        >
                            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
                            Intermediate
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
                            onClick={() => setSelectedDifficulty('advanced')}
                            className="h-7 md:h-8 text-[11px] md:text-xs px-2 md:px-3 flex-shrink-0"
                        >
                            <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                            Advanced
                        </Button>
                    </div>

                    {/* Ejercicios con Swipe en Mobile y Grid en Desktop */}
                    {filteredExercises.length > 0 ? (
                        <ExerciseSwipe
                            exercises={filteredExercises}
                            onExerciseClick={handleExerciseClick}
                            getDifficultyColor={getDifficultyColor}
                        />
                    ) : (
                        <div className="text-center py-20">
                            <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No se encontraron ejercicios</h3>
                            <p className="text-muted-foreground mb-4">Intenta seleccionar un nivel de dificultad diferente</p>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedDifficulty('all')}
                            >
                                Ver todos los ejercicios
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* Exercise Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedExercise && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{selectedExercise.name}</DialogTitle>
                                <DialogDescription>{selectedExercise.description}</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* GIF Animation */}
                                {selectedExercise.gif_url && (
                                    <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                        <img
                                            src={selectedExercise.gif_url}
                                            alt={selectedExercise.name}
                                            className="w-full h-auto max-h-[500px] object-contain"
                                        />
                                    </div>
                                )}

                                {/* Exercise Info */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-2">
                                        <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                                            {selectedExercise.difficulty}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">Dificultad</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Dumbbell className="h-4 w-4" />
                                        <span className="text-sm">{selectedExercise.equipment || 'Sin equipo'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        <span className="text-sm">{selectedExercise.muscles_worked}</span>
                                    </div>
                                </div>

                                {/* Instructions */}
                                {selectedExercise.instructions && (
                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Instrucciones
                                        </h3>
                                        <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-4 rounded-lg">
                                            {selectedExercise.instructions}
                                        </div>
                                    </div>
                                )}

                                {/* Log Exercise Form */}
                                <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
                                    <h3 className="font-semibold">Registrar Ejercicio</h3>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                                            <Input
                                                id="duration_minutes"
                                                type="number"
                                                min="1"
                                                value={data.duration_minutes}
                                                onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Calorías estimadas: {(selectedExercise.calories_per_minute * data.duration_minutes).toFixed(0)} kcal
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="intensity">Intensidad: {data.intensity}/10</Label>
                                            <Slider
                                                id="intensity"
                                                min={1}
                                                max={10}
                                                step={1}
                                                value={[data.intensity]}
                                                onValueChange={(value) => setData('intensity', value[0])}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notas (opcional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Cómo te sentiste, dificultades, logros..."
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Guardando...' : 'Registrar Ejercicio'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
