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
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Music, Music2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Verificar estado de Spotify
        if (auth?.user) {
            const hasSpotify = !!(auth.user as any).spotify_id;
            setSpotifyConnected(hasSpotify);
        }
    }, [auth?.user]);

    const handleSpotifyConnect = async () => {
        if (spotifyConnected) {
            // Desconectar
            setIsLoading(true);
            try {
                // Obtener token CSRF
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (!csrfToken) {
                    // Si no hay token CSRF, usar Inertia router
                    const { router } = await import('@inertiajs/react');
                    router.post('/spotify/disconnect', {}, {
                        onSuccess: () => {
                            setSpotifyConnected(false);
                            window.location.reload();
                        },
                        onError: (errors) => {
                            alert('Error al desconectar Spotify: ' + (errors.message || 'Error desconocido'));
                        }
                    });
                    return;
                }

                const response = await fetch('/spotify/disconnect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    setSpotifyConnected(false);
                    window.location.reload();
                } else {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        alert(data.message || 'Error al desconectar Spotify');
                    } else {
                        const text = await response.text();
                        console.error('Error response:', text);
                        alert('Error al desconectar Spotify. Por favor, recarga la página.');
                    }
                }
            } catch (error) {
                console.error('Error desconectando Spotify:', error);
                alert('Error al desconectar Spotify. Por favor, intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        } else {
            // Conectar - redirigir a Spotify
            window.location.href = '/spotify/redirect';
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {auth?.user && (
                <div className="flex items-center gap-2">
                    <NotificationsDropdown initialUnreadCount={auth.user?.unread_notifications_count || 0} />
                    
                    {/* Botón de Spotify */}
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSpotifyConnect}
                                    disabled={isLoading}
                                    className={cn(
                                        "h-9 w-9 cursor-pointer transition-colors",
                                        spotifyConnected 
                                            ? "hover:bg-green-50 dark:hover:bg-green-950/20" 
                                            : "hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                    )}
                                >
                                    {spotifyConnected ? (
                                        <Music className={cn(
                                            "h-5 w-5 transition-colors",
                                            "text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300"
                                        )} />
                                    ) : (
                                        <Music2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors opacity-50" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{spotifyConnected ? 'Desconectar Spotify' : 'Conectar Spotify'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

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
