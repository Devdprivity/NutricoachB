import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import { Link } from '@inertiajs/react';
import axios from 'axios';

interface InactivityAlert {
    id: number;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    days_inactive: number;
    message: string;
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

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'critical':
            return 'text-red-500';
        case 'warning':
            return 'text-orange-500';
        case 'info':
            return 'text-blue-500';
        default:
            return 'text-gray-500';
    }
};

export function InactivityAlertsWidget() {
    const [alerts, setAlerts] = useState<InactivityAlert[]>([]);
    const [summary, setSummary] = useState<AlertSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/inactivity-alerts');
            // Solo mostrar las primeras 3 alertas más importantes
            const sortedAlerts = response.data.data.sort((a: InactivityAlert, b: InactivityAlert) => {
                const severityOrder = { critical: 3, warning: 2, info: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            });
            setAlerts(sortedAlerts.slice(0, 3));
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error fetching inactivity alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon name="TrendingUp" className="h-5 w-5" />
                        Actividad
                    </CardTitle>
                    <CardDescription>
                        Sin alertas de inactividad
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Icon name="CheckCircle" className="h-8 w-8 text-green-500" />
                        <p>Mantén el buen ritmo</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Icon name="AlertTriangle" className="h-5 w-5" />
                            Alertas de Actividad
                        </CardTitle>
                        <CardDescription>
                            {summary?.total || 0} alerta{summary?.total !== 1 ? 's' : ''} pendiente{summary?.total !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {summary && summary.total > 3 && (
                        <Link href="/alerts">
                            <Button variant="ghost" size="sm">
                                Ver todas
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Resumen de alertas */}
                {summary && (
                    <div className="flex gap-2">
                        {summary.critical > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {summary.critical} Crítica{summary.critical !== 1 ? 's' : ''}
                            </Badge>
                        )}
                        {summary.warning > 0 && (
                            <Badge variant="default" className="text-xs">
                                {summary.warning} Advertencia{summary.warning !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Lista compacta de alertas */}
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <Icon
                                name={getAlertIcon(alert.type)}
                                className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-2">
                                    {alert.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Hace {alert.days_inactive} día{alert.days_inactive !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botón para ver todas las alertas */}
                {summary && summary.total > 0 && (
                    <Link href="/alerts" className="block">
                        <Button variant="outline" className="w-full" size="sm">
                            Ver todas las alertas
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export default InactivityAlertsWidget;
