import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, Droplet, Apple, UserPlus, UserMinus, TrendingUp, MessageSquare, Award, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Icon } from '@/components/icon';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    icon: string | null;
    color: string | null;
    action_url: string | null;
    is_read: boolean;
    created_at: string;
    created_at_full: string;
}

interface NotificationsDropdownProps {
    initialUnreadCount?: number;
}

const iconMap: Record<string, any> = {
    Droplet,
    Apple,
    UserPlus,
    UserMinus,
    TrendingUp,
    MessageSquare,
    Award,
    Clock,
    AlertCircle,
};

export function NotificationsDropdown({ initialUnreadCount = 0 }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            // Obtener CSRF token
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'same-origin',
            });

            const csrfToken = getCsrfToken();

            const response = await fetch('/api/notifications/unread', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCsrfToken = (): string | null => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
        return null;
    };

    const markAsRead = async (id: number) => {
        try {
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'same-origin',
            });

            const csrfToken = getCsrfToken();

            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setNotifications(prev => 
                    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'same-origin',
            });

            const csrfToken = getCsrfToken();

            const response = await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'same-origin',
            });

            const csrfToken = getCsrfToken();

            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const notification = notifications.find(n => n.id === id);
                if (notification && !notification.is_read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        
        if (notification.action_url) {
            setIsOpen(false);
            router.visit(notification.action_url);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Polling cada 30 segundos cuando está abierto
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [isOpen]);

    const IconComponent = (iconName: string | null) => {
        if (!iconName) return Bell;
        return iconMap[iconName] || Bell;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                >
                    <Bell className="!size-5 text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                    {unreadCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                ref={dropdownRef}
                className="w-80 max-h-[500px] overflow-hidden flex flex-col p-0"
                align="end"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-7 text-xs"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                </div>

                <div className="overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const IconComp = IconComponent(notification.icon);
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 hover:bg-accent transition-colors cursor-pointer relative group",
                                            !notification.is_read && "bg-accent/50"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div 
                                                className="flex-shrink-0 mt-0.5"
                                                style={{ color: notification.color || '#6b7280' }}
                                            >
                                                <Icon iconNode={IconComp} className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "text-sm font-medium",
                                                            !notification.is_read && "font-semibold"
                                                        )}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {notification.created_at}
                                                        </p>
                                                    </div>
                                                    {!notification.is_read && (
                                                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                                setIsOpen(false);
                                router.visit('/notifications');
                            }}
                        >
                            Ver todas las notificaciones
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

