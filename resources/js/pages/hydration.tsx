import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Coffee, Droplet, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hidratación', href: '/hydration' },
];

interface HydrationRecord {
    id: number;
    amount_ml: number;
    time: string;
    type: string;
    notes?: string;
}

interface HydrationData {
    today_records: HydrationRecord[];
    today_summary: {
        total_ml: number;
        goal_ml: number;
        percentage: number;
        status: string;
    };
    drink_types: string[];
}

export default function Hydration({ hydrationData }: { hydrationData?: HydrationData }) {
    const [amount, setAmount] = useState('250');
    const [drinkType, setDrinkType] = useState('water');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const summary = hydrationData?.today_summary;
    const records = hydrationData?.today_records || [];

    const handleQuickAdd = (ml: number) => {
        setIsSubmitting(true);
        const now = new Date();

        router.post('/hydration', {
            amount_ml: ml,
            type: drinkType,
            time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            date: now.toISOString().split('T')[0],
        }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleCustomAdd = () => {
        const ml = parseInt(amount);
        if (ml > 0 && ml <= 2000) {
            handleQuickAdd(ml);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro?')) {
            router.delete(`/hydration/${id}`, { preserveScroll: true });
        }
    };

    const drinkTypeLabels: Record<string, string> = {
        water: 'Agua',
        tea: 'Té',
        coffee: 'Café',
        juice: 'Jugo',
        smoothie: 'Batido',
        sports_drink: 'Bebida Deportiva',
        coconut_water: 'Agua de Coco',
        herbal_tea: 'Té Herbal',
        other: 'Otro',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hidratación" />

            <div className="flex flex-col gap-3 md:gap-6 p-3 md:p-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hidratación</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Registra tu consumo de agua y otras bebidas
                    </p>
                </div>

                {/* Resumen del Día */}
                {summary && (
                    <Card>
                        <CardHeader className="p-3 md:p-6">
                            <CardTitle className="text-base md:text-lg">Resumen de Hoy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 md:space-y-4 p-3 pt-0 md:p-6 md:pt-0">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl md:text-4xl font-bold text-blue-500">
                                        {summary.total_ml} ml
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        de {summary.goal_ml} ml
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl md:text-3xl font-bold">{summary.percentage}%</div>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {summary.status === 'excellent' && '⭐ Excelente'}
                                        {summary.status === 'good' && '✅ Bien'}
                                        {summary.status === 'fair' && '🟡 Regular'}
                                        {summary.status === 'poor' && '⚠️ Bajo'}
                                        {summary.status === 'critical' && '🔴 Crítico'}
                                    </p>
                                </div>
                            </div>
                            <Progress value={Math.min(summary.percentage, 100)} className="h-2 md:h-3" />
                            {summary.percentage < 100 && (
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Te faltan {summary.goal_ml - summary.total_ml} ml para tu meta
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Registro Rápido */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registrar Consumo</CardTitle>
                        <CardDescription>Agrega agua u otras bebidas a tu registro diario</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Tipo de Bebida</Label>
                                <Select value={drinkType} onValueChange={setDrinkType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(drinkTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Cantidad Personalizada (ml)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                        max="2000"
                                        placeholder="250"
                                    />
                                    <Button onClick={handleCustomAdd} disabled={isSubmitting}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="mb-3 block">Accesos Rápidos</Label>
                            <div className="grid grid-cols-4 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(250)}
                                    disabled={isSubmitting}
                                    className="h-16 flex flex-col"
                                >
                                    <Droplet className="h-5 w-5 mb-1" />
                                    <span className="text-sm">250ml</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(500)}
                                    disabled={isSubmitting}
                                    className="h-16 flex flex-col"
                                >
                                    <Droplet className="h-6 w-6 mb-1" />
                                    <span className="text-sm">500ml</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(750)}
                                    disabled={isSubmitting}
                                    className="h-16 flex flex-col"
                                >
                                    <Droplet className="h-7 w-7 mb-1" />
                                    <span className="text-sm">750ml</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(1000)}
                                    disabled={isSubmitting}
                                    className="h-16 flex flex-col"
                                >
                                    <Droplet className="h-8 w-8 mb-1" />
                                    <span className="text-sm">1L</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registros de Hoy */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registros de Hoy</CardTitle>
                        <CardDescription>Historial de consumo del día</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <div className="text-center py-12">
                                <Droplet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No has registrado consumo de bebidas hoy
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {record.type === 'coffee' && <Coffee className="h-5 w-5" />}
                                            {record.type !== 'coffee' && <Droplet className="h-5 w-5 text-blue-500" />}
                                            <div>
                                                <div className="font-medium">
                                                    {record.amount_ml} ml - {drinkTypeLabels[record.type] || record.type}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {record.time}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(record.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
