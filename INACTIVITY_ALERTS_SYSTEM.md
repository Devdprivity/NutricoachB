# Sistema de Alertas de Inactividad - NutriCoach

## Descripción General

El **Sistema de Alertas de Inactividad** detecta automáticamente cuando los usuarios dejan de interactuar con la plataforma y genera alertas motivacionales para mantener el engagement y la motivación.

## Características Principales

### Tipos de Alertas

El sistema detecta 5 tipos de inactividad:

1. **Hidratación** (`hydration_inactivity`)
   - Info: 1 día sin registros
   - Warning: 2 días sin registros
   - Critical: 3+ días sin registros

2. **Comidas** (`meal_inactivity`)
   - Info: 1 día sin registros
   - Warning: 3 días sin registros
   - Critical: 5+ días sin registros

3. **Ejercicio** (`exercise_inactivity`)
   - Info: 2 días sin registros
   - Warning: 5 días sin registros
   - Critical: 7+ días sin registros

4. **Actividad General** (`general_inactivity`)
   - Warning: 7 días sin actividad
   - Critical: 14+ días sin actividad

5. **Racha Rota** (`streak_broken`)
   - Info: Cuando se rompe una racha activa

### Niveles de Severidad

- **Info** (info): Recordatorio amigable
- **Warning** (warning): Atención necesaria
- **Critical** (critical): Riesgo de abandono

## Instalación y Configuración

### 1. Ejecutar Migración

```bash
php artisan migrate
```

Esto creará la tabla `inactivity_alerts` con todos los campos necesarios.

### 2. Configurar el Scheduler

El sistema ya está configurado en `routes/console.php`:

- **Detección diaria**: Todos los días a las 9:00 AM (hora de México)
- **Limpieza mensual**: Primer día de cada mes a las 2:00 AM

Para activar el scheduler, agrega esto a tu crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

O en Windows, usa el Task Scheduler con este comando:

```bash
php artisan schedule:run
```

### 3. Verificar Configuración

Verifica que el scheduler esté configurado correctamente:

```bash
php artisan schedule:list
```

## Uso

### Comando Artisan

#### Detectar inactividad para todos los usuarios

```bash
php artisan inactivity:detect
```

Esto escaneará todos los usuarios y generará alertas según los umbrales definidos.

#### Detectar inactividad para un usuario específico

```bash
php artisan inactivity:detect --user=1
```

#### Limpiar alertas antiguas resueltas

```bash
php artisan inactivity:detect --cleanup
```

Elimina alertas resueltas de hace más de 30 días.

### API Endpoints

Todos los endpoints requieren autenticación (`auth:sanctum`).

#### Obtener alertas del usuario

```http
GET /api/inactivity-alerts
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "summary": {
    "total": 5,
    "critical": 1,
    "warning": 2,
    "info": 2
  }
}
```

#### Obtener estadísticas

```http
GET /api/inactivity-alerts/stats
```

#### Obtener historial (incluyendo resueltas)

```http
GET /api/inactivity-alerts/history
```

#### Filtrar por tipo

```http
GET /api/inactivity-alerts/type/{type}
```

Tipos válidos:
- `hydration_inactivity`
- `meal_inactivity`
- `exercise_inactivity`
- `general_inactivity`
- `streak_broken`

#### Filtrar por severidad

```http
GET /api/inactivity-alerts/severity/{severity}
```

Severidades válidas: `info`, `warning`, `critical`

#### Resolver una alerta

```http
POST /api/inactivity-alerts/{id}/resolve
```

#### Resolver todas las alertas

```http
POST /api/inactivity-alerts/resolve-all
```

#### Resolver alertas por tipo

```http
POST /api/inactivity-alerts/resolve-type/{type}
```

#### Verificar inactividad manualmente

```http
POST /api/inactivity-alerts/check
```

## Componentes Frontend

### InactivityAlerts (Página completa)

Componente principal que muestra todas las alertas con detalles completos.

**Uso:**
```tsx
import InactivityAlerts from '@/components/inactivity-alerts';

function AlertsPage() {
  return <InactivityAlerts />;
}
```

### InactivityAlertsWidget (Widget para Dashboard)

Componente compacto que muestra las 3 alertas más importantes.

**Uso:**
```tsx
import InactivityAlertsWidget from '@/components/inactivity-alerts-widget';

function Dashboard() {
  return (
    <div className="grid gap-4">
      <InactivityAlertsWidget />
      {/* Otros widgets */}
    </div>
  );
}
```

## Arquitectura del Sistema

### Modelos

- **InactivityAlert**: Modelo principal de alertas
  - Métodos: `resolve()`, `isCritical()`, `isWarning()`, `isInfo()`
  - Scopes: `unresolved()`, `forUser()`, `bySeverity()`, `byType()`

- **User**: Relaciones agregadas
  - `inactivityAlerts()`: Todas las alertas
  - `unresolvedInactivityAlerts()`: Solo no resueltas

### Servicios

#### InactivityDetectionService

Servicio principal para detectar y gestionar alertas.

**Métodos principales:**

- `detectInactivityForAllUsers()`: Escanea todos los usuarios
- `detectInactivityForUser(User $user)`: Escanea un usuario específico
- `resolveAlertsForUser(User $user, string $type)`: Resuelve alertas por tipo
- `resolveAllAlertsForUser(User $user)`: Resuelve todas las alertas
- `cleanupOldAlerts()`: Limpia alertas antiguas

### Controladores

#### InactivityAlertController

Controlador API con todos los endpoints CRUD y filtros.

### Comandos

#### DetectUserInactivity

Comando artisan para ejecutar la detección de inactividad.

## Base de Datos

### Tabla: inactivity_alerts

```sql
- id (bigint, PK)
- user_id (bigint, FK → users.id)
- type (enum)
- severity (enum)
- days_inactive (int)
- last_activity_date (date)
- message (text)
- action_suggested (string)
- is_resolved (boolean)
- resolved_at (timestamp, nullable)
- metadata (json, nullable)
- created_at (timestamp)
- updated_at (timestamp)

Índices:
- [user_id, type, is_resolved]
- [user_id, severity]
- created_at
```

## Integración con Notificaciones

El comando `DetectUserInactivity` automáticamente crea notificaciones en el sistema de notificaciones existente para alertas de severidad **warning** y **critical**.

Las notificaciones incluyen:
- Título personalizado según el tipo de alerta
- Mensaje motivacional
- Icono específico (Droplet, Apple, Dumbbell, etc.)
- Color según severidad (blue, orange, red)
- Metadata con información de la alerta

## Personalización

### Ajustar Umbrales

Edita las constantes en `app/Services/InactivityDetectionService.php`:

```php
private const THRESHOLDS = [
    'hydration' => [
        'info' => 1,
        'warning' => 2,
        'critical' => 3,
    ],
    // ...
];
```

### Personalizar Mensajes

Edita las constantes en `app/Services/InactivityDetectionService.php`:

```php
private const MESSAGES = [
    'hydration_inactivity' => [
        'info' => 'Tu mensaje personalizado aquí',
        // ...
    ],
    // ...
];
```

### Cambiar Horario de Detección

Edita `routes/console.php`:

```php
Schedule::command('inactivity:detect')
    ->dailyAt('09:00')  // Cambiar hora aquí
    ->timezone('America/Mexico_City');  // Cambiar zona horaria aquí
```

## Resolución Automática

Las alertas se resuelven automáticamente cuando el usuario vuelve a estar activo. El sistema está integrado con `GamificationService`, que actualiza `user_stats.last_activity_date` cada vez que el usuario:

- Registra una comida
- Registra hidratación
- Completa un ejercicio

## Monitoreo y Logs

El sistema registra logs en:
- Detección de inactividad completada
- Estadísticas por tipo de alerta
- Errores durante la detección

Verifica los logs en `storage/logs/laravel.log`.

## Testing

### Probar manualmente

```bash
# Detectar para todos los usuarios
php artisan inactivity:detect

# Detectar para usuario específico (ID 1)
php artisan inactivity:detect --user=1

# Limpiar alertas antiguas
php artisan inactivity:detect --cleanup
```

### Verificar alertas en la base de datos

```sql
SELECT * FROM inactivity_alerts WHERE is_resolved = false;
```

## Mejoras Futuras

- [ ] Envío de emails/SMS para alertas críticas
- [ ] Dashboard administrativo para ver estadísticas globales
- [ ] Configuración de umbrales por usuario
- [ ] Machine learning para predecir abandono
- [ ] Integración con push notifications
- [ ] A/B testing de mensajes motivacionales
- [ ] Gamificación: recompensas por volver después de inactividad

## Soporte

Para más información o soporte, consulta la documentación de Laravel en [laravel.com/docs](https://laravel.com/docs).

---

**Autor**: Sistema generado con Claude Code
**Versión**: 1.0.0
**Fecha**: Noviembre 2025
