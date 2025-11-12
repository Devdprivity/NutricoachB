import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contexto', href: '/context' },
];

export default function Context() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contexto" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contexto</h1>
                    <p className="text-muted-foreground">Registra días especiales y factores que afectan tu nutrición</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Contextos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay contextos registrados</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
