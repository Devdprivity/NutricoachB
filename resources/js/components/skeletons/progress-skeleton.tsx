import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProgressSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-80 mt-2" />
            </div>

            {/* Weight Progress Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-64" />
                    </div>
                    <Skeleton className="h-4 w-96 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center space-y-2">
                                <Skeleton className="h-8 w-20 mx-auto" />
                                <Skeleton className="h-3 w-24 mx-auto" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </CardContent>
            </Card>

            {/* Personal Data & Medical Info Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="flex justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Exercise Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-80" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center space-y-2">
                                <Skeleton className="h-8 w-16 mx-auto" />
                                <Skeleton className="h-3 w-28 mx-auto" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Nutrition Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-80" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-40" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </CardContent>
            </Card>

            {/* Context Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-80" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center space-y-2">
                                <Skeleton className="h-8 w-16 mx-auto" />
                                <Skeleton className="h-3 w-28 mx-auto" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Hydration Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-80" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-40" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </CardContent>
            </Card>

            {/* Progress Photos Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-4 w-96 mt-2" />
                </CardHeader>
                <CardContent>
                    {/* Before/After Comparison */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                        <Skeleton className="h-5 w-48 mx-auto mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-5 w-32 mb-2" />
                                    <Skeleton className="w-full h-64 rounded" />
                                    <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="w-full h-48 rounded-lg" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-20" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 flex-1" />
                                    <Skeleton className="h-8 flex-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
