import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Music, Music2, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface Integrations {
    spotify: {
        connected: boolean;
        spotify_id?: string;
        share_listening: boolean;
    };
}

interface Props {
    integrations: Integrations;
}

export default function Integrations({ integrations }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isTogglingShare, setIsTogglingShare] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Integrations',
            href: '/settings/integrations',
        },
    ];

    const handleConnectSpotify = () => {
        window.location.href = '/spotify/redirect';
    };

    const handleDisconnectSpotify = async () => {
        if (!confirm('¿Estás seguro de que deseas desconectar Spotify? Esto eliminará tu conexión y no podrás usar el reproductor.')) {
            return;
        }

        setIsDisconnecting(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/spotify/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                router.reload();
            } else {
                alert('Error al desconectar Spotify. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error desconectando Spotify:', error);
            alert('Error al desconectar Spotify. Por favor, intenta nuevamente.');
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleToggleShareListening = async (checked: boolean) => {
        setIsTogglingShare(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/spotify/toggle-share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                router.reload();
            } else {
                alert('Error al actualizar la configuración. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error toggling share listening:', error);
            alert('Error al actualizar la configuración. Por favor, intenta nuevamente.');
        } finally {
            setIsTogglingShare(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Integrations" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Integraciones"
                        description="Conecta y gestiona tus servicios externos"
                    />

                    {/* Spotify Integration */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {integrations.spotify.connected ? (
                                        <Music className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <Music2 className="h-6 w-6 text-muted-foreground" />
                                    )}
                                    <div>
                                        <CardTitle>Spotify</CardTitle>
                                        <CardDescription>
                                            Conecta tu cuenta de Spotify para reproducir música desde el dashboard
                                        </CardDescription>
                                    </div>
                                </div>
                                {integrations.spotify.connected ? (
                                    <Badge variant="default" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Conectado
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        <XCircle className="h-3 w-3" />
                                        Desconectado
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {integrations.spotify.connected ? (
                                <>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Tu cuenta de Spotify está conectada. Puedes usar el reproductor desde el header del dashboard.
                                        </p>
                                        {integrations.spotify.spotify_id && (
                                            <p className="text-xs text-muted-foreground">
                                                ID de Spotify: <code className="px-1 py-0.5 bg-muted rounded">{integrations.spotify.spotify_id}</code>
                                            </p>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="share-listening">Compartir lo que escuchas</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Permite que tus amigos vean qué música estás escuchando
                                            </p>
                                        </div>
                                        <Switch
                                            id="share-listening"
                                            checked={integrations.spotify.share_listening}
                                            onCheckedChange={handleToggleShareListening}
                                            disabled={isTogglingShare}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="destructive"
                                            onClick={handleDisconnectSpotify}
                                            disabled={isDisconnecting}
                                            className="gap-2"
                                        >
                                            {isDisconnecting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Desconectando...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4" />
                                                    Desconectar Spotify
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open('https://open.spotify.com', '_blank')}
                                            className="gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Abrir Spotify
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Alert>
                                        <AlertDescription>
                                            Conecta tu cuenta de Spotify para acceder a todas las funciones del reproductor de música.
                                        </AlertDescription>
                                    </Alert>

                                    <Button
                                        onClick={handleConnectSpotify}
                                        className="gap-2"
                                    >
                                        <Music className="h-4 w-4" />
                                        Conectar con Spotify
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Placeholder para futuras integraciones */}
                    <Card className="opacity-50">
                        <CardHeader>
                            <CardTitle>Más integraciones próximamente</CardTitle>
                            <CardDescription>
                                Estamos trabajando en agregar más servicios que puedas conectar
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

