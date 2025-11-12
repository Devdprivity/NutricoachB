import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, Dumbbell, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ejercicios', href: '/exercises' },
];

export default function Exercises() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ejercicios" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ejercicios</h1>
                    <p className="text-muted-foreground">Registra tus entrenamientos y actividades físicas</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ejercicios de Hoy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No has registrado ejercicios hoy</p>
                                <Button className="mt-4">
                                    <Play className="h-4 w-4 mr-2" />
                                    Iniciar Entrenamiento
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recomendaciones</CardTitle>
                            <CardDescription>Ejercicios sugeridos para ti</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Dumbbell className="h-5 w-5" />
                                        <div>
                                            <div className="font-medium">Caminata</div>
                                            <div className="text-sm text-muted-foreground">30 min</div>
                                        </div>
                                    </div>
                                    <Button size="sm">Iniciar</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
