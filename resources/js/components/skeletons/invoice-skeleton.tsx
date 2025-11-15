import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function InvoiceSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div>
                        <Skeleton className="h-9 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Details Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-64 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i}>
                                        <Skeleton className="h-4 w-24 mb-1" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription Info Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <Skeleton className="h-4 w-16 mb-1" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <div className="flex items-center justify-between border-t pt-4">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-7 w-28" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Card Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-16" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

