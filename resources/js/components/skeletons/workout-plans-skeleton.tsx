import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WorkoutPlansSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="my-plans" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="my-plans">Mis Planes</TabsTrigger>
                    <TabsTrigger value="public">Planes Públicos</TabsTrigger>
                </TabsList>

                <TabsContent value="my-plans" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-40" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-3 w-8" />
                                        </div>
                                        <Skeleton className="h-2 w-full" />
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>

                                    {/* Exercises List */}
                                    <div className="pt-2 border-t space-y-1">
                                        <Skeleton className="h-3 w-20" />
                                        {[1, 2, 3].map((j) => (
                                            <Skeleton key={j} className="h-3 w-full" />
                                        ))}
                                    </div>

                                    {/* Button */}
                                    <Skeleton className="h-9 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="public" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-9 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
