import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    yearly_discount_percentage: number;
}

interface ActiveSubscription {
    id: number;
    status: string;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    amount: number;
    auto_renew: boolean;
    days_remaining: number;
    subscription_plan: SubscriptionPlan;
}

interface SubscriptionProps {
    plans: SubscriptionPlan[];
    activeSubscription?: ActiveSubscription;
    currentPlan?: SubscriptionPlan;
    isPremium: boolean;
}

export default function Subscription({ plans, activeSubscription, currentPlan, isPremium }: SubscriptionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (planId: number) => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await axios.post('/subscription/subscribe', {
                plan_id: planId,
                billing_cycle: billingCycle,
            });
            
            // Si el backend devuelve una URL de Stripe, redirigir
            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                // Si es plan gratuito, recargar la página
                router.reload();
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Error al suscribirse');
            setLoading(false);
        }
        // No quitamos el loading aquí porque vamos a redirigir
    };

    const handleCancel = async () => {
        if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) return;

        try {
            await axios.post('/subscription/cancel');
            router.reload();
        } catch (error) {
            console.error('Error canceling:', error);
        }
    };

    const getPrice = (plan: SubscriptionPlan) => {
        return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    };

    return (
        <AppLayout>
            <Head title="Suscripción" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Planes de Suscripción</h1>
                    <p className="text-muted-foreground">Elige el plan que mejor se adapte a tus necesidades</p>
                </div>

                {/* Current Subscription Status */}
                {activeSubscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                Tu Suscripción Actual: {activeSubscription.subscription_plan.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estado:</span>
                                <Badge variant={activeSubscription.status === 'active' ? 'default' : 'secondary'}>
                                    {activeSubscription.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ciclo:</span>
                                <span>{activeSubscription.billing_cycle === 'yearly' ? 'Anual' : 'Mensual'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Próxima facturación:</span>
                                <span>{new Date(activeSubscription.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Días restantes:</span>
                                <span>{activeSubscription.days_remaining} días</span>
                            </div>
                        </CardContent>
                        {activeSubscription.subscription_plan.slug !== 'free' && (
                            <CardFooter>
                                <Button variant="outline" onClick={handleCancel} className="w-full">
                                    Cancelar Suscripción
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                )}

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center">
                    <Tabs value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="monthly">Mensual</TabsTrigger>
                            <TabsTrigger value="yearly">
                                Anual
                                <Badge variant="secondary" className="ml-2">Ahorra hasta 17%</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan?.id === plan.id;
                        const price = getPrice(plan);

                        return (
                            <Card key={plan.id} className={`relative ${isCurrentPlan ? 'border-primary' : ''}`}>
                                {plan.slug === 'premium' && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Más Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="text-4xl font-bold">
                                            ${price}
                                            <span className="text-lg text-muted-foreground">
                                                /{billingCycle === 'yearly' ? 'año' : 'mes'}
                                            </span>
                                        </div>
                                        {billingCycle === 'yearly' && plan.yearly_discount_percentage > 0 && (
                                            <p className="text-sm text-green-600">
                                                Ahorras {plan.yearly_discount_percentage}% al año
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    {isCurrentPlan ? (
                                        <Button disabled className="w-full">
                                            Plan Actual
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={loading}
                                            className="w-full"
                                            variant={plan.slug === 'premium' ? 'default' : 'outline'}
                                        >
                                            {plan.slug === 'free' ? 'Cambiar a Free' : 'Suscribirse'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Features Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comparación de Características</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Característica</th>
                                        {plans.map((plan) => (
                                            <th key={plan.id} className="text-center py-3 px-4">{plan.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">Recetas</td>
                                        <td className="text-center py-3 px-4">5</td>
                                        <td className="text-center py-3 px-4">50</td>
                                        <td className="text-center py-3 px-4">Ilimitadas</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">Planes de entrenamiento</td>
                                        <td className="text-center py-3 px-4">2</td>
                                        <td className="text-center py-3 px-4">10</td>
                                        <td className="text-center py-3 px-4">Ilimitados</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">Coach AI</td>
                                        <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-500 inline" /></td>
                                        <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-500 inline" /></td>
                                        <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 inline" /></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-3 px-4">Análisis de progreso</td>
                                        <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-500 inline" /></td>
                                        <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 inline" /></td>
                                        <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 inline" /></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4">Soporte prioritario</td>
                                        <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-500 inline" /></td>
                                        <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-500 inline" /></td>
                                        <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 inline" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
