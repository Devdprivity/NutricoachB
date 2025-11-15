import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { InvoiceSkeleton } from '@/components/skeletons/invoice-skeleton';
import { useState, useEffect } from 'react';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
}

interface Subscription {
    id: number;
    subscription_plan: SubscriptionPlan;
}

interface PaymentHistory {
    id: number;
    subscription: Subscription;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    payment_method: string;
    transaction_id: string;
    payment_gateway: string;
    description: string;
    paid_at?: string;
    created_at: string;
}

interface InvoiceProps {
    payment: PaymentHistory;
}

export default function Invoice({ payment }: InvoiceProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        document.addEventListener('inertia:start', handleStart);
        document.addEventListener('inertia:finish', handleFinish);

        return () => {
            document.removeEventListener('inertia:start', handleStart);
            document.removeEventListener('inertia:finish', handleFinish);
        };
    }, []);

    if (isLoading) {
        return (
            <AppLayout>
                <Head title="Cargando..." />
                <InvoiceSkeleton />
            </AppLayout>
        );
    }

    const statusColors = {
        completed: 'bg-green-500',
        pending: 'bg-yellow-500',
        failed: 'bg-red-500',
        refunded: 'bg-gray-500',
    };

    const statusLabels = {
        completed: 'Completado',
        pending: 'Pendiente',
        failed: 'Fallido',
        refunded: 'Reembolsado',
    };

    const statusIcons = {
        completed: CheckCircle2,
        pending: Clock,
        failed: XCircle,
        refunded: XCircle,
    };

    const StatusIcon = statusIcons[payment.status];

    const handleDownload = () => {
        // TODO: Implementar descarga de factura PDF
        alert('Funcionalidad de descarga de PDF próximamente');
    };

    return (
        <AppLayout>
            <Head title={`Factura #${payment.transaction_id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/subscription" preserveScroll>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Factura</h1>
                            <p className="text-muted-foreground">
                                Transacción: {payment.transaction_id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={statusColors[payment.status]}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusLabels[payment.status]}
                        </Badge>
                        <Button onClick={handleDownload} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Invoice Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles de la Factura</CardTitle>
                                <CardDescription>
                                    Información completa de la transacción
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Fecha de pago</p>
                                        <p className="font-semibold">
                                            {payment.paid_at
                                                ? new Date(payment.paid_at).toLocaleDateString('es-ES', {
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })
                                                : 'Pendiente'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Método de pago</p>
                                        <p className="font-semibold capitalize">
                                            {payment.payment_method === 'stripe' ? 'Tarjeta de crédito' : payment.payment_method}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Gateway</p>
                                        <p className="font-semibold capitalize">{payment.payment_gateway}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">ID de transacción</p>
                                        <p className="font-semibold text-sm">{payment.transaction_id}</p>
                                    </div>
                                </div>

                                {payment.description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                                        <p className="font-semibold">{payment.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Subscription Info */}
                        {payment.subscription && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información de Suscripción</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Plan</p>
                                            <p className="font-semibold text-lg">
                                                {payment.subscription.subscription_plan.name}
                                            </p>
                                        </div>
                                        {payment.subscription.subscription_plan.description && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Descripción</p>
                                                <p className="text-sm">{payment.subscription.subscription_plan.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">
                                        {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-4">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={`h-5 w-5 ${statusColors[payment.status]}`} />
                                    <div>
                                        <p className="font-semibold">{statusLabels[payment.status]}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.status === 'completed' && payment.paid_at
                                                ? `Pagado el ${new Date(payment.paid_at).toLocaleDateString('es-ES')}`
                                                : payment.status === 'pending'
                                                ? 'Pago pendiente de confirmación'
                                                : payment.status === 'failed'
                                                ? 'El pago no pudo ser procesado'
                                                : 'Reembolsado'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

