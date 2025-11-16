import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import axios from 'axios';

interface InactivityAlert {
    id: number;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    days_inactive: number;
    last_activity_date: string;
    message: string;
    action_suggested: string;
    is_resolved: boolean;
    created_at: string;
    metadata?: Record<string, any>;
}

interface AlertSummary {
    total: number;
    critical: number;
    warning: number;
    info: number;
}

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'hydration_inactivity':
            return 'Droplet';
        case 'meal_inactivity':
            return 'Apple';
        case 'exercise_inactivity':
            return 'Dumbbell';
        case 'general_inactivity':
            return 'TrendingUp';
        case 'streak_broken':
            return 'Flame';
        default:
            return 'Bell';
    }
};

const getAlertColor = (severity: string) => {
    switch (severity) {
        case 'critical':
            return 'destructive';
        case 'warning':
            return 'default';
        case 'info':
            return 'secondary';
        default:
            return 'secondary';
    }
};

const getAlertVariant = (severity: string) => {
    switch (severity) {
        case 'critical':
            return 'destructive';
        default:
            return 'default';
    }
};

const formatAlertType = (type: string) => {
    switch (type) {
        case 'hydration_inactivity':
            return 'Hidratación';
        case 'meal_inactivity':
            return 'Comidas';
        case 'exercise_inactivity':
            return 'Ejercicio';
        case 'general_inactivity':
            return 'Actividad General';
        case 'streak_broken':
            return 'Racha Rota';
        default:
            return type;
    }
};

export function InactivityAlerts() {
    const [alerts, setAlerts] = useState<InactivityAlert[]>([]);
    const [summary, setSummary] = useState<AlertSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState<number | null>(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/inactivity-alerts');
            setAlerts(response.data.data);
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error fetching inactivity alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async (alertId: number) => {
        try {
            setResolving(alertId);
            await axios.post(`/api/inactivity-alerts/${alertId}/resolve`);

            // Actualizar el estado local
            setAlerts(alerts.filter(alert => alert.id !== alertId));

            // Actualizar el resumen
            if (summary) {
                const alert = alerts.find(a => a.id === alertId);
                if (alert) {
                    setSummary({
                        ...summary,
                        total: summary.total - 1,
                        [alert.severity]: summary[alert.severity] - 1,
                    });
                }
            }
        } catch (error) {
            console.error('Error resolving alert:', error);
        } finally {
            setResolving(null);
        }
    };

    const handleResolveAll = async () => {
        try {
            setLoading(true);
            await axios.post('/api/inactivity-alerts/resolve-all');
            setAlerts([]);
            setSummary({ total: 0, critical: 0, warning: 0, info: 0 });
        } catch (error) {
            console.error('Error resolving all alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alertas de Actividad</CardTitle>
                    <CardDescription>
                        No tienes alertas de inactividad en este momento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Icon name="CheckCircle" className="h-16 w-16 text-green-500 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                            ¡Excelente trabajo! Estás manteniendo una actividad constante.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Alertas de Actividad</CardTitle>
                    <CardDescription>
                        Tienes {summary?.total || 0} alerta{summary?.total !== 1 ? 's' : ''} pendiente{summary?.total !== 1 ? 's' : ''}
                    </CardDescription>
                </div>
                {alerts.length > 1 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResolveAll}
                        disabled={loading}
                    >
                        Resolver todas
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Resumen de alertas */}
                {summary && (summary.critical > 0 || summary.warning > 0) && (
                    <div className="flex gap-2 mb-4">
                        {summary.critical > 0 && (
                            <Badge variant="destructive">
                                {summary.critical} Crítica{summary.critical !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {summary.warning > 0 && (
                            <Badge variant="default">
                                {summary.warning} Advertencia{summary.warning !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {summary.info > 0 && (
                            <Badge variant="secondary">
                                {summary.info} Info
                            </Badge>
                        )}
                    </div>
                )}

                {/* Lista de alertas */}
                {alerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        variant={getAlertVariant(alert.severity)}
                        className="relative"
                    >
                        <Icon name={getAlertIcon(alert.type)} />
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <AlertTitle className="flex items-center gap-2">
                                        {formatAlertType(alert.type)}
                                        <Badge variant={getAlertColor(alert.severity)} className="text-xs">
                                            {alert.severity === 'critical' && 'Crítica'}
                                            {alert.severity === 'warning' && 'Advertencia'}
                                            {alert.severity === 'info' && 'Info'}
                                        </Badge>
                                    </AlertTitle>
                                    <AlertDescription>
                                        <p className="mt-1">{alert.message}</p>
                                        <p className="mt-2 text-xs">
                                            <strong>Acción sugerida:</strong> {alert.action_suggested}
                                        </p>
                                        <p className="mt-1 text-xs opacity-70">
                                            Hace {alert.days_inactive} día{alert.days_inactive !== 1 ? 's' : ''} sin actividad
                                        </p>
                                    </AlertDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleResolveAlert(alert.id)}
                                    disabled={resolving === alert.id}
                                    className="shrink-0"
                                >
                                    {resolving === alert.id ? (
                                        <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Icon name="X" className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
}

export default InactivityAlerts;
