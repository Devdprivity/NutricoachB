import { Head } from '@inertiajs/react';

import AppearancePreview from '@/components/appearance-preview';
import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Apariencia',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Apariencia" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                            <Palette className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Configuración de Apariencia</h2>
                            <p className="text-muted-foreground">
                                Personaliza el aspecto visual de tu aplicación
                            </p>
                        </div>
                    </div>

                    {/* Vista previa de temas */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Selecciona un tema</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Elige cómo quieres que se vea NutiCoach. Los cambios se aplicarán inmediatamente.
                            </p>
                        </div>
                        <AppearancePreview />
                    </div>

                    {/* Selector rápido */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Selector Rápido</CardTitle>
                            <CardDescription>
                                Cambia rápidamente entre temas usando el selector
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center py-4">
                                <AppearanceTabs className="w-full max-w-md" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                    <CardTitle className="text-base">Tema Claro</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Perfecto para usar durante el día o en ambientes bien iluminados. 
                                    Reduce la fatiga visual y mejora la legibilidad.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Moon className="h-5 w-5 text-blue-500" />
                                    <CardTitle className="text-base">Tema Oscuro</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Ideal para usar en la noche o en ambientes con poca luz. 
                                    Reduce el brillo de la pantalla y puede ayudar a conciliar el sueño.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-purple-500" />
                                    <CardTitle className="text-base">Tema del Sistema</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Sigue automáticamente las preferencias de tu dispositivo. 
                                    Se ajusta según la hora del día o tu configuración del sistema.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
