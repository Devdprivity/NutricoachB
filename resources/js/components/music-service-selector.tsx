import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Youtube, Check } from 'lucide-react';
import type { MusicService, MusicProvider } from '@/types/music';
import axios from 'axios';

interface MusicServiceSelectorProps {
    currentService?: MusicProvider | null;
    spotifyConnected?: boolean;
    youtubeMusicConnected?: boolean;
    appleMusicConnected?: boolean;
    onServiceChange?: (service: MusicProvider) => void;
}

export function MusicServiceSelector({
    currentService,
    spotifyConnected = false,
    youtubeMusicConnected = false,
    appleMusicConnected = false,
    onServiceChange,
}: MusicServiceSelectorProps) {
    const [connecting, setConnecting] = useState<MusicProvider | null>(null);

    const services: MusicService[] = [
        {
            id: 'spotify',
            name: 'Spotify',
            icon: '🎵',
            color: 'bg-green-500',
            isConnected: spotifyConnected,
        },
        {
            id: 'youtube_music',
            name: 'YouTube Music',
            icon: '📺',
            color: 'bg-red-500',
            isConnected: youtubeMusicConnected,
        },
        {
            id: 'apple_music',
            name: 'Apple Music',
            icon: '🍎',
            color: 'bg-pink-500',
            isConnected: appleMusicConnected,
        },
    ];

    const handleConnect = async (serviceId: MusicProvider) => {
        setConnecting(serviceId);

        try {
            if (serviceId === 'spotify') {
                // Redirect to Spotify OAuth
                window.location.href = '/spotify/redirect';
            } else if (serviceId === 'youtube_music') {
                // Redirect to YouTube Music OAuth (Google)
                window.location.href = '/youtube-music/redirect';
            } else if (serviceId === 'apple_music') {
                // Apple Music uses MusicKit JS - needs to be initialized in frontend
                // For now, just show a message
                alert('Apple Music connection requires MusicKit initialization. Coming soon!');
                setConnecting(null);
            }
        } catch (error) {
            console.error(`Failed to connect ${serviceId}:`, error);
            setConnecting(null);
        }
    };

    const handleDisconnect = async (serviceId: MusicProvider) => {
        if (!confirm(`¿Desconectar ${serviceId}?`)) {
            return;
        }

        try {
            let endpoint = '';
            if (serviceId === 'spotify') {
                endpoint = '/spotify/disconnect';
            } else if (serviceId === 'youtube_music') {
                endpoint = '/youtube-music/disconnect';
            } else if (serviceId === 'apple_music') {
                endpoint = '/apple-music/disconnect';
            }

            await axios.post(endpoint);

            // Reload page to update connection status
            window.location.reload();
        } catch (error) {
            console.error(`Failed to disconnect ${serviceId}:`, error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Servicios de Música</h3>
                    <p className="text-sm text-muted-foreground">
                        Conecta tu servicio de música favorito
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                    <Card
                        key={service.id}
                        className={`p-6 relative ${
                            currentService === service.id
                                ? 'ring-2 ring-primary'
                                : ''
                        }`}
                    >
                        {service.isConnected && (
                            <Badge
                                className="absolute top-2 right-2"
                                variant="default"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Conectado
                            </Badge>
                        )}

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div
                                className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center text-3xl`}
                            >
                                {service.icon}
                            </div>

                            <div>
                                <h4 className="font-semibold text-lg">
                                    {service.name}
                                </h4>
                                {service.isPremium && (
                                    <p className="text-xs text-muted-foreground">
                                        Requiere Premium
                                    </p>
                                )}
                            </div>

                            {service.isConnected ? (
                                <div className="flex flex-col gap-2 w-full">
                                    {currentService === service.id && (
                                        <Badge variant="outline" className="w-full">
                                            Servicio activo
                                        </Badge>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDisconnect(service.id)}
                                        className="w-full"
                                    >
                                        Desconectar
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleConnect(service.id)}
                                    disabled={connecting === service.id}
                                    className="w-full"
                                >
                                    {connecting === service.id
                                        ? 'Conectando...'
                                        : 'Conectar'}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {(spotifyConnected || youtubeMusicConnected || appleMusicConnected) && (
                <Card className="p-4 bg-muted/50">
                    <div className="flex items-start gap-3">
                        <Music className="w-5 h-5 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                            <h4 className="font-medium text-sm">
                                Múltiples servicios conectados
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Puedes conectar varios servicios de música. El reproductor
                                mostrará el servicio activo basado en tu preferencia o el
                                último que usaste.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
