# Mobile Bottom Navigation — Design Spec
**Date:** 2026-05-02  
**Status:** Approved

## Overview

Replace the existing left-drawer sidebar on mobile with a native-style bottom tab bar (Bottom Navigation pattern). Desktop behavior remains unchanged. The goal is a native app feel on mobile devices (< 768px).

## Architecture

### New Files
- `resources/js/components/bottom-nav.tsx` — Fixed bottom tab bar, mobile only
- `resources/js/pages/more.tsx` — "Más" overflow screen at route `/more`

### Modified Files
- `resources/js/layouts/app/app-sidebar-layout.tsx` — Add `pb-16` on mobile content area; disable sidebar sheet on mobile
- `resources/js/components/app-sidebar-header.tsx` — Hide `SidebarTrigger` on mobile (`hidden md:flex`)
- `routes/web.php` — Add `GET /more` route returning Inertia `More` page

## Breakpoint Behavior

| Breakpoint | Sidebar | Bottom Nav | SidebarTrigger |
|---|---|---|---|
| `< 768px` | Hidden (sheet disabled) | Visible, fixed bottom | Hidden |
| `≥ 768px` | Visible (current behavior) | Hidden | Visible |

The existing `useIsMobile()` hook (threshold: 768px) is used for detection.

## `BottomNav` Component

**Location:** `resources/js/components/bottom-nav.tsx`

**Behavior:**
- `fixed bottom-0 left-0 right-0`, `md:hidden`, high z-index
- Background: `bg-background border-t border-sidebar-border/50`
- 5 tabs rendered as flex row

**Tabs:**

| Tab | Icon (lucide-react) | Primary Route | Active when URL contains |
|---|---|---|---|
| Dashboard | `LayoutDashboard` | `/dashboard` | `/dashboard` |
| Nutrición | `Salad` | `/nutrition` | `nutrition`, `hydration`, `recipes`, `meal-plan` |
| Ejercicios | `Dumbbell` | `/exercises` | `exercise`, `workout` |
| Progreso | `BarChart2` | `/progress` | `progress`, `context`, `coaching` |
| Más | `MoreHorizontal` | `/more` | `/more` |

**Active state:** Orange accent (`text-orange-500`), small dot indicator above icon.  
**Inactive state:** `text-muted-foreground`.  
**Safe area:** Bottom padding accounts for iPhone home indicator (`env(safe-area-inset-bottom)`).  
**Route detection:** Via `usePage().url` from `@inertiajs/react`.

## `MoreScreen` Page

**Location:** `resources/js/pages/more.tsx`  
**Route:** `GET /more`  
**Layout:** Same `AppSidebarLayout` (bottom nav visible, sidebar hidden on mobile)

**Structure:**
1. Page header: "Más"
2. User card: avatar + name + email
3. Grouped item list with `ChevronRight` arrow:
   - **Social:** Logros (`/achievements`), Comunidad (`/social`)
   - **Suscripción:** Mi plan (`/subscription`)
   - **Cuenta:** Configuración (`/settings`), Cerrar sesión (POST `/logout`)
4. Each item: icon + label + `ChevronRight`, full-width tap target

## Layout Adjustments

### `app-sidebar-layout.tsx`
- Main content area: add `pb-16 md:pb-0` so bottom nav does not overlap content
- The existing `Sheet`-based mobile sidebar continues to work on desktop; on mobile the `SidebarTrigger` is hidden so users cannot open it

### `app-sidebar-header.tsx`
- Wrap `SidebarTrigger` in `hidden md:flex` so it only appears on desktop

## Styling

- Follows existing color tokens: `bg-background`, `border-sidebar-border/50`, `text-muted-foreground`
- Active accent: `text-orange-500` (matches app's existing orange `#e0610a`)
- Icons from `lucide-react` (already a dependency)
- No new CSS — all Tailwind utility classes

## Out of Scope

- Gesture-based drawer on mobile (removed entirely)
- Animated tab transitions
- Badge counts on tabs (can be added later)
- Reordering tabs by user preference
