import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Search,
    X,
    Music,
    Settings,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { MusicProvider, CurrentlyPlaying, Track } from '@/types/music';

interface MusicPlayerProps {
    provider: MusicProvider;
    onDisconnect?: () => void;
}

export function MusicPlayer({ provider, onDisconnect }: MusicPlayerProps) {
    const [currentTrack, setCurrentTrack] = useState<CurrentlyPlaying | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('musicVolume');
        return saved ? parseInt(saved) : 100;
    });
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);

    // Provider-specific configurations
    const providerConfig = {
        spotify: {
            name: 'Spotify',
            icon: '🎵',
            color: 'bg-green-500',
            endpoints: {
                currentlyPlaying: '/spotify/currently-playing',
                play: '/spotify/play',
                pause: '/spotify/pause',
                next: '/spotify/next',
                previous: '/spotify/previous',
                search: '/spotify/search',
                playTrack: '/spotify/play-track',
            },
        },
        youtube_music: {
            name: 'YouTube Music',
            icon: '📺',
            color: 'bg-red-500',
            endpoints: {
                currentlyPlaying: '/youtube-music/currently-playing',
                search: '/youtube-music/search',
                playVideo: '/youtube-music/play-video',
            },
        },
        apple_music: {
            name: 'Apple Music',
            icon: '🍎',
            color: 'bg-pink-500',
            endpoints: {
                currentlyPlaying: '/apple-music/currently-playing',
            },
        },
    };

    const config = providerConfig[provider];

    // Fetch currently playing track - con persistencia entre navegaciones
    useEffect(() => {
        const fetchTrack = () => {
            fetchCurrentlyPlaying();
        };
        
        fetchTrack();
        
        // Usar intervalo global que persiste entre navegaciones
        const intervalKey = `musicPlayerInterval_${provider}`;
        if (!(window as any)[intervalKey]) {
            (window as any)[intervalKey] = setInterval(fetchTrack, 5000);
        }
        
        // Guardar función de fetch para acceso global
        (window as any)[`fetchMusic_${provider}`] = fetchTrack;
        
        // Restaurar estado de reproducción si existe (especialmente para YouTube Music)
        if (provider === 'youtube_music') {
            const iframe = document.getElementById('youtube-music-player') as HTMLIFrameElement;
            if (iframe && (window as any).youtubePlayer) {
                // El reproductor ya existe, solo actualizar el estado
                setTimeout(() => {
                    fetchTrack();
                }, 100);
            }
        }
        
        // No limpiar nada al desmontar - mantener todo activo para que la música continúe
        return () => {
            // Mantener el intervalo activo - NO limpiar
        };
    }, [provider]);

    // Preserve player state across navigation - NO limpiar nada
    useEffect(() => {
        // Mantener el iframe de YouTube en el DOM incluso cuando el componente se desmonta
        return () => {
            // No hacer nada - mantener todo activo
        };
    }, [provider]);

    const fetchCurrentlyPlaying = async () => {
        try {
            const response = await axios.get(config.endpoints.currentlyPlaying);
            setCurrentTrack(response.data);
            setIsPlaying(response.data.is_playing || false);
        } catch (error) {
            console.error('Error fetching currently playing:', error);
        }
    };

    const handlePlayPause = async () => {
        // Para YouTube Music, usar el iframe
        if (provider === 'youtube_music' && (window as any).youtubePlayer) {
            if (isPlaying) {
                (window as any).youtubePlayer.pauseVideo();
                setIsPlaying(false);
            } else {
                (window as any).youtubePlayer.playVideo();
                setIsPlaying(true);
            }
            return;
        }

        if (!config.endpoints.play || !config.endpoints.pause) {
            return; // Some providers don't support direct playback control
        }

        try {
            if (isPlaying) {
                await axios.post(config.endpoints.pause);
                setIsPlaying(false);
            } else {
                await axios.post(config.endpoints.play);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };

    const handleNext = async () => {
        if (!config.endpoints.next) return;

        try {
            await axios.post(config.endpoints.next);
            setTimeout(fetchCurrentlyPlaying, 500);
        } catch (error) {
            console.error('Error skipping to next:', error);
        }
    };

    const handlePrevious = async () => {
        if (!config.endpoints.previous) return;

        try {
            await axios.post(config.endpoints.previous);
            setTimeout(fetchCurrentlyPlaying, 500);
        } catch (error) {
            console.error('Error skipping to previous:', error);
        }
    };

    const handleSearch = async (query: string) => {
        if (!config.endpoints.search || !query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await axios.get(config.endpoints.search, {
                params: { q: query },
            });

            if (provider === 'spotify') {
                setSearchResults(response.data.tracks?.items || []);
            } else if (provider === 'youtube_music') {
                // Convert YouTube videos to Track format
                const videos = response.data.videos?.items || [];
                const tracks: Track[] = videos.map((video: any) => ({
                    id: video.id.videoId,
                    name: video.snippet.title,
                    artists: [{ name: video.snippet.channelTitle }],
                    album: {
                        name: '',
                        images: [{ url: video.snippet.thumbnails.high.url }],
                    },
                }));
                setSearchResults(tracks);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInputChange = (query: string) => {
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(query);
        }, 500);
    };

    // Función para buscar y reproducir la siguiente canción automáticamente
    const playNextSimilarTrack = async () => {
        try {
            // Obtener el artista actual desde la referencia global
            const currentArtist = (window as any).currentMusicArtist;
            const currentVideoId = (window as any).currentMusicVideoId;
            
            if (!currentArtist) {
                console.log('No hay artista actual para buscar siguiente canción');
                return;
            }
            
            console.log('Buscando siguiente canción de:', currentArtist);
            
            // Buscar canciones del mismo artista
            const response = await axios.get(config.endpoints.search, {
                params: { q: currentArtist, limit: 10 },
            });

            let tracks: Track[] = [];
            if (provider === 'youtube_music') {
                const videos = response.data.videos?.items || [];
                tracks = videos.map((video: any) => ({
                    id: video.id.videoId,
                    name: video.snippet.title,
                    artists: [{ name: video.snippet.channelTitle }],
                    album: {
                        name: '',
                        images: [{ url: video.snippet.thumbnails.high.url }],
                    },
                }));
            }

            // Filtrar para evitar repetir la canción actual
            const availableTracks = tracks.filter(t => t.id !== currentVideoId);

            if (availableTracks.length > 0) {
                // Seleccionar una canción aleatoria de las disponibles
                const randomIndex = Math.floor(Math.random() * Math.min(5, availableTracks.length));
                const nextTrack = availableTracks[randomIndex];
                console.log('Reproduciendo siguiente:', nextTrack.name);
                await handlePlayTrack(nextTrack);
            }
        } catch (error) {
            console.error('Error buscando siguiente canción:', error);
        }
    };

    const handlePlayTrack = async (track: Track) => {
        try {
            if (provider === 'spotify' && config.endpoints.playTrack) {
                await axios.post(config.endpoints.playTrack, {
                    track_uri: `spotify:track:${track.id}`,
                });
            } else if (provider === 'youtube_music' && config.endpoints.playVideo) {
                // Guardar información del track actual globalmente para autoplay
                (window as any).currentMusicArtist = track.artists[0]?.name || 'Unknown';
                (window as any).currentMusicVideoId = track.id;
                
                await axios.post(config.endpoints.playVideo, {
                    video_id: track.id,
                    title: track.name,
                    artist: track.artists[0]?.name || 'Unknown',
                    thumbnail: track.album.images[0]?.url,
                });
                
                // Crear o actualizar iframe de YouTube para reproducir
                // Asegurarse de que el iframe esté en el body del documento, no dentro del componente
                let iframe = document.getElementById('youtube-music-player') as HTMLIFrameElement;
                const isNewIframe = !iframe;
                
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'youtube-music-player';
                    iframe.style.display = 'none';
                    iframe.style.position = 'fixed';
                    iframe.style.top = '-9999px';
                    iframe.style.left = '-9999px';
                    iframe.allow = 'autoplay';
                    iframe.setAttribute('data-persist', 'true'); // Marcar para persistencia
                    document.body.appendChild(iframe);
                }
                
                // Configurar listener solo una vez
                if (isNewIframe && !(window as any).youtubeMessageListenerSet) {
                    (window as any).youtubeMessageListenerSet = true;
                    
                    window.addEventListener('message', (event) => {
                        if (event.origin === 'https://www.youtube.com') {
                            try {
                                const data = JSON.parse(event.data);
                                // Estado 0 = video terminado
                                if (data.event === 'onStateChange' && data.info === 0) {
                                    console.log('Video terminado, buscando siguiente...');
                                    // Usar la función global guardada
                                    if ((window as any).playNextSimilarTrack) {
                                        (window as any).playNextSimilarTrack();
                                    }
                                }
                            } catch (e) {
                                // Ignorar mensajes que no son JSON
                            }
                        }
                    });
                }
                
                // Guardar función de autoplay globalmente para que sea accesible desde el listener
                (window as any).playNextSimilarTrack = playNextSimilarTrack;
                
                // Cargar el video de YouTube
                const videoUrl = `https://www.youtube.com/embed/${track.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;
                iframe.src = videoUrl;
                
                // Guardar referencia al iframe para controlar volumen (persistente en window)
                (window as any).youtubePlayer = {
                    setVolume: (vol: number) => {
                        const playerIframe = document.getElementById('youtube-music-player') as HTMLIFrameElement;
                        if (playerIframe && playerIframe.contentWindow) {
                            playerIframe.contentWindow.postMessage(JSON.stringify({
                                event: 'command',
                                func: 'setVolume',
                                args: [vol]
                            }), '*');
                        }
                    },
                    playVideo: () => {
                        const playerIframe = document.getElementById('youtube-music-player') as HTMLIFrameElement;
                        if (playerIframe && playerIframe.contentWindow) {
                            playerIframe.contentWindow.postMessage(JSON.stringify({
                                event: 'command',
                                func: 'playVideo'
                            }), '*');
                        }
                    },
                    pauseVideo: () => {
                        const playerIframe = document.getElementById('youtube-music-player') as HTMLIFrameElement;
                        if (playerIframe && playerIframe.contentWindow) {
                            playerIframe.contentWindow.postMessage(JSON.stringify({
                                event: 'command',
                                func: 'pauseVideo'
                            }), '*');
                        }
                    }
                };
                
                setIsPlaying(true);
            }

            setShowSearch(false);
            setSearchQuery('');
            setSearchResults([]);
            setTimeout(fetchCurrentlyPlaying, 500);
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    return (
        <div className="relative">
            {/* YouTube iframe se crea dinámicamente en handlePlayTrack y se mantiene en document.body */}
            
            {/* Mini Player - Horizontal Bar for Header */}
            {currentTrack?.item && !showSearch && (
                <div className="flex items-center gap-3 h-12 px-3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 max-w-xl">
                    {/* Album Art */}
                    {currentTrack.item.album?.images?.[0]?.url && (
                        <img
                            src={currentTrack.item.album.images[0].url}
                            alt={currentTrack.item.name}
                            className="w-12 h-12 rounded flex-shrink-0"
                        />
                    )}

                    {/* Track Info */}
                    <div className="flex-1 min-w-0 max-w-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                            <Badge className={`${config.color} text-white text-xs px-1.5 py-0`}>
                                {config.icon} {config.name}
                            </Badge>
                        </div>
                        <p className="font-medium truncate text-sm leading-tight">
                            {currentTrack.item.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate leading-tight">
                            {currentTrack.item.artists
                                ?.map((a) => a.name)
                                .join(', ')}
                        </p>
                    </div>

                    {/* Controls - Horizontal */}
                    <div className="flex items-center gap-1">
                        {config.endpoints.previous && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevious}
                                className="h-8 w-8"
                            >
                                <SkipBack className="w-4 h-4" />
                            </Button>
                        )}

                        {config.endpoints.play && config.endpoints.pause && (
                            <Button
                                variant="default"
                                size="icon"
                                onClick={handlePlayPause}
                                className="h-8 w-8"
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </Button>
                        )}

                        {config.endpoints.next && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                className="h-8 w-8"
                            >
                                <SkipForward className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const newVolume = volume === 0 ? 100 : 0;
                                setVolume(newVolume);
                                localStorage.setItem('musicVolume', newVolume.toString());
                                if (provider === 'youtube_music' && (window as any).youtubePlayer) {
                                    (window as any).youtubePlayer.setVolume(newVolume);
                                }
                            }}
                            className="h-8 w-8"
                        >
                            {volume === 0 ? (
                                <VolumeX className="w-4 h-4" />
                            ) : (
                                <Volume2 className="w-4 h-4" />
                            )}
                        </Button>
                        <div className="w-24 hidden lg:block">
                            <Slider
                                value={[volume]}
                                onValueChange={(value) => {
                                    const newVolume = value[0];
                                    setVolume(newVolume);
                                    localStorage.setItem('musicVolume', newVolume.toString());
                                    if (provider === 'youtube_music' && (window as any).youtubePlayer) {
                                        (window as any).youtubePlayer.setVolume(newVolume);
                                    }
                                }}
                                min={0}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Search and Settings */}
                    <div className="flex items-center gap-1 border-l border-border/50 pl-2">
                        {config.endpoints.search && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSearch(true)}
                                className="h-8 px-2"
                            >
                                <Search className="w-4 h-4 mr-1.5" />
                                Buscar
                            </Button>
                        )}

                        {onDisconnect && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDisconnect}
                                className="h-8 px-2"
                            >
                                <Settings className="w-4 h-4 mr-1.5" />
                                Configuración
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* No track playing - Horizontal Bar for Header */}
            {!currentTrack?.item && !showSearch && (
                <div className="flex items-center gap-3 h-12 px-3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 max-w-xl">
                    <div
                        className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-lg flex-shrink-0`}
                    >
                        {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{config.name}</p>
                        <p className="text-xs text-muted-foreground">
                            No hay música reproduciéndose
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        {config.endpoints.search && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShowSearch(true)}
                                className="h-8 px-3"
                            >
                                <Search className="w-4 h-4 mr-1.5" />
                                Buscar música
                            </Button>
                        )}
                        {onDisconnect && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onDisconnect}
                                className="h-8 w-8"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Search Panel - Modal Centered */}
            <Dialog open={showSearch} onOpenChange={setShowSearch}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col items-center justify-center">
                    <DialogHeader className="w-full">
                        <DialogTitle className="flex items-center justify-center gap-2">
                            <Music className="w-5 h-5" />
                            Buscar en {config.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 w-full flex flex-col items-center">
                        {/* Search Input */}
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={`Buscar canciones en ${config.name}...`}
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchInputChange(e.target.value)
                                }
                                className="pl-10"
                                autoFocus
                            />
                        </div>

                        {/* Search Results */}
                        {isSearching && (
                            <div className="text-center py-8 text-muted-foreground w-full">
                                Buscando...
                            </div>
                        )}

                        {!isSearching && searchResults.length > 0 && (
                            <div className="space-y-2 max-h-96 overflow-y-auto w-full">
                                {searchResults.map((track) => (
                                    <div
                                        key={track.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                        onClick={() => handlePlayTrack(track)}
                                    >
                                        {track.album?.images?.[0]?.url && (
                                            <img
                                                src={track.album.images[0].url}
                                                alt={track.name}
                                                className="w-12 h-12 rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-sm">
                                                {track.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {track.artists
                                                    ?.map((a) => a.name)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <Play className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isSearching &&
                            searchQuery &&
                            searchResults.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground w-full">
                                    No se encontraron resultados
                                </div>
                            )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
