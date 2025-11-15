import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Dumbbell, Clock, Target, TrendingUp, Calendar, CheckCircle2, Play } from 'lucide-react';
import { WorkoutPlanDetailSkeleton } from '@/components/skeletons/workout-plan-detail-skeleton';
import { useState, useEffect } from 'react';

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

interface WorkoutPlanDetailProps {
    plan: WorkoutPlan;
    recentLogs?: any[];
    weeklyProgress?: any[];
}

export default function WorkoutPlanDetail({ plan: workoutPlan }: WorkoutPlanDetailProps) {
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
                <WorkoutPlanDetailSkeleton />
            </AppLayout>
        );
    }

    const difficultyColors = {
        beginner: 'bg-green-500',
        intermediate: 'bg-yellow-500',
        advanced: 'bg-red-500',
    };

    const difficultyLabels = {
        beginner: 'Principiante',
        intermediate: 'Intermedio',
        advanced: 'Avanzado',
    };

    const dayNames: { [key: string]: string } = {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo',
    };

    const handleLogWorkout = () => {
        router.post('/workout-plans/log', {
            workout_plan_id: workoutPlan.id,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={workoutPlan.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/workout-plans" preserveScroll>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{workoutPlan.name}</h1>
                        {workoutPlan.description && (
                            <p className="text-muted-foreground mt-1">{workoutPlan.description}</p>
                        )}
                    </div>
                    <Badge className={difficultyColors[workoutPlan.difficulty]}>
                        {difficultyLabels[workoutPlan.difficulty]}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Exercises */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Dumbbell className="h-5 w-5" />
                                    Ejercicios ({workoutPlan.exercises_count})
                                </CardTitle>
                                <CardDescription>
                                    Lista completa de ejercicios del plan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {workoutPlan.exercises?.map((exercise, index) => (
                                        <Card key={index} className="border-l-4 border-l-primary">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <span className="text-primary font-bold">
                                                                {index + 1}.
                                                            </span>
                                                            {exercise.name}
                                                        </CardTitle>
                                                        {exercise.muscle_group && (
                                                            <Badge variant="outline" className="mt-2">
                                                                {exercise.muscle_group}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {exercise.image_url && (
                                                        <img
                                                            src={exercise.image_url}
                                                            alt={exercise.name}
                                                            className="h-20 w-20 rounded object-cover"
                                                        />
                                                    )}
                                                </div>
                                                {exercise.description && (
                                                    <CardDescription className="mt-2">
                                                        {exercise.description}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {exercise.sets > 0 && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Series</p>
                                                            <p className="text-lg font-semibold">{exercise.sets}</p>
                                                        </div>
                                                    )}
                                                    {exercise.reps && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Repeticiones</p>
                                                            <p className="text-lg font-semibold">{exercise.reps}</p>
                                                        </div>
                                                    )}
                                                    {exercise.duration_seconds && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Duración</p>
                                                            <p className="text-lg font-semibold">
                                                                {Math.floor(exercise.duration_seconds / 60)} min
                                                            </p>
                                                        </div>
                                                    )}
                                                    {exercise.rest_seconds > 0 && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Descanso</p>
                                                            <p className="text-lg font-semibold">
                                                                {exercise.rest_seconds} seg
                                                            </p>
                                                        </div>
                                                    )}
                                                    {exercise.weight_kg && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Peso</p>
                                                            <p className="text-lg font-semibold">{exercise.weight_kg} kg</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {exercise.instructions && exercise.instructions.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t">
                                                        <p className="text-sm font-semibold mb-2">Instrucciones:</p>
                                                        <ul className="space-y-1">
                                                            {exercise.instructions.map((instruction, i) => (
                                                                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                                    <span className="text-primary">•</span>
                                                                    <span>{instruction}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {exercise.video_url && (
                                                    <div className="mt-4">
                                                        <a
                                                            href={exercise.video_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            Ver video de demostración →
                                                        </a>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
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
                                {/* Difficulty */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Dificultad</span>
                                    <Badge className={difficultyColors[workoutPlan.difficulty]}>
                                        {difficultyLabels[workoutPlan.difficulty]}
                                    </Badge>
                                </div>

                                {/* Duration */}
                                {workoutPlan.duration_weeks && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Duración</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{workoutPlan.duration_weeks} semanas</span>
                                        </div>
                                    </div>
                                )}

                                {/* Goal */}
                                {workoutPlan.goal && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Objetivo</span>
                                        <div className="flex items-center gap-1">
                                            <Target className="h-4 w-4" />
                                            <span>{workoutPlan.goal}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Times Completed */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Completado</span>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>{workoutPlan.times_completed} veces</span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Estado</span>
                                    <Badge variant={workoutPlan.is_active ? 'default' : 'secondary'}>
                                        {workoutPlan.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule */}
                        {workoutPlan.schedule && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Horario</CardTitle>
                                    <CardDescription>Días de la semana</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(workoutPlan.schedule).map(([day, active]) => (
                                            <div key={day} className="flex items-center justify-between">
                                                <span className="text-sm">{dayNames[day] || day}</span>
                                                {active ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <span className="h-4 w-4 rounded-full border-2 border-muted"></span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Button onClick={handleLogWorkout} className="w-full" size="lg">
                            <Play className="mr-2 h-5 w-5" />
                            Registrar entrenamiento
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

