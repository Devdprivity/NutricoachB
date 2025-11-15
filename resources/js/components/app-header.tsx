import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { SpotifyPlayer } from '@/components/spotify-player';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Dumbbell,
    TrendingUp,
    Calendar,
    Target,
    Menu,
    Search,
    Zap,
    Award,
    Activity,
    Music,
    Music2
} from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel de Control',
        href: dashboard(),
        icon: Activity,
    },
    {
        title: 'Mis Entrenamientos',
        href: '/workouts',
        icon: Dumbbell,
    },
    {
        title: 'Nutrición',
        href: '/nutrition',
        icon: Target,
    },
    {
        title: 'Progreso',
        href: '/progress',
        icon: TrendingUp,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Logros',
        href: '/achievements',
        icon: Award,
    },
    {
        title: 'Energía',
        href: '/boost',
        icon: Zap,
    },
];

const activeItemStyles =
    'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 font-semibold';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
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
        <>
            <div className="border-b border-sidebar-border/80 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-gradient-to-b from-white via-orange-50/30 to-white dark:from-neutral-900 dark:via-orange-950/20 dark:to-neutral-900"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left p-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-md">
                                            <AppLogoIcon className="h-6 w-6 fill-current text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-orange-600 dark:text-orange-400">NutiCoach</div>
                                            <div className="text-xs text-neutral-500">Tu aliado fitness</div>
                                        </div>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-2">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={
                                                        typeof item.href ===
                                                        'string'
                                                            ? item.href
                                                            : item.href.url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                page.url ===
                                                    (typeof item.href ===
                                                    'string'
                                                        ? item.href
                                                        : item.href.url) &&
                                                    activeItemStyles,
                                                'h-9 cursor-pointer px-4 rounded-lg transition-all duration-200 hover:scale-105',
                                            )}
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="mr-2 h-4 w-4"
                                                />
                                            )}
                                            {item.title}
                                        </Link>
                                        {page.url === item.href && (
                                            <div className="absolute bottom-0 left-0 h-1 w-full translate-y-px bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-t-full"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                            >
                                <Search className="!size-5 text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                            </Button>
                            <NotificationsDropdown initialUnreadCount={auth.user?.unread_notifications_count || 0} />
                            
                            {/* Reproductor de Spotify o Botón de Conexión */}
                            {spotifyConnected ? (
                                <SpotifyPlayer isConnected={spotifyConnected} />
                            ) : (
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleSpotifyConnect}
                                                disabled={isLoading}
                                                className="group h-9 w-9 cursor-pointer transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                            >
                                                <Music2 className="!size-5 text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors opacity-50" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Conectar Spotify</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider
                                        key={item.title}
                                        delayDuration={0}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={
                                                        typeof item.href ===
                                                        'string'
                                                            ? item.href
                                                            : item.href.url
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:scale-110 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="size-5 text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                                                        />
                                                    )}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
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
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
