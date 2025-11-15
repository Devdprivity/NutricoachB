import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Play, Pause, SkipForward, SkipBack, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/bootstrap';

interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
    uri: string;
    duration_ms: number;
    external_urls: {
        spotify: string;
    };
}

interface CurrentlyPlaying {
    item: Track;
    is_playing: boolean;
    progress_ms: number;
}

interface SpotifyPlayerProps {
    isConnected: boolean;
}

export function SpotifyPlayer({ isConnected }: SpotifyPlayerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Obtener canción actual cada 3 segundos
    useEffect(() => {
        if (!isConnected) return;

        const fetchCurrentlyPlaying = async () => {
            try {
                const response = await axios.get('/spotify/currently-playing');
                if (response.data.item) {
                    setCurrentlyPlaying(response.data);
                    setIsPlaying(response.data.is_playing || false);
                } else {
                    setCurrentlyPlaying(null);
                    setIsPlaying(false);
                }
            } catch (error) {
                console.error('Error fetching currently playing:', error);
            }
        };

        fetchCurrentlyPlaying();
        const interval = setInterval(fetchCurrentlyPlaying, 3000);

        return () => clearInterval(interval);
    }, [isConnected]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await axios.get('/spotify/search', {
                params: {
                    q: searchQuery,
                    type: 'track',
                    limit: 20
                }
            });
            setSearchResults(response.data.tracks?.items || []);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePlayTrack = async (trackUri: string) => {
        setIsLoading(true);
        try {
            await axios.post('/spotify/play-track', {
                track_uri: trackUri
            });

            setIsPlaying(true);
            // Actualizar canción actual después de un breve delay
            setTimeout(async () => {
                try {
                    const response = await axios.get('/spotify/currently-playing');
                    if (response.data.item) {
                        setCurrentlyPlaying(response.data);
                    }
                } catch (error) {
                    console.error('Error updating currently playing:', error);
                }
            }, 1000);
        } catch (error) {
            console.error('Error playing track:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlay = async () => {
        setIsLoading(true);
        try {
            await axios.post('/spotify/play');
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePause = async () => {
        setIsLoading(true);
        try {
            await axios.post('/spotify/pause');
            setIsPlaying(false);
        } catch (error) {
            console.error('Error pausing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        setIsLoading(true);
        try {
            await axios.post('/spotify/next');
            // Actualizar después de un delay
            setTimeout(async () => {
                try {
                    const response = await axios.get('/spotify/currently-playing');
                    if (response.data.item) {
                        setCurrentlyPlaying(response.data);
                        setIsPlaying(response.data.is_playing || false);
                    }
                } catch (error) {
                    console.error('Error updating currently playing:', error);
                }
            }, 1000);
        } catch (error) {
            console.error('Error next:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevious = async () => {
        setIsLoading(true);
        try {
            await axios.post('/spotify/previous');
            // Actualizar después de un delay
            setTimeout(async () => {
                try {
                    const response = await axios.get('/spotify/currently-playing');
                    if (response.data.item) {
                        setCurrentlyPlaying(response.data);
                        setIsPlaying(response.data.is_playing || false);
                    }
                } catch (error) {
                    console.error('Error updating currently playing:', error);
                }
            }, 1000);
        } catch (error) {
            console.error('Error previous:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!isConnected) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-9 px-3 gap-2 transition-colors",
                        currentlyPlaying 
                            ? "hover:bg-green-50 dark:hover:bg-green-950/20" 
                            : "hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    )}
                >
                    <Music className={cn(
                        "h-4 w-4",
                        currentlyPlaying 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-neutral-600 dark:text-neutral-400"
                    )} />
                    {currentlyPlaying && (
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-xs font-medium truncate max-w-[120px]">
                                {currentlyPlaying.item.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {currentlyPlaying.item.artists[0]?.name}
                            </span>
                        </div>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Reproductor de Spotify
                    </DialogTitle>
                    <DialogDescription>
                        Busca y reproduce tu música favorita
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 min-h-0">
                    {/* Canción actual */}
                    {currentlyPlaying && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center gap-4">
                                {currentlyPlaying.item.album.images[0] && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={currentlyPlaying.item.album.images[0].url}
                                            alt={currentlyPlaying.item.album.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{currentlyPlaying.item.name}</h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {currentlyPlaying.item.artists.map(a => a.name).join(', ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {currentlyPlaying.item.album.name}
                                    </p>
                                </div>
                            </div>

                            {/* Controles de reproducción */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handlePrevious}
                                    disabled={isLoading}
                                    className="h-10 w-10"
                                >
                                    <SkipBack className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="icon"
                                    onClick={isPlaying ? handlePause : handlePlay}
                                    disabled={isLoading}
                                    className="h-12 w-12"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleNext}
                                    disabled={isLoading}
                                    className="h-10 w-10"
                                >
                                    <SkipForward className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Búsqueda */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Buscar canciones, artistas, álbumes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Resultados de búsqueda */}
                    {searchResults.length > 0 && (
                        <div className="flex-1 border rounded-lg overflow-hidden">
                            <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                                {searchResults.map((track) => (
                                    <div
                                        key={track.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => handlePlayTrack(track.uri)}
                                    >
                                        {track.album.images[2] && (
                                            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={track.album.images[2].url}
                                                    alt={track.album.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{track.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {track.artists.map(a => a.name).join(', ')}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex-shrink-0">
                                            {formatDuration(track.duration_ms)}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayTrack(track.uri);
                                            }}
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {searchQuery && searchResults.length === 0 && !isSearching && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No se encontraron resultados</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

