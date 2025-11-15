import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Avatar Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-10 w-32 rounded-md" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardContent>
            </Card>

            {/* Personal Info Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Button */}
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-32 rounded-md" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

