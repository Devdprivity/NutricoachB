# NutriCoach Backend API

Sistema de backend completo para NutriCoach Luis, un agente de IA especializado en seguimiento nutricional y transformación corporal.

## 🚀 Características Principales

- ✅ **API RESTful completa** con Laravel 12
- ✅ **Autenticación** con Laravel Sanctum
- ✅ **Base de datos nutricional** completa con 12+ alimentos
- ✅ **Sistema de coaching inteligente** con comandos especiales
- ✅ **Alertas de seguridad** automáticas
- ✅ **Contextos adaptativos** para ajustar tolerancia
- ✅ **Seguimiento de hidratación** y planes de comida
- ✅ **CORS configurado** para consumo desde apps móviles/web

## 📚 Documentación

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentación completa de endpoints
- **[estructurasistemapp.md](./estructurasistemapp.md)** - Descripción del sistema
- **[IMPLEMENTACION_COMPLETA.md](./IMPLEMENTACION_COMPLETA.md)** - Detalles de implementación

## 🛠️ Stack Tecnológico

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React 19 + Inertia.js + TypeScript
- **Base de datos:** SQLite (desarrollo) / MySQL/PostgreSQL (producción)
- **Autenticación:** Laravel Sanctum + Google OAuth
- **Estilos:** TailwindCSS 4 + Radix UI

## 📦 Instalación

### Requisitos Previos

- PHP 8.2 o superior
- Composer
- Node.js 18+ y npm
- SQLite (para desarrollo)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd nuticoachback
```

2. **Instalar dependencias de PHP**
```bash
composer install
```

3. **Instalar dependencias de Node**
```bash
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configurar el archivo .env**
```env
APP_NAME="NutriCoach API"
APP_ENV=local
APP_URL=http://localhost:8000
APP_DEBUG=true

DB_CONNECTION=sqlite

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000

FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=nutricoach://

# Configurar si usas Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"
```

6. **Crear base de datos y migrar**
```bash
touch database/database.sqlite
php artisan migrate --seed
```

7. **Compilar assets**
```bash
npm run build
```

8. **Iniciar servidor de desarrollo**
```bash
# Opción 1: Solo backend
php artisan serve

# Opción 2: Backend + Frontend + Queue
composer dev
```

El servidor estará disponible en: `http://localhost:8000`
La API estará disponible en: `http://localhost:8000/api`

## 🔐 Autenticación

### Para Apps Móviles/Web Externas

1. **Obtener token mediante Google OAuth:**
```bash
GET http://localhost:8000/auth/google/redirect
```

2. **Usar el token en las solicitudes:**
```bash
curl -X GET http://localhost:8000/api/profile \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

### Para Desarrollo/Testing

Puedes crear un usuario manualmente y obtener un token:

```php
php artisan tinker

$user = \App\Models\User::create([
    'name' => 'Usuario Test',
    'email' => 'test@example.com',
    'password' => bcrypt('password123'),
]);

$token = $user->createToken('dev-token')->plainTextToken;
echo $token;
```

## 🧪 Testing

```bash
# Ejecutar tests
php artisan test

# Ejecutar tests con coverage
php artisan test --coverage
```

## 📡 Endpoints Principales

### Autenticación
- `GET /auth/google/redirect` - Iniciar OAuth con Google
- `GET /auth/google/callback` - Callback de Google OAuth
- `GET /api/user` - Obtener usuario autenticado

### Perfil
- `GET /api/profile` - Obtener perfil
- `POST /api/profile` - Crear perfil
- `PUT /api/profile` - Actualizar perfil

### Nutrición
- `GET /api/nutrition` - Listar registros
- `POST /api/nutrition` - Crear registro
- `GET /api/nutrition/daily-summary` - Resumen diario
- `GET /api/nutrition/weekly-summary` - Resumen semanal

### Alimentos
- `GET /api/foods` - Listar alimentos
- `GET /api/foods/categories` - Categorías
- `POST /api/foods/{id}/calculate` - Calcular nutrición

### Coaching
- `POST /api/coaching/daily-summary` - Resumen del día
- `POST /api/coaching/progress-check` - ¿Cómo voy?
- `POST /api/coaching/difficult-day` - Día difícil
- `POST /api/coaching/craving-sos` - SOS antojo
- `POST /api/coaching/social-situation` - Situación social

### Alertas
- `GET /api/alerts` - Alertas activas
- `POST /api/alerts/check` - Verificar alertas
- `GET /api/alerts/medical-disclaimer` - Disclaimer médico
- `POST /api/alerts/medical-disclaimer/accept` - Aceptar disclaimer

Ver **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** para documentación completa.

## 🎯 Características del Sistema

### Sistema de Evaluación Adaptativo
- **Verde (✅):** Dentro del rango objetivo (±100 kcal, ±15g macros)
- **Amarillo (⚠️):** Ligeramente fuera (±200 kcal, ±25g macros)
- **Rojo (❌):** Significativamente fuera (>200 kcal, >25g macros)

### Inteligencia Emocional Integrada
- Reconocimiento de contextos (días estresantes, fines de semana, etc.)
- Ajuste automático de tolerancia nutricional
- Estrategias para manejar antojos
- Apoyo en días difíciles

### Protocolos de Seguridad
- Alertas automáticas por pérdida de peso acelerada
- Detección de comportamientos obsesivos
- Recomendaciones de consulta médica
- Disclaimer médico obligatorio

### Filosofía del Sistema
> "La transformación sostenible se construye con autocompasión inteligente, no con perfección rígida."

- Busca el 80% de adherencia, no el 100%
- Promueve flexibilidad inteligente sobre rigidez perfecta
- Enfoque en bienestar mental además del físico

## 🎨 Paleta de Colores

- **Background:** E0FE10 (claro) / 1C2227 (oscuro)
- **Text:** FFFFFF (claro) / 434B53 (oscuro)

## 📂 Estructura del Proyecto

```
nuticoachback/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AlertController.php
│   │   │   │   ├── CoachingController.php
│   │   │   │   ├── FoodItemController.php
│   │   │   │   ├── HydrationController.php
│   │   │   │   ├── MealPlanController.php
│   │   │   │   ├── NutritionalDataController.php
│   │   │   │   ├── UserContextController.php
│   │   │   │   └── UserProfileController.php
│   │   │   └── Auth/
│   │   └── Middleware/
│   └── Models/
│       ├── CoachingMessage.php
│       ├── FoodItem.php
│       ├── HydrationRecord.php
│       ├── MealPlan.php
│       ├── MedicalDisclaimer.php
│       ├── NutritionalData.php
│       ├── User.php
│       ├── UserAlert.php
│       ├── UserContext.php
│       └── UserProfile.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   ├── web.php
│   └── auth.php
├── config/
│   ├── cors.php
│   └── sanctum.php
└── resources/
    └── js/
```

## 🔧 Comandos Útiles

```bash
# Limpiar caché
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Ver rutas
php artisan route:list

# Crear migración
php artisan make:migration create_table_name

# Crear modelo con migración y controlador
php artisan make:model ModelName -mcr

# Ejecutar seeders
php artisan db:seed

# Refrescar base de datos (⚠️ elimina datos)
php artisan migrate:fresh --seed

# Formatear código
./vendor/bin/pint
npm run format
```

## 🐛 Troubleshooting

### Error: "Class 'Laravel\Sanctum\HasApiTokens' not found"
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Error: "CORS policy"
Verifica que `config/cors.php` y `config/sanctum.php` estén correctamente configurados:
```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000
```

### Error: "Token not found"
Asegúrate de incluir el header de autorización:
```
Authorization: Bearer {token}
```

### Base de datos bloqueada (SQLite)
```bash
php artisan queue:restart
rm database/database.sqlite
touch database/database.sqlite
php artisan migrate:fresh --seed
```

## 🚀 Despliegue a Producción

### Variables de Entorno para Producción
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

# Base de datos (MySQL/PostgreSQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutricoach
DB_USERNAME=usuario
DB_PASSWORD=contraseña

# CORS y Sanctum
SANCTUM_STATEFUL_DOMAINS=tu-dominio.com,app.tu-dominio.com
```

### Comandos de Despliegue
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

## 📞 Soporte y Contribución

Si encuentras algún bug o tienes sugerencias:
1. Crea un issue en el repositorio
2. Envía un pull request con mejoras
3. Contacta al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## ⚠️ Disclaimer Médico

Este sistema de apoyo educativo **NO reemplaza** la supervisión médica profesional. Siempre se recomienda consultar con nutricionistas, médicos y entrenadores certificados antes de seguir cualquier plan nutricional o de suplementación.

---

**Desarrollado con ❤️ para ayudar en procesos de transformación corporal saludable y sostenible.**
#   N u t r i c o a c h B  
 