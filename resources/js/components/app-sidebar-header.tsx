import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { SpotifyPlayer } from '@/components/spotify-player';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [spotifyConnected, setSpotifyConnected] = useState(false);

    useEffect(() => {
        // Verificar estado de Spotify
        if (auth?.user) {
            const hasSpotify = !!(auth.user as any).spotify_id;
            setSpotifyConnected(hasSpotify);
        }
    }, [auth?.user]);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {auth?.user && (
                <div className="flex items-center gap-2">
                    <NotificationsDropdown initialUnreadCount={auth.user?.unread_notifications_count || 0} />
                    
                    {/* Reproductor de Spotify (solo mostrar si está conectado) */}
                    {spotifyConnected && <SpotifyPlayer isConnected={spotifyConnected} />}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="size-10 rounded-full p-1 hover:ring-2 hover:ring-orange-500 transition-all duration-200"
                            >
                                <Avatar className="size-8 overflow-hidden rounded-full border-2 border-transparent hover:border-orange-400 transition-all">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </header>
    );
}
