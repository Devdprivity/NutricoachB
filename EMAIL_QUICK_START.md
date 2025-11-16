# Email System - Quick Start Guide

## ✅ Sistema 100% Completado

Todos los emails están listos para usarse inmediatamente.

## Archivos Implementados

### Templates Blade (9)
```
resources/views/emails/
├── layout.blade.php              ✅ Layout base
├── welcome.blade.php             ✅ Bienvenida
├── account-deleted.blade.php     ✅ Cuenta eliminada
├── progress-update.blade.php     ✅ Progreso semanal
├── goal-achieved.blade.php       ✅ Objetivo alcanzado
├── payment-upcoming.blade.php    ✅ Próximo cargo
├── payment-failed.blade.php      ✅ Pago fallido
├── refund-processed.blade.php    ✅ Reembolso
├── new-follower.blade.php        ✅ Nuevo seguidor
└── platform-update.blade.php     ✅ Actualizaciones
```

### Mailables PHP (9)
```
app/Mail/
├── WelcomeMail.php              ✅ ACTUALIZADO
├── AccountDeletedMail.php       ✅ ACTUALIZADO
├── ProgressUpdateMail.php       ✅ ACTUALIZADO
├── GoalAchievedMail.php         ✅ ACTUALIZADO
├── PaymentUpcomingMail.php      ✅ ACTUALIZADO
├── PaymentFailedMail.php        ✅ ACTUALIZADO
├── RefundProcessedMail.php      ✅ ACTUALIZADO
├── NewFollowerMail.php          ✅ ACTUALIZADO
└── PlatformUpdateMail.php       ✅ ACTUALIZADO
```

## Configuración Rápida

### 1. Configurar SMTP en .env

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu-username
MAIL_PASSWORD=tu-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@nutricoach.com"
MAIL_FROM_NAME="NutriCoach"
```

### 2. Configurar Queue (Opcional pero recomendado)

```env
QUEUE_CONNECTION=database
```

```bash
php artisan queue:table
php artisan migrate
php artisan queue:work
```

## Uso Inmediato

### Email de Bienvenida
```php
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

// En tu RegisterController o similar
Mail::to($user->email)->send(new WelcomeMail($user));
```

### Email de Progreso Semanal
```php
use App\Mail\ProgressUpdateMail;

Mail::to($user->email)->send(new ProgressUpdateMail(
    user: $user,
    stats: [
        'days_active' => 5,
        'meals_logged' => 21,
        'exercises_completed' => 10
    ],
    achievements: [
        'Completaste 5 días activos',
        'Alcanzaste tu meta de hidratación'
    ],
    comparison: [
        'calories' => -5,
        'weight' => -0.5,
        'streak' => 14
    ],
    recommendations: [
        'Aumenta tu consumo de proteína',
        'Mantén tu racha de hidratación'
    ]
));
```

### Email de Objetivo Alcanzado
```php
use App\Mail\GoalAchievedMail;

Mail::to($user->email)->send(new GoalAchievedMail(
    user: $user,
    goal: [
        'title' => 'Perdiste 5 kg',
        'description' => 'Has alcanzado tu meta de peso'
    ],
    stats: [
        'days_to_achieve' => 30,
        'total_workouts' => 45,
        'weight_lost' => 5
    ],
    achievements: [
        'Mantuviste constancia 30 días',
        'Completaste 45 entrenamientos'
    ],
    reward: 'Badge "Guerrero de 30 días"'
));
```

### Email de Próximo Pago
```php
use App\Mail\PaymentUpcomingMail;

Mail::to($user->email)->send(new PaymentUpcomingMail(
    user: $user,
    subscription: [
        'plan_name' => 'Premium',
        'amount' => 299.00,
        'currency' => 'MXN',
        'next_billing_date' => '15/12/2025',
        'payment_method' => '•••• •••• •••• 4242',
        'features' => [
            'Acceso completo a planes',
            'Coaching personalizado',
            'Soporte prioritario'
        ]
    ]
));
```

### Email de Pago Fallido
```php
use App\Mail\PaymentFailedMail;

Mail::to($user->email)->send(new PaymentFailedMail(
    user: $user,
    subscription: [
        'plan_name' => 'Premium',
        'amount' => 299.00,
        'currency' => 'MXN'
    ],
    payment: [
        'attempt_date' => now()->format('d/m/Y'),
        'error_message' => 'Fondos insuficientes',
        'retry_days' => 3,
        'grace_period_end' => now()->addDays(7)->format('d/m/Y')
    ]
));
```

### Email de Reembolso
```php
use App\Mail\RefundProcessedMail;

Mail::to($user->email)->send(new RefundProcessedMail(
    user: $user,
    refund: [
        'transaction_id' => 'REF-12345',
        'amount' => 299.00,
        'currency' => 'MXN',
        'processed_date' => now()->format('d/m/Y'),
        'method' => 'Tarjeta original',
        'processing_days' => '5-10',
        'partial' => true,
        'reason' => 'Cancelación de suscripción'
    ]
));
```

### Email de Nuevo Seguidor
```php
use App\Mail\NewFollowerMail;

// Cuando alguien sigue a un usuario
Mail::to($userToFollow->email)->send(
    new NewFollowerMail($userToFollow, $currentUser)
);
```

### Email de Eliminación de Cuenta
```php
use App\Mail\AccountDeletedMail;

// Antes de eliminar al usuario, guarda datos necesarios
$email = $user->email;
$name = $user->name;

$userData = new User();
$userData->name = $name;
$userData->email = $email;

// Eliminar usuario
$user->delete();

// Enviar confirmación
Mail::to($email)->send(new AccountDeletedMail($userData));
```

### Email de Actualización de Plataforma
```php
use App\Mail\PlatformUpdateMail;

$updateData = [
    'title' => 'Nuevas funcionalidades en NutriCoach',
    'subtitle' => 'Mejoras en la experiencia',
    'summary' => 'Hemos implementado nuevas funcionalidades...',
    'features' => [
        [
            'icon' => '🎯',
            'title' => 'Sistema de objetivos mejorado',
            'description' => 'Trackea tu progreso en tiempo real'
        ]
    ],
    'improvements' => [
        'Tiempos de carga 40% más rápidos',
        'Sincronización automática'
    ],
    'version' => '2.1.0',
    'release_date' => now()->format('d/m/Y')
];

foreach ($users as $user) {
    Mail::to($user->email)->send(new PlatformUpdateMail($user, $updateData));
}
```

## Testing

### Test Manual con Tinker
```bash
php artisan tinker
```

```php
$user = User::first();

// Test bienvenida
Mail::to($user->email)->send(new \App\Mail\WelcomeMail($user));

// Test progreso
Mail::to($user->email)->send(new \App\Mail\ProgressUpdateMail(
    $user,
    ['days_active' => 5, 'meals_logged' => 21, 'exercises_completed' => 10]
));
```

### Preview Email en Navegador
```bash
php artisan make:command PreviewEmail
```

```php
// En el comando
use App\Mail\WelcomeMail;

public function handle()
{
    $user = User::first();
    $mailable = new WelcomeMail($user);

    file_put_contents(
        storage_path('app/email-preview.html'),
        $mailable->render()
    );

    $this->info('Email guardado en storage/app/email-preview.html');
}
```

```bash
php artisan preview:email
# Abre: storage/app/email-preview.html en el navegador
```

## Integración Automática (Opcional)

Si deseas que los emails se envíen automáticamente en eventos:

### 1. Crear Eventos
```bash
php artisan make:event UserRegistered
php artisan make:event UserDeleted
php artisan make:event UserFollowed
```

### 2. Crear Listeners
```bash
php artisan make:listener SendWelcomeEmail --event=UserRegistered
php artisan make:listener SendAccountDeletedEmail --event=UserDeleted
php artisan make:listener SendNewFollowerEmail --event=UserFollowed
```

### 3. Registrar en EventServiceProvider
```php
protected $listen = [
    \App\Events\UserRegistered::class => [
        \App\Listeners\SendWelcomeEmail::class,
    ],
    // ... más eventos
];
```

### 4. Disparar Eventos
```php
use App\Events\UserRegistered;

// En tu controlador
event(new UserRegistered($user));
```

## Servicios de Email Recomendados

### Desarrollo
- **Mailtrap** - Testing de emails (gratis)
- **MailHog** - Local email testing

### Producción
- **SendGrid** - Hasta 100 emails/día gratis
- **Amazon SES** - $0.10 por 1000 emails
- **Mailgun** - 5000 emails/mes gratis
- **Postmark** - Excelente deliverability

## Troubleshooting

### Email no se envía
```bash
# Verifica configuración
php artisan config:clear

# Verifica logs
tail -f storage/logs/laravel.log

# Test de conexión SMTP
php artisan tinker
Mail::raw('Test', function($msg) { $msg->to('test@example.com')->subject('Test'); });
```

### Queue no procesa
```bash
# Asegúrate que el worker esté corriendo
php artisan queue:work

# Verifica jobs fallidos
php artisan queue:failed

# Reintentar jobs fallidos
php artisan queue:retry all
```

## Próximos Pasos

1. ✅ Configurar SMTP en `.env`
2. ✅ Probar emails con Tinker
3. ✅ Integrar en controladores
4. ⚠️  Opcional: Configurar eventos/listeners
5. ⚠️  Opcional: Configurar queue worker
6. ⚠️  Opcional: Configurar rate limiting

## Documentación Completa

Ver `EMAIL_SYSTEM_DOCUMENTATION.md` para:
- Código completo de eventos y listeners
- Ejemplos avanzados
- Configuración de producción
- Best practices
- Troubleshooting detallado

---

**¡Sistema listo para producción!** 🚀
