import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function WeeklyMealPlanDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Period Skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="space-y-2 text-right">
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recipes Skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <div className="flex">
                                            <Skeleton className="h-24 w-24 flex-shrink-0" />
                                            <CardContent className="flex-1 p-4">
                                                <Skeleton className="h-5 w-32 mb-2" />
                                                <Skeleton className="h-3 w-full mb-1" />
                                                <Skeleton className="h-3 w-3/4 mb-3" />
                                                <div className="flex items-center gap-4 mb-2">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                                <Skeleton className="h-5 w-24 rounded-full mb-2" />
                                                <Skeleton className="h-3 w-20" />
                                            </CardContent>
                                        </div>
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
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

