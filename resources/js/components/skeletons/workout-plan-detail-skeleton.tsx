import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function WorkoutPlanDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Exercises Skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-l-4">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-5 w-48" />
                                                    </div>
                                                    <Skeleton className="h-5 w-20 rounded-full" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                                <Skeleton className="h-20 w-20 rounded" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[1, 2, 3, 4].map((j) => (
                                                    <div key={j}>
                                                        <Skeleton className="h-4 w-16 mb-1" />
                                                        <Skeleton className="h-6 w-12" />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info Card Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Schedule Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 w-40 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Button Skeleton */}
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        </div>
    );
}

