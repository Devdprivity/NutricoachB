import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ExercisesSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-9 w-80" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            {/* Calorie Balance Dashboard */}
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Today's Exercises and Recommendations */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Today's Exercises */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Skeleton className="h-12 w-12 rounded" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-56" />
                        <Skeleton className="h-4 w-72 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-8 flex-1" />
                                ))}
                            </div>
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Skeleton className="h-10 w-10 rounded" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Exercise Library */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                    <div className="flex gap-2 pt-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-8 w-20" />
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-lg border overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-4" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
