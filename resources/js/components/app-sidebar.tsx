import { NavMain } from '@/components/nav-main';
import { SidebarSearch } from '@/components/sidebar-search';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Apple, Award, Calendar, CalendarDays, ChefHat, Crown, Droplet, Dumbbell, LayoutGrid, MessageSquare, TrendingUp, UtensilsCrossed, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Principal',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Nutrición',
        items: [
            {
                title: 'Hidratación',
                href: '/hydration',
                icon: Droplet,
            },
            {
                title: 'Nutrición',
                href: '/nutrition',
                icon: Apple,
            },
            {
                title: 'Recetas',
                href: '/recipes',
                icon: ChefHat,
            },
            {
                title: 'Planes de Comidas',
                href: '/weekly-meal-plans',
                icon: UtensilsCrossed,
            },
        ],
    },
    {
        title: 'Ejercicios',
        items: [
            {
                title: 'Ejercicios',
                href: '/exercises',
                icon: Dumbbell,
            },
            {
                title: 'Planes de Entrenamiento',
                href: '/workout-plans',
                icon: CalendarDays,
            },
        ],
    },
    {
        title: 'Análisis',
        items: [
            {
                title: 'Progreso',
                href: '/progress',
                icon: TrendingUp,
            },
            {
                title: 'Contexto',
                href: '/context',
                icon: Calendar,
            },
            {
                title: 'Coaching',
                href: '/coaching',
                icon: MessageSquare,
            },
        ],
    },
    {
        title: 'Social',
        items: [
            {
                title: 'Logros',
                href: '/achievements',
                icon: Award,
            },
            {
                title: 'Social',
                href: '/social',
                icon: Users,
            },
        ],
    },
    {
        title: 'Suscripción',
        items: [
            {
                title: 'Suscripción',
                href: '/subscription',
                icon: Crown,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarSearch sections={navSections} />
                <NavMain sections={navSections} />
            </SidebarContent>
        </Sidebar>
    );
}
