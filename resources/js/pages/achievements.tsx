import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Award, Calendar, Flame, Lock, Star, TrendingUp, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Logros', href: '/achievements' },
];

interface Achievement {
    id: number;
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xp_reward: number;
    difficulty: number;
    unlocked: boolean;
    unlocked_at?: string;
    progress: number;
}

interface Streak {
    type: string;
    current_count: number;
    longest_count: number;
    last_activity: string;
    is_active_today: boolean;
}

interface XpTransaction {
    xp_amount: number;
    source: string;
    description: string;
    created_at: string;
}

interface ProgressData {
    level: number;
    total_xp: number;
    xp_to_next_level: number;
    progress_percent: number;
    total_achievements: number;
    unlocked_achievements: number;
}

interface AchievementsData {
    progress: ProgressData;
    achievements: Record<string, Achievement[]>;
    streaks: Streak[];
    recent_xp: XpTransaction[];
}

export default function Achievements({ progress, achievements, streaks, recent_xp }: AchievementsData) {
    const categoryLabels: Record<string, string> = {
        nutrition: 'Nutrición',
        exercise: 'Ejercicios',
        hydration: 'Hidratación',
        level: 'Niveles',
        streak: 'Rachas',
    };

    const categoryIcons: Record<string, React.ReactNode> = {
        nutrition: <Award className="h-5 w-5" />,
        exercise: <Zap className="h-5 w-5" />,
        hydration: <Star className="h-5 w-5" />,
        level: <TrendingUp className="h-5 w-5" />,
        streak: <Flame className="h-5 w-5" />,
    };

    const getDifficultyColor = (difficulty: number) => {
        if (difficulty <= 2) return 'bg-green-500';
        if (difficulty <= 3) return 'bg-blue-500';
        if (difficulty <= 4) return 'bg-purple-500';
        return 'bg-orange-500';
    };

    const getDifficultyLabel = (difficulty: number) => {
        if (difficulty <= 2) return 'Fácil';
        if (difficulty <= 3) return 'Medio';
        if (difficulty <= 4) return 'Difícil';
        return 'Épico';
    };

    const getStreakIcon = (type: string) => {
        if (type === 'meals') return '🍽️';
        if (type === 'exercise') return '💪';
        if (type === 'hydration') return '💧';
        return '🔥';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logros y Gamificación" />

            <div className="flex flex-col gap-6 p-6" data-page="achievements">
                {/* Header con nivel y XP */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Logros y Gamificación</h1>
                        <p className="text-muted-foreground">
                            Tu progreso, rachas y recompensas
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-primary">Nivel {progress.level}</div>
                        <p className="text-sm text-muted-foreground">
                            {progress.total_xp} XP Total
                        </p>
                    </div>
                </div>

                {/* Tarjetas de estadísticas principales */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Progreso de Nivel */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <CardTitle>Progreso al Nivel {progress.level + 1}</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-lg">
                                    {progress.progress_percent}%
                                </Badge>
                            </div>
                            <CardDescription>
                                {progress.xp_to_next_level - (progress.total_xp % progress.xp_to_next_level)} XP restantes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={progress.progress_percent} className="h-4" />
                            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                <span>Nivel {progress.level}</span>
                                <span>Nivel {progress.level + 1}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logros Desbloqueados */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                <CardTitle>Logros</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {progress.unlocked_achievements}/{progress.total_achievements}
                            </div>
                            <Progress
                                value={(progress.unlocked_achievements / progress.total_achievements) * 100}
                                className="mt-2 h-2"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                {Math.round((progress.unlocked_achievements / progress.total_achievements) * 100)}% completado
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Rachas Activas */}
                {streaks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Flame className="h-5 w-5 text-orange-500" />
                                <CardTitle>Rachas Activas</CardTitle>
                            </div>
                            <CardDescription>Mantén tu consistencia para ganar bonos de XP</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {streaks.map((streak, index) => (
                                    <Card key={index} className={streak.is_active_today ? 'border-orange-500' : ''}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-3xl mb-2">{getStreakIcon(streak.type)}</div>
                                                    <div className="text-2xl font-bold text-orange-500">
                                                        {streak.current_count} días
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Récord: {streak.longest_count} días
                                                    </p>
                                                    {streak.is_active_today && (
                                                        <Badge variant="outline" className="mt-2 border-orange-500 text-orange-500">
                                                            Activa hoy
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Logros por Categoría */}
                <Card>
                    <CardHeader>
                        <CardTitle>Todos los Logros</CardTitle>
                        <CardDescription>Desbloquea logros completando actividades</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={Object.keys(achievements)[0]} className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                {Object.keys(achievements).map((category) => (
                                    <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                                        {categoryIcons[category]}
                                        <span className="hidden sm:inline">{categoryLabels[category]}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {Object.entries(achievements).map(([category, categoryAchievements]) => (
                                <TabsContent key={category} value={category} className="mt-6">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {categoryAchievements.map((achievement) => (
                                            <Card
                                                key={achievement.id}
                                                className={
                                                    achievement.unlocked
                                                        ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
                                                        : 'opacity-60'
                                                }
                                            >
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="text-4xl">
                                                            {achievement.unlocked ? achievement.icon : '🔒'}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Badge
                                                                className={`${getDifficultyColor(achievement.difficulty)} text-white`}
                                                            >
                                                                {getDifficultyLabel(achievement.difficulty)}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                +{achievement.xp_reward} XP
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-lg mb-1">
                                                        {achievement.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {achievement.description}
                                                    </p>
                                                    {achievement.unlocked ? (
                                                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-white">
                                                            <Award className="h-4 w-4" />
                                                            <span>Desbloqueado {achievement.unlocked_at}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Lock className="h-4 w-4" />
                                                            <span>Bloqueado</span>
                                                        </div>
                                                    )}
                                                    {achievement.progress > 0 && !achievement.unlocked && (
                                                        <div className="mt-3">
                                                            <Progress value={achievement.progress} className="h-2" />
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {achievement.progress}% completado
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Historial de XP Reciente */}
                {recent_xp.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <CardTitle>Actividad Reciente</CardTitle>
                            </div>
                            <CardDescription>Tus últimas ganancias de XP</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recent_xp.map((transaction, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                                <Zap className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {transaction.source} • {transaction.created_at}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-lg font-bold text-primary">
                                            +{transaction.xp_amount} XP
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
