import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavSection {
    title: string;
    items: NavItem[];
}

export function NavMain({ sections = [] }: { sections: NavSection[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    
    return (
        <>
            {sections.map((section, sectionIndex) => (
                <SidebarGroup key={sectionIndex} className="px-2 py-0.5">
                    <SidebarGroupLabel>
                        {isCollapsed ? '...' : section.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {section.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(
                                        typeof item.href === 'string'
                                            ? item.href
                                            : item.href.url,
                                    )}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link 
                                        href={item.href} 
                                        prefetch={auth?.user ? 'intent' : false}
                                        preserveState
                                        preserveScroll
                                    >
                                        {item.icon && <item.icon />}
                                        {!isCollapsed && <span>{item.title}</span>}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
