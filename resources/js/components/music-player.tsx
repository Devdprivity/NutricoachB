import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

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

    // Fetch currently playing track
    useEffect(() => {
        fetchCurrentlyPlaying();
        const interval = setInterval(fetchCurrentlyPlaying, 5000);
        return () => clearInterval(interval);
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

    const handlePlayTrack = async (track: Track) => {
        try {
            if (provider === 'spotify' && config.endpoints.playTrack) {
                await axios.post(config.endpoints.playTrack, {
                    track_uri: `spotify:track:${track.id}`,
                });
            } else if (provider === 'youtube_music' && config.endpoints.playVideo) {
                await axios.post(config.endpoints.playVideo, {
                    video_id: track.id,
                    title: track.name,
                    artist: track.artists[0]?.name || 'Unknown',
                    thumbnail: track.album.images[0]?.url,
                });
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
            {/* Mini Player */}
            {currentTrack?.item && !showSearch && (
                <Card className="p-3">
                    <div className="flex items-center gap-3">
                        {/* Album Art */}
                        {currentTrack.item.album?.images?.[0]?.url && (
                            <img
                                src={currentTrack.item.album.images[0].url}
                                alt={currentTrack.item.name}
                                className="w-12 h-12 rounded"
                            />
                        )}

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Badge className={`${config.color} text-white`}>
                                    {config.icon} {config.name}
                                </Badge>
                            </div>
                            <p className="font-medium truncate text-sm">
                                {currentTrack.item.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {currentTrack.item.artists
                                    ?.map((a) => a.name)
                                    .join(', ')}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                            {config.endpoints.previous && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePrevious}
                                >
                                    <SkipBack className="w-4 h-4" />
                                </Button>
                            )}

                            {config.endpoints.play && config.endpoints.pause && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePlayPause}
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
                                >
                                    <SkipForward className="w-4 h-4" />
                                </Button>
                            )}

                            {config.endpoints.search && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowSearch(true)}
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                            )}

                            {onDisconnect && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onDisconnect}
                                >
                                    <Settings className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* No track playing */}
            {!currentTrack?.item && !showSearch && (
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-xl`}
                            >
                                {config.icon}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{config.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    No hay música reproduciéndose
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {config.endpoints.search && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSearch(true)}
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Buscar música
                                </Button>
                            )}
                            {onDisconnect && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onDisconnect}
                                >
                                    <Settings className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Search Panel */}
            {showSearch && (
                <Card className="p-4">
                    <div className="space-y-4">
                        {/* Search Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Music className="w-5 h-5" />
                                Buscar en {config.name}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
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
                            <div className="text-center py-8 text-muted-foreground">
                                Buscando...
                            </div>
                        )}

                        {!isSearching && searchResults.length > 0 && (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                                <div className="text-center py-8 text-muted-foreground">
                                    No se encontraron resultados
                                </div>
                            )}
                    </div>
                </Card>
            )}
        </div>
    );
}
