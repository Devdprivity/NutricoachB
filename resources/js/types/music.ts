export type MusicProvider = 'spotify' | 'youtube_music' | 'apple_music';

export interface MusicService {
    id: MusicProvider;
    name: string;
    icon: string;
    color: string;
    isConnected: boolean;
    isPremium?: boolean; // Some services require premium
}

export interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
    external_urls?: {
        spotify?: string;
        youtube?: string;
        apple_music?: string;
    };
    duration_ms?: number;
    progress_ms?: number;
}

export interface CurrentlyPlaying {
    is_playing: boolean;
    item?: Track;
    progress_ms?: number;
    device?: {
        id: string;
        name: string;
        type: string;
    };
}

export interface MusicActivity {
    id: number;
    user_id: number;
    music_provider: MusicProvider;
    track_id: string;
    track_name: string;
    artist_name: string;
    album_name?: string;
    album_image_url?: string;
    track_url?: string;
    duration_ms?: number;
    progress_ms?: number;
    is_playing: boolean;
    started_at: string;
    ended_at?: string;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

export interface SearchResult {
    tracks?: {
        items: Track[];
    };
    videos?: {
        items: YouTubeVideo[];
    };
}

export interface YouTubeVideo {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
    };
}

export interface AppleMusicTrack {
    id: string;
    type: 'songs';
    attributes: {
        name: string;
        artistName: string;
        albumName: string;
        artwork: {
            url: string;
            width: number;
            height: number;
        };
        durationInMillis: number;
        url: string;
    };
}
