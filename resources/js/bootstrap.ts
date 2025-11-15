/**
 * Configuración de Axios para Laravel
 */
import axios from 'axios';

// Configurar axios para usar cookies (necesario para CSRF)
axios.defaults.withCredentials = true;

// Configurar headers comunes
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Leer el token CSRF del meta tag y configurarlo
const token = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Interceptor para asegurar que cada petición tenga el token
axios.interceptors.request.use((config) => {
    const csrfToken = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    if (csrfToken && config.headers) {
        config.headers['X-CSRF-TOKEN'] = csrfToken.content;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
