import { usePage } from '@inertiajs/react';
import { MusicPlayer } from './music-player';
import { MusicServiceSelector } from './music-service-selector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';
import type { MusicProvider } from '@/types/music';
import { useState } from 'react';

interface MusicPlayerContainerProps {
    showSettings?: boolean;
}

export function MusicPlayerContainer({ showSettings = false }: MusicPlayerContainerProps) {
    const { props } = usePage<any>();
    const user = props.auth?.user;

    const [showServiceSelector, setShowServiceSelector] = useState(showSettings);

    // Check which services are connected
    const spotifyConnected = !!user?.spotify_id;
    const youtubeMusicConnected = !!user?.youtube_music_id;
    const appleMusicConnected = !!user?.apple_music_id;

    // Get preferred service
    const preferredService: MusicProvider | null = user?.preferred_music_service || null;

    // Determine active service
    const activeService: MusicProvider | null =
        preferredService ||
        (spotifyConnected ? 'spotify' : null) ||
        (youtubeMusicConnected ? 'youtube_music' : null) ||
        (appleMusicConnected ? 'apple_music' : null);

    // No services connected
    if (!spotifyConnected && !youtubeMusicConnected && !appleMusicConnected) {
        return (
            <Card className="p-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Conecta tu Música</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Conecta Spotify, YouTube Music o Apple Music para escuchar
                            música mientras entrenas
                        </p>
                    </div>
                    <Button onClick={() => setShowServiceSelector(true)}>
                        <Music className="w-4 h-4 mr-2" />
                        Conectar Servicio de Música
                    </Button>
                </div>
            </Card>
        );
    }

    // Show service selector if requested
    if (showServiceSelector) {
        return (
            <div className="space-y-4">
                <MusicServiceSelector
                    currentService={activeService}
                    spotifyConnected={spotifyConnected}
                    youtubeMusicConnected={youtubeMusicConnected}
                    appleMusicConnected={appleMusicConnected}
                />
                <Button
                    variant="outline"
                    onClick={() => setShowServiceSelector(false)}
                    className="w-full"
                >
                    Cerrar
                </Button>
            </div>
        );
    }

    // Show active player
    if (activeService) {
        return (
            <MusicPlayer
                provider={activeService}
                onDisconnect={() => setShowServiceSelector(true)}
            />
        );
    }

    return null;
}
