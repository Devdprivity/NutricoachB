import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function NutritionSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header with Date Selector */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-48" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>

            {/* Next Meal Alert */}
            <Card>
                <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-28" />
                </CardContent>
            </Card>

            {/* Macros Progress Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-4 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-baseline gap-1">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="flex flex-col items-center justify-center py-8 space-y-2">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Meals Timeline */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            {/* Meal Type Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <Skeleton className="h-9 w-9" />
                            </div>

                            {/* Meal Items */}
                            <div className="pl-7 space-y-3">
                                {[1, 2].map((j) => (
                                    <Card key={j}>
                                        <CardContent className="flex items-center gap-4 pt-4">
                                            <Skeleton className="h-16 w-16 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-32" />
                                                <div className="flex gap-3">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-9 w-9" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Favorite Meals */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-10 w-10 rounded" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="text-center space-y-1">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-3 w-full" />
                                            </div>
                                        ))}
                                    </div>
                                    <Skeleton className="h-3 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
