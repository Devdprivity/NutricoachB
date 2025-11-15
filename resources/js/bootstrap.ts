/**
 * Configuración de Axios para Laravel
 */
import axios from 'axios';

// Configurar axios para usar cookies (necesario para CSRF)
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Configurar headers comunes
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Leer el token CSRF del meta tag
const token = document.head.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

export default axios;
