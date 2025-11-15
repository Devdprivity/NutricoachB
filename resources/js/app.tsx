import '../css/app.css';

// Silenciar errores de extensiones del navegador
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        // Ignorar errores relacionados con extensiones del navegador
        if (
            event.message?.includes('runtime.lastError') ||
            event.message?.includes('message channel closed') ||
            event.message?.includes('Extension context invalidated')
        ) {
            event.preventDefault();
            return false;
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        // Ignorar promesas rechazadas relacionadas con extensiones
        if (
            event.reason?.message?.includes('runtime.lastError') ||
            event.reason?.message?.includes('message channel closed') ||
            event.reason?.message?.includes('Extension context invalidated')
        ) {
            event.preventDefault();
            return false;
        }
    });
}

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
