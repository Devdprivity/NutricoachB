import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, ChevronRight, Crown, LogOut, Settings, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Más', href: '/more' }];

const sections = [
    {
        title: 'Social',
        items: [
            { label: 'Logros', href: '/achievements', icon: Award },
            { label: 'Social', href: '/social', icon: Users },
        ],
    },
    {
        title: 'Suscripción',
        items: [
            { label: 'Mi plan', href: '/subscription', icon: Crown },
        ],
    },
    {
        title: 'Cuenta',
        items: [
            { label: 'Configuración', href: '/settings', icon: Settings },
        ],
    },
];

export default function More() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Más" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/50 bg-sidebar p-4">
                    <Avatar className="size-12 overflow-hidden rounded-full">
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback className="rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-white">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{auth.user.name}</span>
                        <span className="text-xs text-muted-foreground">{auth.user.email}</span>
                    </div>
                </div>

                {sections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-1">
                        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {section.title}
                        </p>
                        <div className="overflow-hidden rounded-xl border border-sidebar-border/50 bg-sidebar">
                            {section.items.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-sidebar-accent ${
                                            index < section.items.length - 1
                                                ? 'border-b border-sidebar-border/50'
                                                : ''
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1">{item.label}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="overflow-hidden rounded-xl border border-sidebar-border/50 bg-sidebar">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-red-500 transition-colors hover:bg-sidebar-accent"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
