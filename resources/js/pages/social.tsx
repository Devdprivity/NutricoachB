import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Heart, Search, TrendingUp, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Social', href: '/social' },
];

interface ActivityUser {
    id: number;
    name: string;
    avatar?: string;
}

interface Activity {
    id: number;
    type: string;
    description: string;
    data?: any;
    image_url?: string;
    visibility: string;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    created_at: string;
    user: ActivityUser;
}

interface SuggestedUser {
    id: number;
    name: string;
    avatar?: string;
    followers_count: number;
}

interface Stats {
    followers_count: number;
    following_count: number;
    activities_count: number;
}

interface SocialData {
    activities: Activity[];
    stats: Stats;
    suggested_users: SuggestedUser[];
}

export default function Social({ activities = [], stats, suggested_users = [] }: { activities?: Activity[]; stats?: Stats; suggested_users?: SuggestedUser[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SuggestedUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [likedActivities, setLikedActivities] = useState<Set<number>>(
        new Set(activities.filter(a => a.is_liked).map(a => a.id))
    );

    const handleLike = async (activityId: number, isLiked: boolean) => {
        try {
            if (isLiked) {
                await axios.delete(`/social/activities/${activityId}/like`);
                setLikedActivities(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(activityId);
                    return newSet;
                });
            } else {
                await axios.post(`/social/activities/${activityId}/like`);
                setLikedActivities(prev => new Set(prev).add(activityId));
            }
            router.reload({ only: ['activities'] });
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleFollow = async (userId: number) => {
        try {
            await axios.post(`/social/follow/${userId}`);
            router.reload({ only: ['suggested_users', 'stats'] });
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get('/social/search', {
                params: { query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'achievement':
                return '🏆';
            case 'workout':
                return '💪';
            case 'meal':
                return '🍽️';
            case 'progress_photo':
                return '📸';
            case 'weight_update':
                return '⚖️';
            default:
                return '✨';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Hace un momento';
        if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
        if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
        return date.toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Social" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Social</h1>
                    <p className="text-muted-foreground">
                        Conecta con otros usuarios y comparte tu progreso
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Feed Principal */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Estadísticas del Usuario */}
                        {stats && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{stats.activities_count}</p>
                                            <p className="text-sm text-muted-foreground">Actividades</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{stats.followers_count}</p>
                                            <p className="text-sm text-muted-foreground">Seguidores</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-purple-600">{stats.following_count}</p>
                                            <p className="text-sm text-muted-foreground">Siguiendo</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Feed de Actividades */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Feed de Actividades</CardTitle>
                                <CardDescription>Últimas actividades de personas que sigues</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No hay actividades aún. ¡Comienza a seguir usuarios!
                                        </p>
                                    </div>
                                ) : (
                                    activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <Avatar className="h-10 w-10">
                                                        {activity.user.avatar ? (
                                                            <img src={activity.user.avatar} alt={activity.user.name} />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                                                                {activity.user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </Avatar>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{activity.user.name}</span>
                                                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                                                        <span className="text-xs text-muted-foreground ml-auto">
                                                            {formatTimeAgo(activity.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mb-2">{activity.description}</p>

                                                    {activity.image_url && (
                                                        <div className="mb-3 rounded-lg overflow-hidden border">
                                                            <img
                                                                src={activity.image_url}
                                                                alt="Activity"
                                                                className="w-full max-h-64 object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 text-sm">
                                                        <button
                                                            onClick={() => handleLike(activity.id, likedActivities.has(activity.id))}
                                                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                                        >
                                                            <Heart
                                                                className={`h-4 w-4 ${likedActivities.has(activity.id) ? 'fill-red-500 text-red-500' : ''}`}
                                                            />
                                                            <span>{activity.likes_count}</span>
                                                        </button>
                                                        <Badge variant={activity.visibility === 'public' ? 'default' : 'secondary'}>
                                                            {activity.visibility}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Barra Lateral */}
                    <div className="space-y-4">
                        {/* Búsqueda de Usuarios */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Buscar Usuarios
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {isSearching && (
                                    <p className="text-sm text-muted-foreground">Buscando...</p>
                                )}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        {searchResults.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {user.followers_count} seguidores
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFollow(user.id)}
                                                >
                                                    <UserPlus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Usuarios Sugeridos */}
                        {suggested_users.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Usuarios Sugeridos
                                    </CardTitle>
                                    <CardDescription>Personas que podrías seguir</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {suggested_users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.followers_count} seguidores
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleFollow(user.id)}
                                            >
                                                <UserPlus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Link al Leaderboard */}
                        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                                    <h3 className="font-semibold mb-2">Tabla de Clasificación</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Ve quién está liderando la comunidad
                                    </p>
                                    <Button
                                        variant="default"
                                        className="w-full"
                                        onClick={() => router.visit('/social/leaderboard')}
                                    >
                                        Ver Ranking
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
