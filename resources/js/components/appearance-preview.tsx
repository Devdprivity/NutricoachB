import { useState, useEffect } from 'react';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AppearanceOption {
    value: Appearance;
    icon: typeof Sun;
    label: string;
    description: string;
}

const appearanceOptions: AppearanceOption[] = [
    {
        value: 'light',
        icon: Sun,
        label: 'Claro',
        description: 'Tema claro ideal para uso diurno',
    },
    {
        value: 'dark',
        icon: Moon,
        label: 'Oscuro',
        description: 'Tema oscuro ideal para uso nocturno',
    },
    {
        value: 'system',
        icon: Monitor,
        label: 'Sistema',
        description: 'Sigue las preferencias de tu dispositivo',
    },
];

export default function AppearancePreview() {
    const { appearance, updateAppearance } = useAppearance();
    const [prefersDark, setPrefersDark] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setPrefersDark(mediaQuery.matches);
            
            const handler = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {appearanceOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = appearance === option.value;
                
                // Determinar si este tema debería mostrar modo oscuro
                const showDarkPreview = option.value === 'dark' || (option.value === 'system' && prefersDark);

                return (
                    <Card
                        key={option.value}
                        className={cn(
                            'relative cursor-pointer transition-all duration-200 hover:shadow-lg',
                            isSelected && 'ring-2 ring-primary ring-offset-2'
                        )}
                        onClick={() => updateAppearance(option.value)}
                    >
                        {isSelected && (
                            <div className="absolute top-4 right-4 z-10">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground">
                                    <Check className="h-4 w-4" />
                                </div>
                            </div>
                        )}

                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex items-center justify-center h-10 w-10 rounded-lg',
                                    isSelected 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{option.label}</CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        {option.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Preview del tema */}
                            <div
                                className={cn(
                                    'rounded-lg border-2 p-4 space-y-3 transition-colors',
                                    showDarkPreview
                                        ? 'bg-neutral-900 border-neutral-700'
                                        : 'bg-white border-neutral-200'
                                )}
                            >
                                {/* Preview: Header */}
                                <div className={cn(
                                    'flex items-center justify-between p-2 rounded',
                                    showDarkPreview ? 'bg-neutral-800' : 'bg-neutral-50'
                                )}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'h-2 w-2 rounded-full',
                                            showDarkPreview ? 'bg-green-500' : 'bg-primary'
                                        )}></div>
                                        <div className={cn(
                                            'h-2 w-12 rounded',
                                            showDarkPreview ? 'bg-neutral-700' : 'bg-neutral-200'
                                        )}></div>
                                    </div>
                                    <div className={cn(
                                        'h-6 w-6 rounded-full',
                                        showDarkPreview ? 'bg-neutral-700' : 'bg-neutral-200'
                                    )}></div>
                                </div>

                                {/* Preview: Card */}
                                <div className={cn(
                                    'rounded-lg p-3 space-y-2',
                                    showDarkPreview ? 'bg-neutral-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
                                )}>
                                    <div className={cn(
                                        'h-3 rounded w-3/4',
                                        showDarkPreview ? 'bg-neutral-600' : 'bg-neutral-300'
                                    )}></div>
                                    <div className={cn(
                                        'h-2 rounded w-full',
                                        showDarkPreview ? 'bg-neutral-700' : 'bg-neutral-200'
                                    )}></div>
                                    <div className={cn(
                                        'h-2 rounded w-5/6',
                                        showDarkPreview ? 'bg-neutral-700' : 'bg-neutral-200'
                                    )}></div>
                                </div>

                                {/* Preview: Buttons */}
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        'h-7 w-20 rounded-md',
                                        showDarkPreview ? 'bg-primary/80' : 'bg-primary'
                                    )}></div>
                                    <div className={cn(
                                        'h-7 w-16 rounded-md border',
                                        showDarkPreview ? 'border-neutral-600 bg-neutral-800' : 'border-neutral-300 bg-white'
                                    )}></div>
                                </div>

                                {/* Preview: Badges */}
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        'h-5 w-16 rounded-full',
                                        showDarkPreview ? 'bg-green-500/20 border border-green-500/50' : 'bg-green-100'
                                    )}></div>
                                    <div className={cn(
                                        'h-5 w-14 rounded-full',
                                        showDarkPreview ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-blue-100'
                                    )}></div>
                                </div>
                            </div>

                            {/* Botón de selección */}
                            <Button
                                variant={isSelected ? 'default' : 'outline'}
                                className="w-full mt-4"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateAppearance(option.value);
                                }}
                            >
                                {isSelected ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Seleccionado
                                    </>
                                ) : (
                                    'Seleccionar tema'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

