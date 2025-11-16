# Ejemplo de Integración del Sistema de Alertas de Inactividad

## Integración en el Dashboard

### 1. Agregar el Widget al Dashboard

Edita tu página de dashboard (ejemplo: `resources/js/pages/dashboard.tsx`):

```tsx
import InactivityAlertsWidget from '@/components/inactivity-alerts-widget';

export default function Dashboard() {
    return (
        <div className="container mx-auto py-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Widget de Alertas de Inactividad */}
                <div className="lg:col-span-1">
                    <InactivityAlertsWidget />
                </div>

                {/* Otros widgets del dashboard */}
                <div className="lg:col-span-2">
                    {/* Tu contenido existente */}
                </div>
            </div>
        </div>
    );
}
```

### 2. Crear Página Dedicada de Alertas

Crea una nueva página en `resources/js/pages/alerts.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import AppShell from '@/components/app-shell';
import InactivityAlerts from '@/components/inactivity-alerts';

export default function AlertsPage() {
    return (
        <AppShell>
            <Head title="Alertas de Actividad" />

            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">
                        Alertas de Actividad
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Mantente al día con tus hábitos saludables
                    </p>

                    <InactivityAlerts />
                </div>
            </div>
        </AppShell>
    );
}
```

### 3. Agregar Ruta en Laravel

Edita `routes/web.php`:

```php
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    // ... tus rutas existentes

    Route::get('/alerts', function () {
        return Inertia::render('alerts');
    })->name('alerts');
});
```

### 4. Agregar Enlace en el Sidebar

Edita tu componente de sidebar (ejemplo: `resources/js/components/app-sidebar.tsx`):

```tsx
const navigation = [
    // ... tus enlaces existentes
    {
        name: 'Alertas',
        href: '/alerts',
        icon: 'AlertTriangle',
        badge: unresolvedAlertsCount, // Opcional: mostrar contador
    },
];
```

### 5. Mostrar Badge de Alertas en el Header

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export function AppHeader() {
    const [alertsCount, setAlertsCount] = useState(0);

    useEffect(() => {
        fetchAlertsCount();
    }, []);

    const fetchAlertsCount = async () => {
        try {
            const response = await axios.get('/api/inactivity-alerts/stats');
            setAlertsCount(response.data.data.unresolved_alerts);
        } catch (error) {
            console.error('Error fetching alerts count:', error);
        }
    };

    return (
        <header>
            {/* Tu header existente */}
            {alertsCount > 0 && (
                <Link href="/alerts">
                    <Button variant="ghost" className="relative">
                        <Icon name="AlertTriangle" />
                        <Badge className="absolute -top-1 -right-1">
                            {alertsCount}
                        </Badge>
                    </Button>
                </Link>
            )}
        </header>
    );
}
```

## Integración con Servicios Existentes

### Auto-Resolver Alertas al Registrar Actividad

El sistema ya está integrado con `GamificationService`. Cada vez que el usuario registra actividad, las alertas se resuelven automáticamente.

Si deseas resolver alertas manualmente en otros servicios:

```php
use App\Services\InactivityDetectionService;

class HydrationController extends Controller
{
    public function store(Request $request, InactivityDetectionService $inactivityService)
    {
        // ... tu código existente para registrar hidratación

        // Resolver alertas de hidratación automáticamente
        $inactivityService->resolveAlertsForUser(
            $request->user(),
            InactivityAlert::TYPE_HYDRATION
        );

        return response()->json([...]);
    }
}
```

## Notificaciones Push (Opcional)

Si deseas enviar notificaciones push cuando se detecta inactividad:

```php
// En DetectUserInactivity.php, método createNotifications()

use Illuminate\Support\Facades\Notification;
use App\Notifications\InactivityAlertNotification;

private function createNotifications(array $alerts, \App\Models\User $user): void
{
    foreach ($alerts as $alert) {
        if (in_array($alert['severity'], ['warning', 'critical'])) {
            // Notificación en la base de datos (ya implementado)
            $this->notificationService->create(...);

            // Notificación push (nuevo)
            $user->notify(new InactivityAlertNotification($alert));
        }
    }
}
```

## Testing

### Test Manual

```bash
# 1. Ejecutar migración
php artisan migrate

# 2. Crear algunos registros de prueba en la base de datos
# 3. Ejecutar detección
php artisan inactivity:detect --user=1

# 4. Verificar alertas en el navegador
# Visita: http://localhost/alerts
```

### Test Automatizado

Crea un test en `tests/Feature/InactivityAlertTest.php`:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\InactivityAlert;
use App\Services\InactivityDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InactivityAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_their_alerts()
    {
        $user = User::factory()->create();

        InactivityAlert::create([
            'user_id' => $user->id,
            'type' => InactivityAlert::TYPE_HYDRATION,
            'severity' => InactivityAlert::SEVERITY_WARNING,
            'days_inactive' => 2,
            'last_activity_date' => now()->subDays(2),
            'message' => 'Test alert',
            'action_suggested' => 'Drink water',
        ]);

        $response = $this->actingAs($user)->get('/api/inactivity-alerts');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.type', InactivityAlert::TYPE_HYDRATION);
    }

    public function test_user_can_resolve_alert()
    {
        $user = User::factory()->create();

        $alert = InactivityAlert::create([
            'user_id' => $user->id,
            'type' => InactivityAlert::TYPE_MEAL,
            'severity' => InactivityAlert::SEVERITY_INFO,
            'days_inactive' => 1,
            'last_activity_date' => now()->subDay(),
            'message' => 'Test alert',
            'action_suggested' => 'Log a meal',
        ]);

        $response = $this->actingAs($user)
                        ->post("/api/inactivity-alerts/{$alert->id}/resolve");

        $response->assertStatus(200);

        $this->assertTrue($alert->fresh()->is_resolved);
        $this->assertNotNull($alert->fresh()->resolved_at);
    }
}
```

Ejecutar tests:

```bash
php artisan test --filter InactivityAlertTest
```

## Personalización Avanzada

### Cambiar Mensajes por Usuario (Ejemplo)

```php
// En InactivityDetectionService.php

private function getPersonalizedMessage(User $user, string $type, string $severity): string
{
    $userName = $user->name;

    if ($type === 'hydration_inactivity' && $severity === 'critical') {
        return "¡{$userName}! Tu cuerpo necesita agua. ¿Qué tal un vaso ahora?";
    }

    // Fallback a mensajes por defecto
    return self::MESSAGES[$type][$severity];
}
```

### Enviar Email para Alertas Críticas

```php
// En DetectUserInactivity.php

use Illuminate\Support\Facades\Mail;
use App\Mail\CriticalInactivityAlert;

private function createNotifications(array $alerts, \App\Models\User $user): void
{
    foreach ($alerts as $alert) {
        // Crear notificación
        $this->notificationService->create(...);

        // Enviar email para alertas críticas
        if ($alert['severity'] === 'critical') {
            Mail::to($user->email)->send(new CriticalInactivityAlert($alert));
        }
    }
}
```

## Monitoreo en Producción

### Verificar que el Scheduler está funcionando

```bash
# Ver comandos programados
php artisan schedule:list

# Ejecutar manualmente (para testing)
php artisan schedule:run
```

### Ver logs de detección

```bash
tail -f storage/logs/laravel.log | grep "Detección de inactividad"
```

### Estadísticas de alertas

```sql
-- Ver resumen de alertas por tipo
SELECT
    type,
    severity,
    COUNT(*) as total,
    AVG(days_inactive) as avg_days
FROM inactivity_alerts
WHERE is_resolved = false
GROUP BY type, severity
ORDER BY severity DESC, total DESC;
```

---

¡Listo! El sistema está completamente integrado y funcionando.
