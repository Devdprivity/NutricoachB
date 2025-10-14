import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Philosophy = forwardRef<HTMLDivElement>((props, ref) => {
    const philosophyRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);
    const principlesRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animación del título
            gsap.fromTo(philosophyRef.current?.querySelector('h2'),
                {
                    y: 50,
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animación de la cita
            gsap.fromTo(quoteRef.current,
                {
                    scale: 0.8,
                    opacity: 0
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'top 70%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animación de los principios
            principlesRef.current.forEach((principle, index) => {
                if (principle) {
                    gsap.fromTo(principle,
                        {
                            y: 50,
                            opacity: 0
                        },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: 'power3.out',
                            delay: 0.6 + (index * 0.2),
                            scrollTrigger: {
                                trigger: ref.current,
                                start: 'top 60%',
                                end: 'bottom 20%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }
            });
        });

        return () => ctx.revert();
    }, [ref]);

    const principles = [
        {
            title: "Autocompasión Inteligente",
            description: "Enfoque en el 80% de adherencia en lugar del 100%, promoviendo flexibilidad inteligente sobre rigidez perfecta.",
            icon: "💚"
        },
        {
            title: "Transformación Sostenible",
            description: "Resultados a largo plazo (8-12 meses) con cambios de hábitos que perduran en el tiempo.",
            icon: "🌱"
        },
        {
            title: "Supervisión Médica",
            description: "Sistema de apoyo educativo que complementa, no reemplaza, la supervisión médica profesional.",
            icon: "👨‍⚕️"
        },
        {
            title: "Bienestar Integral",
            description: "Consideración tanto de aspectos físicos como psicológicos del cambio de hábitos alimenticios.",
            icon: "🧘‍♀️"
        }
    ];

    return (
        <section
            ref={ref}
            className="py-12 px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <div ref={philosophyRef} className="text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                        Filosofía del
                        <span className="block bg-gradient-to-r from-[#E0FE10] to-white bg-clip-text text-transparent">
                            Sistema
                        </span>
                    </h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        Basado en principios de transformación sostenible y autocompasión inteligente
                    </p>
                </div>

                {/* Cita principal */}
                <div ref={quoteRef} className="text-center mb-16">
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 max-w-4xl mx-auto">
                        <div className="text-6xl mb-6">💭</div>
                        <blockquote className="text-2xl lg:text-3xl font-medium text-white italic mb-6">
                            "La transformación sostenible se construye con autocompasión inteligente, no con perfección rígida"
                        </blockquote>
                        <cite className="text-lg text-[#E0FE10] font-semibold">
                            — NutriCoach Luis
                        </cite>
                    </div>
                </div>

                {/* Principios */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {principles.map((principle, index) => (
                        <div
                            key={index}
                            ref={(el) => principlesRef.current[index] = el}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group text-center"
                        >
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {principle.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                {principle.title}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {principle.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

Philosophy.displayName = 'Philosophy';
