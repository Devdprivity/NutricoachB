<?php

namespace App\Console\Commands;

use App\Services\InactivityDetectionService;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class DetectUserInactivity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inactivity:detect
                            {--user= : ID del usuario específico para detectar inactividad}
                            {--cleanup : Limpiar alertas antiguas resueltas}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Detecta inactividad de usuarios y genera alertas motivacionales para mantener el engagement';

    private InactivityDetectionService $inactivityService;
    private NotificationService $notificationService;

    /**
     * Crear instancia del comando
     */
    public function __construct(
        InactivityDetectionService $inactivityService,
        NotificationService $notificationService
    ) {
        parent::__construct();
        $this->inactivityService = $inactivityService;
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Iniciando detección de inactividad de usuarios...');

        // Opción de limpieza
        if ($this->option('cleanup')) {
            return $this->cleanupOldAlerts();
        }

        // Detectar para usuario específico
        if ($userId = $this->option('user')) {
            return $this->detectForSpecificUser((int) $userId);
        }

        // Detectar para todos los usuarios
        return $this->detectForAllUsers();
    }

    /**
     * Detectar inactividad para un usuario específico
     */
    private function detectForSpecificUser(int $userId): int
    {
        $this->info("Detectando inactividad para usuario ID: {$userId}");

        $user = \App\Models\User::find($userId);

        if (!$user) {
            $this->error("Usuario con ID {$userId} no encontrado.");
            return Command::FAILURE;
        }

        $alerts = $this->inactivityService->detectInactivityForUser($user);

        if (empty($alerts)) {
            $this->info('✅ No se detectó inactividad para este usuario.');
            return Command::SUCCESS;
        }

        $this->displayAlerts($alerts);
        $this->createNotifications($alerts, $user);

        return Command::SUCCESS;
    }

    /**
     * Detectar inactividad para todos los usuarios
     */
    private function detectForAllUsers(): int
    {
        $this->info('Escaneando todos los usuarios...');

        $stats = $this->inactivityService->detectInactivityForAllUsers();

        $this->newLine();
        $this->info('📊 Resultados de la detección:');
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Usuarios verificados', $stats['users_checked']],
                ['Alertas creadas', $stats['alerts_created']],
            ]
        );

        if (!empty($stats['alerts_by_type'])) {
            $this->newLine();
            $this->info('📋 Alertas por tipo:');
            $alertsTable = [];
            foreach ($stats['alerts_by_type'] as $type => $count) {
                $alertsTable[] = [$this->formatAlertType($type), $count];
            }
            $this->table(['Tipo', 'Cantidad'], $alertsTable);
        }

        $this->newLine();
        $this->info('✅ Detección completada exitosamente.');

        return Command::SUCCESS;
    }

    /**
     * Limpiar alertas antiguas resueltas
     */
    private function cleanupOldAlerts(): int
    {
        $this->info('🧹 Limpiando alertas antiguas resueltas...');

        $deleted = $this->inactivityService->cleanupOldAlerts();

        $this->info("✅ Se eliminaron {$deleted} alertas antiguas.");

        return Command::SUCCESS;
    }

    /**
     * Mostrar alertas en consola
     */
    private function displayAlerts(array $alerts): void
    {
        $this->newLine();
        $this->warn("⚠️  Se detectaron {count($alerts)} alertas de inactividad:");

        $table = [];
        foreach ($alerts as $alert) {
            $table[] = [
                $this->formatAlertType($alert['type']),
                $this->formatSeverity($alert['severity']),
                $alert['days_inactive'] . ' días',
                substr($alert['message'], 0, 50) . '...',
            ];
        }

        $this->table(
            ['Tipo', 'Severidad', 'Días Inactivo', 'Mensaje'],
            $table
        );
    }

    /**
     * Crear notificaciones para las alertas
     */
    private function createNotifications(array $alerts, \App\Models\User $user): void
    {
        foreach ($alerts as $alert) {
            // Crear notificación solo para alertas warning y critical
            if (in_array($alert['severity'], ['warning', 'critical'])) {
                $this->notificationService->create(
                    userId: $user->id,
                    type: 'inactivity',
                    title: $this->getNotificationTitle($alert['type'], $alert['severity']),
                    message: $alert['message'],
                    icon: $this->getNotificationIcon($alert['type']),
                    color: $this->getNotificationColor($alert['severity']),
                    metadata: [
                        'alert_type' => $alert['type'],
                        'severity' => $alert['severity'],
                        'days_inactive' => $alert['days_inactive'],
                        'action_suggested' => $alert['action_suggested'],
                    ]
                );
            }
        }

        $this->info('📬 Notificaciones creadas para el usuario.');
    }

    /**
     * Formatear tipo de alerta para visualización
     */
    private function formatAlertType(string $type): string
    {
        return match ($type) {
            'hydration_inactivity' => '💧 Hidratación',
            'meal_inactivity' => '🍎 Comidas',
            'exercise_inactivity' => '💪 Ejercicio',
            'general_inactivity' => '📊 General',
            'streak_broken' => '🔥 Racha Rota',
            default => $type,
        };
    }

    /**
     * Formatear severidad para visualización
     */
    private function formatSeverity(string $severity): string
    {
        return match ($severity) {
            'info' => '<fg=blue>ℹ️  Info</>',
            'warning' => '<fg=yellow>⚠️  Warning</>',
            'critical' => '<fg=red>🚨 Critical</>',
            default => $severity,
        };
    }

    /**
     * Obtener título de notificación
     */
    private function getNotificationTitle(string $type, string $severity): string
    {
        $severityText = $severity === 'critical' ? '¡Urgente!' : 'Recordatorio';

        return match ($type) {
            'hydration_inactivity' => "{$severityText}: Hidratación",
            'meal_inactivity' => "{$severityText}: Registro de Comidas",
            'exercise_inactivity' => "{$severityText}: Actividad Física",
            'general_inactivity' => "{$severityText}: Te Extrañamos",
            'streak_broken' => "Racha Interrumpida",
            default => $severityText,
        };
    }

    /**
     * Obtener icono de notificación
     */
    private function getNotificationIcon(string $type): string
    {
        return match ($type) {
            'hydration_inactivity' => 'Droplet',
            'meal_inactivity' => 'Apple',
            'exercise_inactivity' => 'Dumbbell',
            'general_inactivity' => 'TrendingUp',
            'streak_broken' => 'Flame',
            default => 'Bell',
        };
    }

    /**
     * Obtener color de notificación
     */
    private function getNotificationColor(string $severity): string
    {
        return match ($severity) {
            'info' => 'blue',
            'warning' => 'orange',
            'critical' => 'red',
            default => 'gray',
        };
    }
}

