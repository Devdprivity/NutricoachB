import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Clock, Flame } from 'lucide-react';
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

interface ExerciseCarouselProps {
    exercises: Exercise[];
    onExerciseClick: (exercise: Exercise) => void;
}

export function ExerciseCarousel({ exercises, onExerciseClick }: ExerciseCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(7);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Responsive items per view
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setItemsPerView(1); // Mobile: 1 item
            } else if (width < 768) {
                setItemsPerView(2); // Tablet: 2 items
            } else if (width < 1024) {
                setItemsPerView(4); // Small desktop: 4 items
            } else if (width < 1280) {
                setItemsPerView(5); // Medium desktop: 5 items
            } else {
                setItemsPerView(7); // Large desktop: 7 items
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, exercises.length - itemsPerView);

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                return 'bg-green-500';
            case 'intermediate':
                return 'bg-yellow-500';
            case 'advanced':
            case 'expert':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (exercises.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No hay ejercicios disponibles</p>
            </div>
        );
    }

    return (
        <div className="relative group">
            {/* Navigation Buttons */}
            {currentIndex > 0 && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={handlePrev}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            {currentIndex < maxIndex && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={handleNext}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden" ref={carouselRef}>
                <div
                    className="flex transition-transform duration-300 ease-in-out gap-4"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                    }}
                >
                    {exercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className={cn(
                                "flex-shrink-0 cursor-pointer group/card",
                                itemsPerView === 1 ? "w-full" : `w-[calc((100%-${(itemsPerView - 1) * 16}px)/${itemsPerView})]`
                            )}
                            onClick={() => onExerciseClick(exercise)}
                        >
                            <div className="relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all h-full">
                                {/* GIF/Image */}
                                <div className="relative h-48 overflow-hidden bg-muted">
                                    {exercise.gif_url ? (
                                        <img
                                            src={exercise.gif_url}
                                            alt={exercise.name}
                                            className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : exercise.image_url ? (
                                        <img
                                            src={exercise.image_url}
                                            alt={exercise.name}
                                            className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                            <Play className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Difficulty Badge */}
                                    <div className="absolute top-2 right-2">
                                        <Badge className={cn("text-white", getDifficultyColor(exercise.difficulty))}>
                                            {exercise.difficulty}
                                        </Badge>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="lg" className="gap-2">
                                            <Play className="h-4 w-4" />
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{exercise.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                        {exercise.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{exercise.duration_minutes} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Flame className="h-3 w-3" />
                                            <span>{exercise.calories_per_minute}/min</span>
                                        </div>
                                    </div>

                                    {/* Equipment */}
                                    <div className="mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {exercise.equipment}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicators */}
            {maxIndex > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "h-2 rounded-full transition-all",
                                index === currentIndex
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

