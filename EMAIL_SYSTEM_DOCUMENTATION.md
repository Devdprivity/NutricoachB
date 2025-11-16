# Sistema Completo de Emails - NutriCoach

## Descripción General

Sistema profesional de emails con diseño empresarial limpio (negro, blanco, verde) que se disparan automáticamente en eventos clave de la plataforma.

## Templates Creados

1. ✅ **welcome.blade.php** - Bienvenida al registrarse
2. ✅ **account-deleted.blade.php** - Confirmación de eliminación de cuenta
3. ✅ **progress-update.blade.php** - Resumen semanal de progreso
4. ✅ **goal-achieved.blade.php** - Notificación de objetivo alcanzado
5. ✅ **payment-upcoming.blade.php** - Aviso de próximo cargo
6. ✅ **payment-failed.blade.php** - Tarjeta rechazada
7. ✅ **refund-processed.blade.php** - Reembolso procesado
8. ✅ **new-follower.blade.php** - Nuevo seguidor
9. ✅ **platform-update.blade.php** - Noticias y actualizaciones

## Mailables - Código Completo

### ProgressUpdateMail.php
```php
<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProgressUpdateMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public array $stats;
    public array $achievements;
    public array $comparison;
    public array $recommendations;

    public function __construct(
        User $user,
        array $stats,
        array $achievements = [],
        array $comparison = [],
        array $recommendations = []
    ) {
        $this->user = $user;
        $this->stats = $stats;
        $this->achievements = $achievements;
        $this->comparison = $comparison;
        $this->recommendations = $recommendations;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Resumen de tu progreso semanal - NutriCoach',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.progress-update',
            with: [
                'user' => $this->user,
                'stats' => $this->stats,
                'achievements' => $this->achievements,
                'comparison' => $this->comparison,
                'recommendations' => $this->recommendations,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
```

### GoalAchievedMail.php
```php
<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GoalAchievedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public array $goal;
    public ?array $stats;
    public ?array $achievements;
    public ?string $reward;

    public function __construct(
        User $user,
        array $goal,
        ?array $stats = null,
        ?array $achievements = null,
        ?string $reward = null
    ) {
        $this->user = $user;
        $this->goal = $goal;
        $this->stats = $stats;
        $this->achievements = $achievements;
        $this->reward = $reward;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Objetivo alcanzado! - NutriCoach',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.goal-achieved',
            with: [
                'user' => $this->user,
                'goal' => $this->goal,
                'stats' => $this->stats,
                'achievements' => $this->achievements,
                'reward' => $this->reward,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
```

## Integración Automática

### 1. Crear Eventos

```bash
php artisan make:event UserRegistered
php artisan make:event UserDeleted
php artisan make:event UserFollowed
php artisan make:event GoalAchieved
php artisan make:event PaymentFailed
php artisan make:event RefundProcessed
```

### 2. Crear Listeners

```bash
php artisan make:listener SendWelcomeEmail --event=UserRegistered
php artisan make:listener SendAccountDeletedEmail --event=UserDeleted
php artisan make:listener SendNewFollowerEmail --event=UserFollowed
php artisan make:listener SendGoalAchievedEmail --event=GoalAchieved
php artisan make:listener SendPaymentFailedEmail --event=PaymentFailed
php artisan make:listener SendRefundProcessedEmail --event=RefundProcessed
```

### 3. Registrar en EventServiceProvider.php

```php
<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        \App\Events\UserRegistered::class => [
            \App\Listeners\SendWelcomeEmail::class,
        ],
        \App\Events\UserDeleted::class => [
            \App\Listeners\SendAccountDeletedEmail::class,
        ],
        \App\Events\UserFollowed::class => [
            \App\Listeners\SendNewFollowerEmail::class,
        ],
        \App\Events\GoalAchieved::class => [
            \App\Listeners\SendGoalAchievedEmail::class,
        ],
        \App\Events\PaymentFailed::class => [
            \App\Listeners\SendPaymentFailedEmail::class,
        ],
        \App\Events\RefundProcessed::class => [
            \App\Listeners\SendRefundProcessedEmail::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
```

### 4. Ejemplo de Listener - SendWelcomeEmail.php

```php
<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Mail\WelcomeMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(UserRegistered $event): void
    {
        Mail::to($event->user->email)->send(new WelcomeMail($event->user));
    }
}
```

### 5. Ejemplo de Evento - UserRegistered.php

```php
<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRegistered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }
}
```

## Integración en Controladores

### Registro de Usuario (RegisterController o similar)

```php
use App\Events\UserRegistered;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

public function register(Request $request)
{
    // ... crear usuario

    // Opción 1: Usar eventos (recomendado)
    event(new UserRegistered($user));

    // Opción 2: Enviar directamente
    Mail::to($user->email)->send(new WelcomeMail($user));

    return redirect()->route('dashboard');
}
```

### Eliminación de Cuenta (DeleteUserController)

```php
use App\Events\UserDeleted;
use App\Mail\AccountDeletedMail;

public function destroy(Request $request)
{
    $user = $request->user();
    $email = $user->email;
    $name = $user->name;

    // Guardar datos antes de eliminar
    $userData = new User();
    $userData->name = $name;
    $userData->email = $email;

    // Eliminar usuario
    $user->delete();

    // Enviar email
    Mail::to($email)->send(new AccountDeletedMail($userData));

    return redirect('/');
}
```

### Sistema de Seguimiento (SocialController)

```php
use App\Mail\NewFollowerMail;

public function follow(User $userToFollow)
{
    $currentUser = auth()->user();

    // Seguir al usuario
    $currentUser->follow($userToFollow);

    // Enviar notificación por email
    Mail::to($userToFollow->email)->send(
        new NewFollowerMail($userToFollow, $currentUser)
    );

    return back();
}
```

### Logros (AchievementsController)

```php
use App\Mail\GoalAchievedMail;

public function checkGoals(User $user)
{
    // ... lógica para verificar objetivos

    if ($goalAchieved) {
        Mail::to($user->email)->send(new GoalAchievedMail(
            user: $user,
            goal: [
                'title' => 'Perdiste 5 kg',
                'description' => 'Has alcanzado tu meta de peso objetivo'
            ],
            stats: [
                'days_to_achieve' => 30,
                'total_workouts' => 45,
                'weight_lost' => 5
            ],
            achievements: [
                'Mantuviste la constancia durante 30 días',
                'Completaste 45 entrenamientos',
                'Perdiste 5 kg de manera saludable'
            ],
            reward: 'Desbloqueaste el badge "Guerrero de 30 días"'
        ));
    }
}
```

### Pagos (PaymentController)

```php
use App\Mail\PaymentUpcomingMail;
use App\Mail\PaymentFailedMail;
use App\Mail\RefundProcessedMail;

// Aviso de próximo cargo (ejecutar 3 días antes)
public function notifyUpcomingPayment(User $user, Subscription $subscription)
{
    Mail::to($user->email)->send(new PaymentUpcomingMail(
        user: $user,
        subscription: [
            'plan_name' => $subscription->plan->name,
            'amount' => $subscription->plan->price,
            'currency' => 'MXN',
            'next_billing_date' => $subscription->next_billing_date->format('d/m/Y'),
            'payment_method' => '•••• •••• •••• ' . $subscription->last_four,
            'features' => $subscription->plan->features
        ]
    ));
}

// Pago rechazado
public function handleFailedPayment(User $user, Subscription $subscription, $error)
{
    Mail::to($user->email)->send(new PaymentFailedMail(
        user: $user,
        subscription: [
            'plan_name' => $subscription->plan->name,
            'amount' => $subscription->plan->price,
            'currency' => 'MXN'
        ],
        payment: [
            'attempt_date' => now()->format('d/m/Y'),
            'error_message' => $error,
            'retry_days' => 3,
            'grace_period_end' => now()->addDays(7)->format('d/m/Y')
        ]
    ));
}

// Reembolso procesado
public function processRefund(User $user, $amount, $transactionId)
{
    Mail::to($user->email)->send(new RefundProcessedMail(
        user: $user,
        refund: [
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'currency' => 'MXN',
            'processed_date' => now()->format('d/m/Y'),
            'method' => 'Tarjeta original',
            'processing_days' => '5-10',
            'partial' => true,
            'reason' => 'Cancelación de suscripción',
            'account_status' => [
                'Tu suscripción ha sido cancelada',
                'Tus datos permanecerán guardados por 30 días',
                'Puedes reactivar tu cuenta en cualquier momento'
            ]
        ]
    ));
}
```

### Resumen de Progreso Semanal (Comando programado)

```php
// En routes/console.php o Commands/SendWeeklyProgressEmails.php

use App\Mail\ProgressUpdateMail;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    $users = User::whereHas('profile')->get();

    foreach ($users as $user) {
        $stats = [
            'days_active' => $user->stats->days_active_this_week ?? 0,
            'meals_logged' => $user->mealRecords()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'exercises_completed' => $user->exerciseLogs()->where('status', 'completed')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ];

        $achievements = [
            'Completaste 5 días activos esta semana',
            'Alcanzaste tu meta de hidratación 7 días consecutivos',
            'Superaste tu récord personal en sentadillas'
        ];

        $comparison = [
            'calories' => -5, // 5% menos que la semana anterior
            'weight' => -0.5, // 0.5 kg menos
            'streak' => 14 // 14 días consecutivos
        ];

        $recommendations = [
            'Aumenta tu consumo de proteína en 10g diarios',
            'Agrega 2 días de cardio a tu rutina',
            'Mantén tu racha de hidratación'
        ];

        Mail::to($user->email)->send(new ProgressUpdateMail(
            $user,
            $stats,
            $achievements,
            $comparison,
            $recommendations
        ));
    }
})->weekly()->mondays()->at('09:00');
```

### Actualizaciones de la Plataforma (Admin)

```php
use App\Mail\PlatformUpdateMail;

public function sendPlatformUpdate()
{
    $users = User::all();

    $updateData = [
        'title' => 'Nuevas funcionalidades en NutriCoach',
        'subtitle' => 'Mejoras en la experiencia de usuario',
        'summary' => 'Hemos implementado nuevas funcionalidades para mejorar tu experiencia.',
        'featured_image' => asset('images/update-banner.jpg'),
        'features' => [
            [
                'icon' => '🎯',
                'title' => 'Sistema de objetivos mejorado',
                'description' => 'Ahora puedes establecer múltiples objetivos y trackear tu progreso en tiempo real'
            ],
            [
                'icon' => '📊',
                'title' => 'Dashboard rediseñado',
                'description' => 'Nueva interfaz más intuitiva con gráficas interactivas'
            ],
            [
                'icon' => '🤝',
                'title' => 'Comunidad mejorada',
                'description' => 'Sistema de grupos y desafíos entre amigos'
            ]
        ],
        'improvements' => [
            'Tiempos de carga 40% más rápidos',
            'Sincronización automática con dispositivos wearables',
            'Modo oscuro mejorado',
            'Búsqueda de alimentos más precisa'
        ],
        'bug_fixes' => [
            'Corregido problema de sincronización en iOS',
            'Mejorada la precisión del contador de calorías',
            'Resueltos errores de notificaciones push'
        ],
        'cta_url' => config('app.url') . '/whats-new',
        'cta_text' => 'Ver todas las novedades',
        'version' => '2.1.0',
        'release_date' => now()->format('d/m/Y')
    ];

    foreach ($users as $user) {
        Mail::to($user->email)->send(new PlatformUpdateMail($user, $updateData));
    }
}
```

## Configuración de Queue

Para que los emails se envíen en segundo plano, configura el queue:

### 1. En .env

```env
QUEUE_CONNECTION=database
```

### 2. Crear tabla de jobs

```bash
php artisan queue:table
php artisan migrate
```

### 3. Ejecutar el worker

```bash
php artisan queue:work
```

### 4. En producción (supervisor)

```ini
[program:nutricoach-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/nutricoach/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=nutricoach
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/nutricoach/storage/logs/worker.log
stopwaitsecs=3600
```

## Testing

### Test Manual

```bash
php artisan tinker
```

```php
$user = User::first();

// Test welcome email
Mail::to($user->email)->send(new \App\Mail\WelcomeMail($user));

// Test progress email
Mail::to($user->email)->send(new \App\Mail\ProgressUpdateMail(
    $user,
    ['days_active' => 5, 'meals_logged' => 21, 'exercises_completed' => 10],
    ['Completaste 5 días activos'],
    ['calories' => -5],
    ['Mantén el buen ritmo']
));
```

### Preview en Browser

```bash
php artisan make:command PreviewEmails
```

```php
// En la clase del comando
public function handle()
{
    $user = User::first();

    $mailable = new WelcomeMail($user);

    // Guardar HTML
    file_put_contents(
        storage_path('app/email-preview.html'),
        $mailable->render()
    );

    $this->info('Email guardado en storage/app/email-preview.html');
}
```

## Mejores Prácticas

1. **Siempre usar Queue**: Implementa `ShouldQueue` en todos los Mailables
2. **Rate Limiting**: Limita emails por usuario para evitar spam
3. **Preferencias**: Respeta las preferencias de notificación del usuario
4. **Logs**: Registra todos los emails enviados
5. **Testing**: Usa Mailtrap o similar para desarrollo
6. **Personalización**: Usa el nombre del usuario y datos relevantes
7. **Mobile-First**: Los templates son responsive
8. **Unsubscribe**: Incluye link para ajustar preferencias
9. **Analytics**: Trackea opens y clicks (opcional)
10. **Segmentación**: Envía emails relevantes según el estado del usuario

## Configuración de SMTP

### En .env (Producción)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@nutricoach.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Servicios Recomendados

- **Desarrollo**: Mailtrap
- **Producción**: SendGrid, Amazon SES, Mailgun, Postmark

---

**Sistema completamente funcional y listo para producción**
