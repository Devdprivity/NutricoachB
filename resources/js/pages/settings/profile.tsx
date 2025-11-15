import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Camera } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { HeadingSmall } from '@/components/heading-small';
import { ProfileSkeleton } from '@/components/skeletons/profile-skeleton';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string;
}

interface ProfileProps {
    user: User;
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ user, mustVerifyEmail, status }: ProfileProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                <SettingsLayout>
                    <ProfileSkeleton />
                </SettingsLayout>
            </AppLayout>
        );
    }

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            router.reload({ preserveScroll: true });
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Perfil" />
            
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Información del Perfil"
                        description="Actualiza la información de tu cuenta y tu dirección de correo electrónico"
                    />

                    {status && (
                        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-green-800 dark:text-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Foto de Perfil</CardTitle>
                                <CardDescription>
                                    Tu foto de perfil aparece en tu cuenta y en tus actividades
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="text-2xl">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isUploading && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {isUploading ? 'Subiendo...' : 'Cambiar foto'}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        PNG, JPG o GIF hasta 2MB
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nombre */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                                <CardDescription>
                                    Actualiza tu nombre y dirección de correo electrónico
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        <User className="mr-2 inline h-4 w-4" />
                                        Nombre
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        <Mail className="mr-2 inline h-4 w-4" />
                                        Correo Electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="tu@email.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.email}
                                        </p>
                                    )}
                                    {mustVerifyEmail && !user.email_verified_at && (
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Tu dirección de correo electrónico no está verificada. 
                                            <a
                                                href="/email/verify"
                                                className="ml-1 underline hover:text-yellow-700 dark:hover:text-yellow-300"
                                            >
                                                Haz clic aquí para reenviar el correo de verificación.
                                            </a>
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Guardado
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

