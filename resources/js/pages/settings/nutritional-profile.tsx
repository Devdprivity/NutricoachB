import { type BreadcrumbItem, type ProfileData, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, router, usePage } from '@inertiajs/react';
import { Activity, Apple, Droplet, Heart, Scale, Target, TrendingDown, User } from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface Props {
    profileData?: ProfileData;
    errors?: Record<string, string>;
}

export default function NutritionalProfile({ profileData, errors = {} }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const profile = profileData?.profile;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Nutritional Profile',
            href: '/settings/nutritional-profile',
        },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        router.post('/settings/nutritional-profile', data, {
            preserveScroll: true,
            onSuccess: () => {
                setRecentlySuccessful(true);
                setTimeout(() => setRecentlySuccessful(false), 2000);
            },
            onFinish: () => setProcessing(false),
        });
    };

    // Helper para obtener el badge de IMC
    const getBMIBadge = (category?: string) => {
        const badges = {
            underweight: { label: 'Bajo peso', variant: 'secondary' as const },
            normal: { label: 'Normal', variant: 'default' as const },
            overweight: { label: 'Sobrepeso', variant: 'destructive' as const },
            obese: { label: 'Obesidad', variant: 'destructive' as const },
        };
        return category ? badges[category as keyof typeof badges] : null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nutritional Profile" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Perfil Nutricional"
                        description="Configura tus datos físicos y objetivos nutricionales para obtener recomendaciones personalizadas"
                    />

                    {/* Mostrar resumen si hay datos */}
                    {profileData && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">IMC</CardTitle>
                                    <Scale className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{profileData.bmi?.toFixed(1) || '--'}</div>
                                    {profileData.bmi_category && (
                                        <Badge className="mt-2" variant={getBMIBadge(profileData.bmi_category)?.variant}>
                                            {getBMIBadge(profileData.bmi_category)?.label}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Metabolismo Basal</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{profileData.bmr || '--'}</div>
                                    <p className="text-xs text-muted-foreground">kcal/día</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Gasto Energético</CardTitle>
                                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{profileData.tdee || '--'}</div>
                                    <p className="text-xs text-muted-foreground">kcal/día</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Datos Físicos Básicos */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <CardTitle>Datos Físicos Básicos</CardTitle>
                                </div>
                                <CardDescription>
                                    Esta información es esencial para calcular tu metabolismo y objetivos nutricionales
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="height">Altura (cm) *</Label>
                                        <Input
                                            id="height"
                                            name="height"
                                            type="number"
                                            step="0.01"
                                            min="100"
                                            max="250"
                                            defaultValue={profile?.height}
                                            placeholder="170"
                                            required
                                        />
                                        <InputError message={errors.height} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="weight">Peso (kg) *</Label>
                                        <Input
                                            id="weight"
                                            name="weight"
                                            type="number"
                                            step="0.01"
                                            min="30"
                                            max="300"
                                            defaultValue={profile?.weight}
                                            placeholder="70"
                                            required
                                        />
                                        <InputError message={errors.weight} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="age">Edad *</Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            min="16"
                                            max="100"
                                            defaultValue={profile?.age}
                                            placeholder="30"
                                            required
                                        />
                                        <InputError message={errors.age} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Género *</Label>
                                        <Select name="gender" defaultValue={profile?.gender} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tu género" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Hombre</SelectItem>
                                                <SelectItem value="female">Mujer</SelectItem>
                                                <SelectItem value="other">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.gender} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="activity_level">Nivel de Actividad *</Label>
                                    <Select name="activity_level" defaultValue={profile?.activity_level} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tu nivel de actividad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sedentary">Sedentario (poco o nada de ejercicio)</SelectItem>
                                            <SelectItem value="light">Ligero (ejercicio 1-3 días/semana)</SelectItem>
                                            <SelectItem value="moderate">Moderado (ejercicio 3-5 días/semana)</SelectItem>
                                            <SelectItem value="active">Activo (ejercicio 6-7 días/semana)</SelectItem>
                                            <SelectItem value="very_active">Muy Activo (ejercicio intenso diario)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.activity_level} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Composición Corporal */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    <CardTitle>Composición Corporal</CardTitle>
                                </div>
                                <CardDescription>
                                    Datos opcionales que mejoran la precisión de las recomendaciones
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="body_frame">Contextura Física</Label>
                                        <Select name="body_frame" defaultValue={profile?.body_frame}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tu contextura" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">Delgada (huesos finos)</SelectItem>
                                                <SelectItem value="medium">Media (huesos promedio)</SelectItem>
                                                <SelectItem value="large">Robusta (huesos anchos)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Se calcula automáticamente con la circunferencia de muñeca
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="body_type">Tipo de Cuerpo</Label>
                                        <Select name="body_type" defaultValue={profile?.body_type}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tu tipo de cuerpo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ectomorph">Ectomorfo (metabolismo rápido)</SelectItem>
                                                <SelectItem value="mesomorph">Mesomorfo (estructura atlética)</SelectItem>
                                                <SelectItem value="endomorph">Endomorfo (metabolismo lento)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="wrist_circumference">Circunferencia de Muñeca (cm)</Label>
                                        <Input
                                            id="wrist_circumference"
                                            name="wrist_circumference"
                                            type="number"
                                            step="0.01"
                                            min="10"
                                            max="30"
                                            defaultValue={profile?.wrist_circumference}
                                            placeholder="17.5"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Mide alrededor de tu muñeca, justo debajo del hueso
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="waist_circumference">Circunferencia de Cintura (cm)</Label>
                                        <Input
                                            id="waist_circumference"
                                            name="waist_circumference"
                                            type="number"
                                            step="0.01"
                                            min="40"
                                            max="200"
                                            defaultValue={profile?.waist_circumference}
                                            placeholder="85"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="hip_circumference">Circunferencia de Cadera (cm)</Label>
                                        <Input
                                            id="hip_circumference"
                                            name="hip_circumference"
                                            type="number"
                                            step="0.01"
                                            min="50"
                                            max="200"
                                            defaultValue={profile?.hip_circumference}
                                            placeholder="95"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="neck_circumference">Circunferencia de Cuello (cm)</Label>
                                        <Input
                                            id="neck_circumference"
                                            name="neck_circumference"
                                            type="number"
                                            step="0.01"
                                            min="20"
                                            max="60"
                                            defaultValue={profile?.neck_circumference}
                                            placeholder="38"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="body_fat_percentage">Porcentaje de Grasa Corporal (%)</Label>
                                        <Input
                                            id="body_fat_percentage"
                                            name="body_fat_percentage"
                                            type="number"
                                            step="0.01"
                                            min="3"
                                            max="60"
                                            defaultValue={profile?.body_fat_percentage}
                                            placeholder="18.5"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="muscle_mass_percentage">Porcentaje de Masa Muscular (%)</Label>
                                        <Input
                                            id="muscle_mass_percentage"
                                            name="muscle_mass_percentage"
                                            type="number"
                                            step="0.01"
                                            min="20"
                                            max="70"
                                            defaultValue={profile?.muscle_mass_percentage}
                                            placeholder="45"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Objetivos */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    <CardTitle>Objetivos</CardTitle>
                                </div>
                                <CardDescription>
                                    Define tu peso objetivo y el sistema calculará automáticamente tus metas calóricas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="target_weight">Peso Objetivo (kg)</Label>
                                        <Input
                                            id="target_weight"
                                            name="target_weight"
                                            type="number"
                                            step="0.01"
                                            min="30"
                                            max="300"
                                            defaultValue={profile?.target_weight}
                                            placeholder="68"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="target_date">Fecha Objetivo</Label>
                                        <Input
                                            id="target_date"
                                            name="target_date"
                                            type="date"
                                            defaultValue={profile?.target_date}
                                        />
                                    </div>
                                </div>

                                {profileData?.body_composition?.ideal_weight_range && (
                                    <Alert>
                                        <AlertDescription>
                                            <strong>Rango de peso ideal para tu contextura:</strong>{' '}
                                            {profileData.body_composition.ideal_weight_range.min} -{' '}
                                            {profileData.body_composition.ideal_weight_range.max} kg
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Apple className="h-5 w-5" />
                                        <h4 className="font-medium">Metas Nutricionales (Opcionales)</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Si no las especificas, el sistema las calculará automáticamente según tus datos
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="daily_calorie_goal">Calorías Diarias</Label>
                                            <Input
                                                id="daily_calorie_goal"
                                                name="daily_calorie_goal"
                                                type="number"
                                                min="800"
                                                max="5000"
                                                defaultValue={profile?.daily_calorie_goal}
                                                placeholder={profileData?.tdee?.toString() || '2000'}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="protein_goal">Proteínas (g)</Label>
                                            <Input
                                                id="protein_goal"
                                                name="protein_goal"
                                                type="number"
                                                min="20"
                                                max="500"
                                                defaultValue={profile?.protein_goal}
                                                placeholder="150"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="carbs_goal">Carbohidratos (g)</Label>
                                            <Input
                                                id="carbs_goal"
                                                name="carbs_goal"
                                                type="number"
                                                min="50"
                                                max="800"
                                                defaultValue={profile?.carbs_goal}
                                                placeholder="200"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="fat_goal">Grasas (g)</Label>
                                            <Input
                                                id="fat_goal"
                                                name="fat_goal"
                                                type="number"
                                                min="20"
                                                max="300"
                                                defaultValue={profile?.fat_goal}
                                                placeholder="65"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="water_goal">
                                                <div className="flex items-center gap-2">
                                                    <Droplet className="h-4 w-4" />
                                                    Agua Diaria (ml)
                                                </div>
                                            </Label>
                                            <Input
                                                id="water_goal"
                                                name="water_goal"
                                                type="number"
                                                min="1000"
                                                max="10000"
                                                defaultValue={profile?.water_goal || 4000}
                                                placeholder="4000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información Médica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Médica</CardTitle>
                                <CardDescription>
                                    Esta información nos ayuda a personalizar las recomendaciones para tu salud
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="medical_conditions">Condiciones Médicas</Label>
                                    <Textarea
                                        id="medical_conditions"
                                        name="medical_conditions"
                                        defaultValue={profile?.medical_conditions}
                                        placeholder="Ej: Diabetes tipo 2, hipertensión"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="dietary_restrictions">Restricciones Dietéticas</Label>
                                    <Textarea
                                        id="dietary_restrictions"
                                        name="dietary_restrictions"
                                        defaultValue={profile?.dietary_restrictions}
                                        placeholder="Ej: Intolerancia a la lactosa, vegetariano"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_medically_supervised"
                                        name="is_medically_supervised"
                                        defaultChecked={profile?.is_medically_supervised}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="is_medically_supervised" className="font-normal">
                                        Estoy bajo supervisión médica
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar Perfil'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Perfil guardado exitosamente</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
