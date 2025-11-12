import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Coaching', href: '/coaching' },
];

export default function Coaching() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coaching" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coaching</h1>
                    <p className="text-muted-foreground">Mensajes y consejos personalizados</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Mensajes del Coach</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay mensajes nuevos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
