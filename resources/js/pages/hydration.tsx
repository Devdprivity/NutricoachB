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

            <div className="flex flex-col gap-2 md:gap-6 p-3 md:p-6">
                <div className="mb-1">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">Hidratación</h1>
                    <p className="text-xs md:text-base text-muted-foreground">
                        Registra tu consumo de agua
                    </p>
                </div>

                {/* Resumen del Día */}
                {summary && (
                    <Card>
                        <CardContent className="p-3 md:p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-xl md:text-4xl font-bold text-blue-500">
                                        {summary.total_ml} <span className="text-sm md:text-2xl">ml</span>
                                    </div>
                                    <p className="text-[10px] md:text-sm text-muted-foreground">
                                        de {summary.goal_ml} ml
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg md:text-3xl font-bold">{summary.percentage}%</div>
                                    <p className="text-[10px] md:text-sm text-muted-foreground">
                                        {summary.status === 'excellent' && '⭐'}
                                        {summary.status === 'good' && '✅'}
                                        {summary.status === 'fair' && '🟡'}
                                        {summary.status === 'poor' && '⚠️'}
                                        {summary.status === 'critical' && '🔴'}
                                    </p>
                                </div>
                            </div>
                            <Progress value={Math.min(summary.percentage, 100)} className="h-1.5 md:h-3" />
                            {summary.percentage < 100 && (
                                <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                                    Faltan {summary.goal_ml - summary.total_ml} ml
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Registro Rápido */}
                <Card>
                    <CardContent className="p-3 md:p-6">
                        <div className="space-y-2 md:space-y-4">
                            <div className="flex gap-2">
                                <Select value={drinkType} onValueChange={setDrinkType}>
                                    <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(drinkTypeLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1"
                                    max="2000"
                                    placeholder="250"
                                    className="h-8 md:h-10 text-xs md:text-sm w-20"
                                />
                                <Button onClick={handleCustomAdd} disabled={isSubmitting} className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4">
                                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(250)}
                                    disabled={isSubmitting}
                                    className="h-12 md:h-16 flex flex-col p-1"
                                >
                                    <Droplet className="h-4 w-4 md:h-5 md:w-5 mb-0.5" />
                                    <span className="text-[10px] md:text-sm">250ml</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(500)}
                                    disabled={isSubmitting}
                                    className="h-12 md:h-16 flex flex-col p-1"
                                >
                                    <Droplet className="h-5 w-5 md:h-6 md:w-6 mb-0.5" />
                                    <span className="text-[10px] md:text-sm">500ml</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(750)}
                                    disabled={isSubmitting}
                                    className="h-12 md:h-16 flex flex-col p-1"
                                >
                                    <Droplet className="h-6 w-6 md:h-7 md:w-7 mb-0.5" />
                                    <span className="text-[10px] md:text-sm">750ml</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickAdd(1000)}
                                    disabled={isSubmitting}
                                    className="h-12 md:h-16 flex flex-col p-1"
                                >
                                    <Droplet className="h-7 w-7 md:h-8 md:w-8 mb-0.5" />
                                    <span className="text-[10px] md:text-sm">1L</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registros de Hoy */}
                {records.length > 0 && (
                    <Card>
                        <CardContent className="p-3 md:p-6">
                            <div className="space-y-1 md:space-y-2 max-h-48 md:max-h-96 overflow-y-auto">
                                {records.map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-2 md:p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {record.type === 'coffee' && <Coffee className="h-3 w-3 md:h-5 md:w-5 flex-shrink-0" />}
                                            {record.type !== 'coffee' && <Droplet className="h-3 w-3 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />}
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-xs md:text-base truncate">
                                                    {record.amount_ml} ml - {drinkTypeLabels[record.type] || record.type}
                                                </div>
                                                <div className="text-[10px] md:text-sm text-muted-foreground">
                                                    {record.time}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(record.id)}
                                            className="h-7 w-7 md:h-10 md:w-10 flex-shrink-0"
                                        >
                                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
