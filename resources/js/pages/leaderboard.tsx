import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Trophy, Users, Activity, Medal, Crown, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Social', href: '/social' },
    { title: 'Leaderboard', href: '/social/leaderboard' },
];

interface LeaderboardUser {
    rank: number;
    id: number;
    name: string;
    avatar?: string;
    score: number;
    is_following: boolean;
    is_current_user: boolean;
}

interface LeaderboardProps {
    leaderboard: LeaderboardUser[];
    type: string;
}

export default function Leaderboard({ leaderboard = [], type = 'followers' }: LeaderboardProps) {
    const [users, setUsers] = useState<LeaderboardUser[]>(leaderboard);
    const [currentType, setCurrentType] = useState(type);

    const handleTypeChange = (newType: string) => {
        setCurrentType(newType);
        router.visit(`/social/leaderboard?type=${newType}`, {
            preserveState: false,
        });
    };

    const handleFollow = async (userId: number, isFollowing: boolean) => {
        try {
            if (isFollowing) {
                await axios.delete(`/social/follow/${userId}`);
            } else {
                await axios.post(`/social/follow/${userId}`);
            }
            router.reload({ only: ['leaderboard'] });
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leaderboard" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                    <p className="text-muted-foreground">
                        See how you rank among the community
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.visit('/social')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Social
                </Button>
            </div>

            <Tabs value={currentType} onValueChange={handleTypeChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="followers">
                        <Users className="mr-2 h-4 w-4" />
                        Followers
                    </TabsTrigger>
                    <TabsTrigger value="activities">
                        <Activity className="mr-2 h-4 w-4" />
                        Activities
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={currentType} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Trophy className="mr-2 h-5 w-5" />
                                Top {currentType === 'followers' ? 'Followed' : 'Active'} Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {users.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <p>No users in the leaderboard yet</p>
                                    </div>
                                ) : (
                                    users.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                                                user.is_current_user
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-accent'
                                            }`}
                                        >
                                            {/* Rank */}
                                            <div className="flex w-12 items-center justify-center">
                                                {getRankIcon(user.rank)}
                                            </div>

                                            {/* Avatar */}
                                            <Avatar className="h-12 w-12">
                                                {user.avatar ? (
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                ) : null}
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>

                                            {/* User Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{user.name}</h3>
                                                    {user.is_current_user && (
                                                        <Badge variant="secondary">You</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.score} {currentType === 'followers' ? 'followers' : 'activities'}
                                                </p>
                                            </div>

                                            {/* Follow Button */}
                                            {!user.is_current_user && (
                                                <Button
                                                    variant={user.is_following ? 'outline' : 'default'}
                                                    size="sm"
                                                    onClick={() => handleFollow(user.id, user.is_following)}
                                                >
                                                    {user.is_following ? 'Following' : 'Follow'}
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}

