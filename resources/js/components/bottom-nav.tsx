import { Link, usePage } from '@inertiajs/react';
import { BarChart2, Dumbbell, LayoutDashboard, MoreHorizontal, Salad } from 'lucide-react';

const tabs = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        activePatterns: ['/dashboard'],
    },
    {
        label: 'Nutrición',
        href: '/nutrition',
        icon: Salad,
        activePatterns: ['/nutrition', '/hydration', '/recipes', '/weekly-meal-plans'],
    },
    {
        label: 'Ejercicios',
        href: '/exercises',
        icon: Dumbbell,
        activePatterns: ['/exercises', '/workout-plans'],
    },
    {
        label: 'Progreso',
        href: '/progress',
        icon: BarChart2,
        activePatterns: ['/progress', '/context', '/coaching'],
    },
    {
        label: 'Más',
        href: '/more',
        icon: MoreHorizontal,
        activePatterns: ['/more'],
    },
] as const;

export function BottomNav() {
    const { url } = usePage();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-sidebar-border/50 bg-background md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {tabs.map((tab) => {
                const isActive = tab.activePatterns.some((p) => url.startsWith(p));
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                            isActive ? 'text-orange-500' : 'text-muted-foreground'
                        }`}
                    >
                        {isActive && (
                            <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-orange-500" />
                        )}
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
