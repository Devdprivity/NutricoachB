import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { MessageSquare, Sparkles, Send, TrendingUp, Flame, Droplet, Info, Trash2, Bot, User as UserIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { message, clear } from '@/routes/coaching';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Coaching', href: '/coaching' },
];

interface Conversation {
    id: number;
    role: 'user' | 'assistant';
    message: string;
    created_at: string;
}

interface ContextSummary {
    nutrition: {
        total_meals?: number;
        avg_calories_per_day?: number;
        total_calories_week?: number;
    };
    exercise: {
        total_sessions?: number;
        total_minutes?: number;
        total_calories_burned?: number;
    };
    hydration: {
        total_ml?: number;
        avg_ml_per_day?: number;
        days_met_goal?: number;
    };
    last_updated?: string;
}

interface Props {
    contextSummary: ContextSummary;
    conversations: Conversation[];
}

export default function Coaching({ contextSummary, conversations }: Props) {
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversations]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        setIsTyping(true);
        post(message.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsTyping(false);
            },
            onError: () => {
                setIsTyping(false);
            },
        });
    };

    const handleClearHistory = () => {
        if (confirm('¿Estás seguro de que quieres borrar todo el historial de conversación?')) {
            router.delete(clear.url());
        }
    };

    const suggestedQuestions = [
        '¿Cómo puedo mejorar mi alimentación?',
        '¿Qué ejercicios me recomiendas?',
        '¿Estoy cumpliendo mis metas?',
        'Dame consejos para mantenerme motivado',
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coaching Personalizado" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bot className="h-8 w-8 text-primary" />
                        Coaching Personalizado con IA
                    </h1>
                    <p className="text-muted-foreground">Tu entrenador personal que conoce tu progreso y te ayuda a alcanzar tus metas</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nutrición (7 días)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(contextSummary.nutrition?.avg_calories_per_day || 0)}</div>
                            <p className="text-xs text-muted-foreground">kcal promedio/día</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {contextSummary.nutrition?.total_meals || 0} comidas registradas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ejercicio (7 días)</CardTitle>
                            <Flame className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{contextSummary.exercise?.total_minutes || 0}</div>
                            <p className="text-xs text-muted-foreground">minutos de ejercicio</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {Math.round(contextSummary.exercise?.total_calories_burned || 0)} kcal quemadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hidratación (7 días)</CardTitle>
                            <Droplet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round(contextSummary.hydration?.avg_ml_per_day || 0)}</div>
                            <p className="text-xs text-muted-foreground">ml promedio/día</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {contextSummary.hydration?.days_met_goal || 0}/7 días meta cumplida
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        El coach tiene acceso a todo tu historial de nutrición, ejercicios e hidratación de los últimos 7 días.
                        Hazle cualquier pregunta sobre tu progreso y recibirás consejos personalizados.
                        {contextSummary.last_updated && (
                            <span className="block mt-1 text-xs">
                                Última actualización: {contextSummary.last_updated}
                            </span>
                        )}
                    </AlertDescription>
                </Alert>

                <Card className="flex-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Chat con tu Coach IA</CardTitle>
                            <CardDescription>Recibe coaching personalizado basado en tus datos</CardDescription>
                        </div>
                        {conversations.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearHistory}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Limpiar
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4">
                            {/* Área de mensajes */}
                            <div className="border rounded-lg p-4 h-[500px] overflow-y-auto bg-muted/10">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
                                        <p className="text-lg font-medium mb-2">¡Bienvenido a tu Coach Personalizado!</p>
                                        <p className="text-muted-foreground mb-6">
                                            Puedo ayudarte con consejos sobre nutrición, ejercicio e hidratación basados en tu progreso.
                                        </p>
                                        <div className="flex flex-col gap-2 max-w-md mx-auto">
                                            <p className="text-sm font-medium text-left mb-2">Preguntas sugeridas:</p>
                                            {suggestedQuestions.map((question, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-start text-left"
                                                    onClick={() => setData('message', question)}
                                                >
                                                    <MessageSquare className="h-3 w-3 mr-2" />
                                                    {question}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {conversations.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {msg.role === 'assistant' && (
                                                    <div className="flex-shrink-0">
                                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                            <Bot className="h-5 w-5 text-primary-foreground" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-3 ${
                                                        msg.role === 'user'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'
                                                    }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                    <p className="text-xs opacity-70 mt-1">{msg.created_at}</p>
                                                </div>
                                                {msg.role === 'user' && (
                                                    <div className="flex-shrink-0">
                                                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                                            <UserIcon className="h-5 w-5 text-secondary-foreground" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex gap-3 justify-start">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                        <Bot className="h-5 w-5 text-primary-foreground" />
                                                    </div>
                                                </div>
                                                <div className="bg-muted rounded-lg p-3">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Formulario de entrada */}
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Textarea
                                    placeholder="Pregúntale a tu coach sobre tu progreso, pide consejos o solicita recomendaciones..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    rows={3}
                                    disabled={processing || isTyping}
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={processing || isTyping || !data.message.trim()}
                                    className="self-end"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>

                            <p className="text-xs text-muted-foreground text-center">
                                El coach IA analiza tus datos de nutrición, ejercicio e hidratación para brindarte consejos personalizados
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
