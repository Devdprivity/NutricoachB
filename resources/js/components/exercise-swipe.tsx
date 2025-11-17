import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Clock, Flame, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Exercise {
    id: string | number;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    calories_per_minute: number;
    gif_url?: string;
    image_url?: string;
    equipment: string;
    duration_minutes: number;
}

interface ExerciseSwipeProps {
    exercises: Exercise[];
    onExerciseClick: (exercise: Exercise) => void;
    getDifficultyColor: (difficulty: string) => string;
}

export function ExerciseSwipe({ exercises, onExerciseClick, getDifficultyColor }: ExerciseSwipeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isMobile || !isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        setOffsetX(diff);
    };

    const handleTouchEnd = () => {
        if (!isMobile || !isDragging) return;
        setIsDragging(false);

        const threshold = 100; // Píxeles mínimos para cambiar de card

        if (offsetX > threshold && currentIndex > 0) {
            // Swipe right - ir al anterior
            setCurrentIndex(currentIndex - 1);
        } else if (offsetX < -threshold && currentIndex < exercises.length - 1) {
            // Swipe left - ir al siguiente
            setCurrentIndex(currentIndex + 1);
        }

        setOffsetX(0);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isMobile) return;
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isMobile || !isDragging) return;
        const currentX = e.clientX;
        const diff = currentX - startX;
        setOffsetX(diff);
    };

    const handleMouseUp = () => {
        if (!isMobile || !isDragging) return;
        setIsDragging(false);

        const threshold = 100;

        if (offsetX > threshold && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (offsetX < -threshold && currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }

        setOffsetX(0);
    };

    const goToNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (exercises.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No hay ejercicios disponibles</p>
            </div>
        );
    }

    const currentExercise = exercises[currentIndex];
    const rotation = offsetX * 0.1; // Rotación sutil durante el swipe
    const opacity = 1 - Math.abs(offsetX) / 300; // Opacidad que disminuye al arrastrar

    return (
        <div className="relative">
            {/* Mobile: Swipe Container */}
            <div className="md:hidden">
                <div className="relative w-full" style={{ height: 'calc(100vh - 280px)', minHeight: '520px', maxHeight: '700px' }}>
                    {/* Card Container */}
                    <div
                        ref={cardRef}
                        className="absolute inset-0 flex items-center justify-center px-2"
                        style={{
                            transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
                            opacity: Math.max(0.3, opacity),
                            transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            className="relative w-full h-full max-w-sm mx-auto"
                            onClick={() => !isDragging && onExerciseClick(currentExercise)}
                        >
                            {/* GIF del ejercicio */}
                            {currentExercise.gif_url ? (
                                <img
                                    src={currentExercise.gif_url}
                                    alt={currentExercise.name}
                                    className="w-full h-full object-cover rounded-[15px] shadow-2xl"
                                    style={{ borderRadius: '15px' }}
                                    loading="lazy"
                                />
                            ) : currentExercise.image_url ? (
                                <img
                                    src={currentExercise.image_url}
                                    alt={currentExercise.name}
                                    className="w-full h-full object-cover rounded-[15px] shadow-2xl"
                                    style={{ borderRadius: '15px' }}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center rounded-[15px] bg-muted/10" style={{ borderRadius: '15px' }}>
                                    <Dumbbell className="h-20 w-20 text-muted-foreground opacity-20" />
                                </div>
                            )}

                            {/* Badge de dificultad */}
                            <div className="absolute top-2 right-2 z-10">
                                <Badge className={cn("text-xs font-semibold", getDifficultyColor(currentExercise.difficulty))}>
                                    {currentExercise.difficulty}
                                </Badge>
                            </div>

                            {/* Overlay con información */}
                            <div className="absolute inset-x-0 bottom-0">
                                <div className="bg-gradient-to-t from-black/95 via-black/70 to-transparent rounded-b-[15px] p-3 pt-6" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-white text-base leading-tight line-clamp-2">
                                            {currentExercise.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{currentExercise.duration_minutes} min</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Flame className="h-3 w-3" />
                                                <span>{currentExercise.calories_per_minute}/min</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 line-clamp-1">
                                            {currentExercise.equipment}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Play */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-primary rounded-full p-4 shadow-xl pointer-events-auto">
                                    <Play className="h-6 w-6 text-primary-foreground fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Indicadores de dirección durante swipe */}
                    {isDragging && (
                        <>
                            {offsetX > 50 && currentIndex > 0 && (
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-2xl font-bold">
                                    ←
                                </div>
                            )}
                            {offsetX < -50 && currentIndex < exercises.length - 1 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold">
                                    →
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Controles de navegación */}
                <div className="flex items-center justify-between mt-3 px-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="rounded-full h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Indicadores de posición */}
                    <div className="flex gap-1.5">
                        {exercises.slice(Math.max(0, currentIndex - 2), Math.min(exercises.length, currentIndex + 3)).map((_, idx) => {
                            const actualIdx = Math.max(0, currentIndex - 2) + idx;
                            return (
                                <div
                                    key={actualIdx}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all",
                                        actualIdx === currentIndex
                                            ? "w-6 bg-primary"
                                            : "w-1.5 bg-muted-foreground/30"
                                    )}
                                />
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNext}
                        disabled={currentIndex === exercises.length - 1}
                        className="rounded-full h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Contador */}
                <div className="text-center mt-2 text-xs text-muted-foreground">
                    {currentIndex + 1} de {exercises.length}
                </div>
            </div>

            {/* Desktop: Grid normal */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="group cursor-pointer"
                        onClick={() => onExerciseClick(exercise)}
                    >
                        <div className="relative aspect-[3/4] transition-all duration-300 hover:scale-105">
                            {/* GIF del ejercicio flotante */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                {exercise.gif_url ? (
                                    <img
                                        src={exercise.gif_url}
                                        alt={exercise.name}
                                        className="w-full h-full object-contain rounded-[15px] shadow-2xl"
                                        style={{ borderRadius: '15px' }}
                                        loading="lazy"
                                    />
                                ) : exercise.image_url ? (
                                    <img
                                        src={exercise.image_url}
                                        alt={exercise.name}
                                        className="w-full h-full object-contain rounded-[15px] shadow-2xl"
                                        style={{ borderRadius: '15px' }}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center rounded-[15px] bg-muted/10" style={{ borderRadius: '15px' }}>
                                        <Dumbbell className="h-20 w-20 text-muted-foreground opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Badge de dificultad */}
                            <div className="absolute top-3 right-3 z-10">
                                <Badge className={cn("text-xs font-semibold", getDifficultyColor(exercise.difficulty))}>
                                    {exercise.difficulty}
                                </Badge>
                            </div>

                            {/* Overlay con información - Posicionado sobre el GIF */}
                            <div className="absolute inset-x-0 bottom-0 p-4">
                                <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent rounded-b-[15px] p-4 pt-8 -mx-4 -mb-4" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">
                                            {exercise.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{exercise.duration_minutes} min</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Flame className="h-3 w-3" />
                                                <span>{exercise.calories_per_minute}/min</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 line-clamp-1">
                                            {exercise.equipment}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Play al hacer hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-primary rounded-full p-4 shadow-xl transform group-hover:scale-110 transition-transform pointer-events-auto">
                                    <Play className="h-6 w-6 text-primary-foreground fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


