import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </div>

            {/* Gamification Card Skeleton */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-9 w-28" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Summary Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Today's Tracking Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Hydration Card Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <Skeleton className="h-9 w-20" />
                        </div>
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <Skeleton className="h-9 w-28" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-40" />

                        {/* Chart Skeleton */}
                        <div className="pt-4 border-t">
                            <Skeleton className="h-4 w-36 mb-3" />
                            <div className="flex items-end gap-1 h-24">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <Skeleton className="w-full" style={{ height: `${Math.random() * 60 + 40}%` }} />
                                        <Skeleton className="h-3 w-6" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Records Skeleton */}
                        <div className="pt-4 border-t">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Nutrition Card Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-36" />
                            </div>
                            <Skeleton className="h-9 w-20" />
                        </div>
                        <Skeleton className="h-4 w-44 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Macros Progress Skeleton */}
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-4 w-48" />

                        {/* Meal Type Chart Skeleton */}
                        <div className="pt-4 border-t">
                            <Skeleton className="h-4 w-48 mb-3" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                        <Skeleton className="h-1.5 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Meals Skeleton */}
                        <div className="pt-4 border-t">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4 rounded" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-12" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
