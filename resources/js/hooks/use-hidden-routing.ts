import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Hook que oculta las rutas de la URL, manteniendo siempre solo el dominio
 * La navegación funciona internamente pero la URL NUNCA cambia del dominio base
 */
export function useHiddenRouting() {
    useEffect(() => {
        let isNavigating = false;
        let isInitialLoad = true;

        // Rutas que NO deben guardarse ni restaurarse
        const excludedRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/two-factor'];

        // Guardar la ruta actual en sessionStorage
        const saveCurrentRoute = (path: string) => {
            // No guardar rutas de autenticación
            const isExcludedRoute = excludedRoutes.some(route => path.startsWith(route));
            if (path && path !== '/' && path !== window.location.origin && !isExcludedRoute) {
                sessionStorage.setItem('_currentRoute', path);
            }
        };

        // Obtener la ruta guardada
        const getSavedRoute = (): string | null => {
            return sessionStorage.getItem('_currentRoute');
        };

        // Forzar la URL a mostrar solo el dominio
        const enforceCleanUrl = () => {
            if (window.location.pathname !== '/' || window.location.hash || window.location.search) {
                if (window.history.replaceState) {
                    window.history.replaceState(
                        window.history.state,
                        '',
                        window.location.origin
                    );
                }
            }
        };

        // Interceptar router.visit de Inertia
        const originalVisit = router.visit.bind(router);
        router.visit = function(url: any, options: any = {}) {
            const path = typeof url === 'string' ? url : (url?.url || url);

            isNavigating = true;
            isInitialLoad = false;

            // Guardar la ruta actual
            if (path) {
                saveCurrentRoute(path);
            }

            // Asegurar que la URL permanezca limpia
            enforceCleanUrl();

            // Llamar al método original con las opciones modificadas
            const result = originalVisit(url, {
                ...options,
                onFinish: () => {
                    enforceCleanUrl();
                    isNavigating = false;
                    options?.onFinish?.();
                },
            });

            // Forzar URL limpia inmediatamente
            setTimeout(enforceCleanUrl, 0);

            return result;
        };

        // Interceptar router.get, router.post, etc.
        const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
        methods.forEach(method => {
            const originalMethod = (router as any)[method].bind(router);
            (router as any)[method] = function(url: any, data?: any, options?: any) {
                const path = typeof url === 'string' ? url : (url?.url || url);

                isNavigating = true;
                isInitialLoad = false;

                if (path) {
                    saveCurrentRoute(path);
                }

                enforceCleanUrl();

                const result = originalMethod(url, data, {
                    ...options,
                    onFinish: () => {
                        enforceCleanUrl();
                        isNavigating = false;
                        options?.onFinish?.();
                    },
                });

                setTimeout(enforceCleanUrl, 0);

                return result;
            };
        });

        // Monitoreo constante de la URL para forzarla a estar limpia
        const urlMonitor = setInterval(() => {
            if (!isNavigating) {
                enforceCleanUrl();
            }
        }, 50);

        // Manejar botón atrás/adelante
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault();
            isInitialLoad = false;

            const savedPath = getSavedRoute();
            if (savedPath && savedPath !== '/') {
                // Navegar a la ruta guardada sin cambiar la URL
                router.visit(savedPath, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }

            // Forzar URL limpia
            enforceCleanUrl();
        };

        // Manejar visibilidad de la pestaña
        const handleVisibilityChange = () => {
            // Siempre forzar URL limpia cuando la pestaña se vuelve visible
            if (!document.hidden) {
                enforceCleanUrl();
            }
        };

        // Manejar la carga inicial de la página
        const initializePage = () => {
            const currentPath = window.location.pathname;
            const savedPath = getSavedRoute();

            // SIEMPRE forzar la URL limpia primero
            enforceCleanUrl();

            // Verificar si la ruta guardada es una ruta excluida
            const isExcludedRoute = savedPath && excludedRoutes.some(route => savedPath.startsWith(route));

            // Si la página actual no es la raíz (viene de refresh directo a una ruta)
            if (currentPath !== '/' && currentPath !== '') {
                // Guardar esta ruta y luego navegar internamente
                saveCurrentRoute(currentPath);
                isInitialLoad = false;

                // Navegar internamente a esta ruta sin cambiar la URL
                setTimeout(() => {
                    router.visit(currentPath, {
                        preserveState: false,
                        preserveScroll: false,
                        replace: true,
                        onFinish: () => {
                            enforceCleanUrl();
                        }
                    });
                }, 10);
            } else if (savedPath && savedPath !== '/' && savedPath !== currentPath && !isExcludedRoute) {
                // Si estamos en la raíz pero hay una ruta guardada (y no es una ruta de autenticación), restaurarla
                isInitialLoad = false;

                setTimeout(() => {
                    router.visit(savedPath, {
                        preserveState: false,
                        preserveScroll: false,
                        replace: true,
                        onFinish: () => {
                            enforceCleanUrl();
                        }
                    });
                }, 10);
            } else {
                // Si es una ruta excluida, limpiar el sessionStorage
                if (isExcludedRoute) {
                    sessionStorage.removeItem('_currentRoute');
                }
                isInitialLoad = false;
            }
        };

        // Ejecutar inicialización
        setTimeout(initializePage, 0);

        // Event listeners
        window.addEventListener('popstate', handlePopState);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Interceptar eventos de Inertia
        const handleInertiaStart = () => {
            isNavigating = true;
            enforceCleanUrl();
        };

        const handleInertiaFinish = () => {
            isNavigating = false;
            enforceCleanUrl();
        };

        const handleInertiaNavigate = (event: any) => {
            const url = event.detail?.page?.url;
            if (url) {
                saveCurrentRoute(url);
            }
            enforceCleanUrl();
        };

        // Escuchar eventos de Inertia
        document.addEventListener('inertia:start', handleInertiaStart);
        document.addEventListener('inertia:finish', handleInertiaFinish);
        document.addEventListener('inertia:navigate', handleInertiaNavigate);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('inertia:start', handleInertiaStart);
            document.removeEventListener('inertia:finish', handleInertiaFinish);
            document.removeEventListener('inertia:navigate', handleInertiaNavigate);
            clearInterval(urlMonitor);
        };
    }, []);
}

