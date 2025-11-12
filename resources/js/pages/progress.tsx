import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Progreso', href: '/progress' },
];

export default function Progress() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progreso" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Progreso</h1>
                    <p className="text-muted-foreground">Visualiza tu evolución y estadísticas</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gráfico de Peso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Aún no hay suficientes datos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
