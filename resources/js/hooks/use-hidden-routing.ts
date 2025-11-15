import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Hook que oculta las rutas de la URL, manteniendo siempre solo el dominio
 * La navegación funciona internamente pero la URL siempre muestra solo el dominio base
 */
export function useHiddenRouting() {
    useEffect(() => {
        // Flag para indicar si la página acaba de cargar
        let isInitialLoad = true;

        // Guardar la ruta inicial
        const saveRoute = (path: string) => {
            if (path && path !== '/') {
                sessionStorage.setItem('_currentRoute', path);
            }
        };

        // Función para reemplazar la URL mostrando solo el dominio
        const replaceUrl = (path?: string) => {
            if (window.history.replaceState) {
                const currentPath = path || window.location.pathname;
                saveRoute(currentPath);

                window.history.replaceState(
                    { ...window.history.state, path: currentPath },
                    '',
                    window.location.origin
                );
            }
        };

        // Interceptar router.visit de Inertia
        const originalVisit = router.visit.bind(router);
        router.visit = function(url: any, options: any = {}) {
            const path = typeof url === 'string' ? url : (url?.url || url);

            // Marcar que ya no es la carga inicial
            isInitialLoad = false;

            // Guardar la ruta antes de navegar
            if (path) {
                saveRoute(path);
                // Reemplazar URL inmediatamente
                replaceUrl(path);
            }

            // Llamar al método original
            return originalVisit(url, options);
        };

        // Interceptar router.get, router.post, etc.
        const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
        methods.forEach(method => {
            const originalMethod = (router as any)[method].bind(router);
            (router as any)[method] = function(url: any, data?: any, options?: any) {
                const path = typeof url === 'string' ? url : (url?.url || url);

                // Marcar que ya no es la carga inicial
                isInitialLoad = false;

                if (path) {
                    saveRoute(path);
                    replaceUrl(path);
                }
                return originalMethod(url, data, options);
            };
        });

        // Interceptar clicks en enlaces
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href]') as HTMLAnchorElement;

            if (link && link.href) {
                try {
                    const url = new URL(link.href);
                    // Solo interceptar enlaces del mismo origen
                    if (url.origin === window.location.origin && url.pathname !== '/') {
                        // Marcar que ya no es la carga inicial
                        isInitialLoad = false;

                        const path = url.pathname + url.search + url.hash;
                        saveRoute(path);
                        // Reemplazar URL antes de que Inertia navegue
                        setTimeout(() => replaceUrl(path), 0);
                    }
                } catch (e) {
                    // Ignorar errores de URL inválida
                }
            }
        };

        // Manejar botón atrás/adelante
        const handlePopState = (e: PopStateEvent) => {
            // Marcar que ya no es la carga inicial
            isInitialLoad = false;

            const savedPath = sessionStorage.getItem('_currentRoute') || '/';
            const statePath = e.state?.path;

            if (statePath && statePath !== savedPath) {
                saveRoute(statePath);
            } else if (savedPath !== '/') {
                // Navegar a la ruta guardada
                router.visit(savedPath, { preserveState: true, preserveScroll: true });
            }

            // Mantener URL limpia
            replaceUrl();
        };

        // Interceptar refresh/recarga de página
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Restaurar la URL real antes del refresh para que el navegador
            // haga la petición a la ruta correcta
            const savedPath = sessionStorage.getItem('_currentRoute');
            if (savedPath && savedPath !== '/') {
                // Restaurar la URL real sin agregar al historial
                window.history.replaceState(
                    window.history.state,
                    '',
                    savedPath
                );
            }
        };

        // Observar cambios en la URL usando un intervalo (más confiable)
        let lastPath = window.location.pathname;
        const urlCheckInterval = setInterval(() => {
            // Solo monitorear cambios después de la carga inicial
            if (!isInitialLoad) {
                const currentPath = window.location.pathname;
                if (currentPath !== lastPath) {
                    lastPath = currentPath;
                    if (currentPath !== '/') {
                        saveRoute(currentPath);
                        replaceUrl(currentPath);
                    }
                }
            }
        }, 100);

        // Manejar la carga inicial de la página
        const initializePage = () => {
            const currentPath = window.location.pathname;

            // Si estamos en una página específica después de refresh, guardarla
            if (currentPath !== '/' && currentPath !== '') {
                saveRoute(currentPath);
                // Esperar un momento antes de ocultar la URL para asegurar que Inertia cargó
                setTimeout(() => {
                    replaceUrl(currentPath);
                    isInitialLoad = false;
                }, 100);
            } else {
                // Si estamos en la raíz, ocultar inmediatamente
                isInitialLoad = false;
            }
        };

        // Ejecutar inicialización
        initializePage();

        // Event listeners
        document.addEventListener('click', handleLinkClick, true);
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // También interceptar después de que Inertia complete la navegación
        const handleInertiaComplete = () => {
            // Solo reemplazar URL si no es la carga inicial
            if (!isInitialLoad) {
                const currentPath = window.location.pathname;
                if (currentPath !== '/') {
                    replaceUrl();
                }
            }
        };

        // Escuchar eventos de Inertia si están disponibles
        if (typeof window !== 'undefined' && (window as any).Inertia) {
            document.addEventListener('inertia:complete', handleInertiaComplete);
        }

        // Cleanup
        return () => {
            document.removeEventListener('click', handleLinkClick, true);
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('inertia:complete', handleInertiaComplete);
            clearInterval(urlCheckInterval);
        };
    }, []);
}

