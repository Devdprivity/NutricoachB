# Mobile Bottom Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left-drawer sidebar on mobile (< 768px) with a native-style fixed bottom tab bar and a "Más" overflow screen.

**Architecture:** New `BottomNav` component renders fixed to the bottom on mobile only (`md:hidden`). New Inertia page `More` at `/more` lists overflow navigation items. `AppSidebarLayout` adds bottom padding on mobile so content is not obscured by the nav bar. `SidebarTrigger` is hidden on mobile so the left drawer cannot be opened.

**Tech Stack:** React, TypeScript, Inertia.js (`usePage`), Tailwind CSS 4, lucide-react, Laravel

---

## File Map

| Action | File |
|---|---|
| **Create** | `resources/js/components/bottom-nav.tsx` |
| **Create** | `resources/js/pages/more.tsx` |
| **Modify** | `resources/js/layouts/app/app-sidebar-layout.tsx` |
| **Modify** | `resources/js/components/app-sidebar-header.tsx` |
| **Modify** | `routes/web.php` |

---

### Task 1: Create `BottomNav` component

**Files:**
- Create: `resources/js/components/bottom-nav.tsx`

- [ ] **Step 1: Create the file with full implementation**

```tsx
// resources/js/components/bottom-nav.tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run types`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/bottom-nav.tsx
git commit -m "feat: add BottomNav component for mobile navigation"
```

---

### Task 2: Add `/more` route to `routes/web.php`

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add the route inside the `auth` middleware group**

Find the block starting with `Route::middleware(['auth', 'verified'])->group(function () {` and add the `/more` route near the top, after the dashboard route (around line 67):

```php
Route::get('more', function () {
    return Inertia::render('more');
})->name('more');
```

The `Inertia` facade is already imported at the top of the file (`use Inertia\Inertia;`).

- [ ] **Step 2: Verify route is registered**

Run: `php artisan route:list --name=more`
Expected output includes: `GET|HEAD  more  more  Closure`

- [ ] **Step 3: Commit**

```bash
git add routes/web.php
git commit -m "feat: add /more route for mobile overflow navigation"
```

---

### Task 3: Create `More` Inertia page

**Files:**
- Create: `resources/js/pages/more.tsx`

- [ ] **Step 1: Create the page**

```tsx
// resources/js/pages/more.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    ChevronRight,
    Crown,
    LogOut,
    Settings,
    Users,
} from 'lucide-react';

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
                {/* User card */}
                <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/50 bg-sidebar p-4">
                    <Avatar className="size-12 overflow-hidden rounded-full">
                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                        <AvatarFallback className="rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{auth.user.name}</span>
                        <span className="text-xs text-muted-foreground">{auth.user.email}</span>
                    </div>
                </div>

                {/* Navigation sections */}
                {sections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-1">
                        <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {section.title}
                        </p>
                        <div className="rounded-xl border border-sidebar-border/50 bg-sidebar overflow-hidden">
                            {section.items.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-sidebar-accent transition-colors ${
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

                {/* Logout */}
                <div className="rounded-xl border border-sidebar-border/50 bg-sidebar overflow-hidden">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-red-500 hover:bg-sidebar-accent transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run types`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/more.tsx
git commit -m "feat: add More page for mobile overflow navigation"
```

---

### Task 4: Modify `AppSidebarLayout` to integrate `BottomNav`

**Files:**
- Modify: `resources/js/layouts/app/app-sidebar-layout.tsx`

- [ ] **Step 1: Update the layout to include `BottomNav` and add bottom padding**

Replace the entire file with:

```tsx
// resources/js/layouts/app/app-sidebar-layout.tsx
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { BottomNav } from '@/components/bottom-nav';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="pb-16 md:pb-0">
                    {children}
                </div>
            </AppContent>
            <BottomNav />
        </AppShell>
    );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run types`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/layouts/app/app-sidebar-layout.tsx
git commit -m "feat: integrate BottomNav into AppSidebarLayout with mobile padding"
```

---

### Task 5: Hide `SidebarTrigger` on mobile in the header

**Files:**
- Modify: `resources/js/components/app-sidebar-header.tsx`

- [ ] **Step 1: Wrap `SidebarTrigger` with `hidden md:flex`**

Find this block in `app-sidebar-header.tsx` (lines 41–44):

```tsx
<div className="flex items-center gap-2">
    <SidebarTrigger className="-ml-1" />
    <Breadcrumbs breadcrumbs={breadcrumbs} />
</div>
```

Replace with:

```tsx
<div className="flex items-center gap-2">
    <div className="hidden md:flex">
        <SidebarTrigger className="-ml-1" />
    </div>
    <Breadcrumbs breadcrumbs={breadcrumbs} />
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run types`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/app-sidebar-header.tsx
git commit -m "feat: hide SidebarTrigger on mobile (bottom nav replaces it)"
```

---

### Task 6: Manual verification

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Open browser at `http://localhost` and open DevTools → Toggle device toolbar (mobile viewport, e.g. iPhone 14, 390px wide)**

Verify:
- Bottom tab bar is visible with 5 tabs: Dashboard, Nutrición, Ejercicios, Progreso, Más
- Active tab highlights in orange (with thin orange bar at top)
- `SidebarTrigger` (hamburger) is NOT visible in the header
- Page content is not hidden behind the bottom bar (there is visible padding at the bottom)

- [ ] **Step 3: Navigate between tabs and verify active state updates correctly**

- [ ] **Step 4: Tap "Más" and verify the More screen shows user info, grouped nav links, and logout button**

- [ ] **Step 5: Switch to desktop viewport (≥ 768px)**

Verify:
- Bottom nav is NOT visible
- Left sidebar is visible and functional
- `SidebarTrigger` is visible in the header
- No extra bottom padding on desktop
