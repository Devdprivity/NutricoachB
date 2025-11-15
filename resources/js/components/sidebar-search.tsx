import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NavSection {
    title: string;
    items: Array<{
        title: string;
        href: string | { url: string };
        icon?: React.ComponentType<{ className?: string }>;
    }>;
}

interface SidebarSearchProps {
    sections: NavSection[];
}

export function SidebarSearch({ sections }: SidebarSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { state, toggleSidebar } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const searchRef = useRef<HTMLDivElement>(null);

    // Flatten all items from all sections for search
    const allItems = useMemo(() => {
        return sections.flatMap(section => 
            section.items.map(item => ({
                ...item,
                sectionTitle: section.title,
                hrefString: typeof item.href === 'string' ? item.href : item.href.url,
            }))
        );
    }, [sections]);

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return [];
        
        const query = searchQuery.toLowerCase().trim();
        return allItems.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.sectionTitle.toLowerCase().includes(query)
        );
    }, [searchQuery, allItems]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleItemClick = (href: string) => {
        setSearchQuery('');
        setIsOpen(false);
        router.visit(href);
    };

    // When collapsed, show only search icon
    if (isCollapsed) {
        return (
            <div className="px-2 py-1">
                <button
                    onClick={() => {
                        toggleSidebar();
                        // Small delay to ensure sidebar is expanded before focusing
                        setTimeout(() => {
                            const input = document.querySelector('[data-sidebar="search-input"]') as HTMLInputElement;
                            if (input) {
                                input.focus();
                            }
                        }, 300);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                    title="Buscar"
                >
                    <Search className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div ref={searchRef} className="px-2 py-1 relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
                <Input
                    type="text"
                    placeholder="Buscar vistas..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    data-sidebar="search-input"
                    className={cn(
                        "pl-9 pr-9 h-9 w-full bg-sidebar border-sidebar-border rounded-xl text-sm",
                        "focus:ring-2 focus:ring-sidebar-ring focus:border-sidebar-accent",
                        "placeholder:text-sidebar-foreground/50"
                    )}
                />
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setIsOpen(false);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && filteredItems.length > 0 && (
                <div className="absolute top-full left-2 right-2 mt-1 bg-sidebar border border-sidebar-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {filteredItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item.hrefString)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left text-sm"
                            >
                                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.title}</div>
                                    <div className="text-xs text-sidebar-foreground/60 truncate">{item.sectionTitle}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No results message */}
            {isOpen && searchQuery.trim() && filteredItems.length === 0 && (
                <div className="absolute top-full left-2 right-2 mt-1 bg-sidebar border border-sidebar-border rounded-xl shadow-lg z-50 p-4 text-center text-sm text-sidebar-foreground/60">
                    No se encontraron resultados
                </div>
            )}
        </div>
    );
}

