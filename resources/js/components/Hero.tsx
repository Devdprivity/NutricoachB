import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Hero = forwardRef<HTMLDivElement>((props, ref) => {
    const leftContentRef = useRef<HTMLDivElement>(null);
    const rightContentRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const metricsRef = useRef<HTMLDivElement[]>([]);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animación del contenido izquierdo desde la IZQUIERDA con ScrollTrigger
            gsap.fromTo(leftContentRef.current,
                {
                    x: -150,
                    opacity: 0
                },
                {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animación del título con efecto adicional
            gsap.fromTo(titleRef.current,
                {
                    scale: 0.95,
                    opacity: 0
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1,
                    ease: 'back.out(1.2)',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animación del subtítulo
            gsap.fromTo(subtitleRef.current,
                {
                    y: 30,
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animación del contenido derecho (métricas) desde la DERECHA
            gsap.fromTo(rightContentRef.current,
                {
                    x: 150,
                    opacity: 0
                },
                {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animación de las métricas individuales con stagger
            metricsRef.current.forEach((metric, index) => {
                if (metric) {
                    gsap.fromTo(metric,
                        {
                            scale: 0.8,
                            opacity: 0,
                            rotation: 3
                        },
                        {
                            scale: 1,
                            opacity: 1,
                            rotation: 0,
                            duration: 1.2,
                            ease: 'back.out(1.5)',
                            delay: index * 0.2,
                            scrollTrigger: {
                                trigger: sectionRef.current,
                                start: 'top 70%',
                                end: 'bottom 20%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={(node) => {
                sectionRef.current = node as HTMLDivElement;
                if (typeof ref === 'function') {
                    ref(node as HTMLDivElement);
                } else if (ref) {
                    ref.current = node as HTMLDivElement;
                }
            }}
            className="h-screen flex items-center px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Lado izquierdo - Texto y botones */}
                    <div ref={leftContentRef} className="text-center lg:text-left">
                        <h1
                            ref={titleRef}
                            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            Tu Coach de
                            <span className="block bg-gradient-to-r from-[#E0FE10] to-white bg-clip-text text-transparent">
                                Transformación Corporal
                            </span>
                        </h1>

                        <p
                            ref={subtitleRef}
                            className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed"
                        >
                            gidia.app es un agente de inteligencia artificial especializado en seguimiento nutricional y análisis calórico personalizado
                        </p>
                    </div>

                    {/* Lado derecho - Métricas */}
                    <div ref={rightContentRef} className="grid grid-cols-2 gap-6">
                        <div
                            ref={(el) => { if (el) metricsRef.current[0] = el; }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <div className="text-4xl font-bold text-[#E0FE10] mb-2">500+</div>
                            <div className="text-white/80 text-sm">Usuarios Activos</div>
                        </div>
                        <div
                            ref={(el) => { if (el) metricsRef.current[1] = el; }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <div className="text-4xl font-bold text-[#E0FE10] mb-2">95%</div>
                            <div className="text-white/80 text-sm">Precisión IA</div>
                        </div>
                        <div
                            ref={(el) => { if (el) metricsRef.current[2] = el; }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <div className="text-4xl font-bold text-[#E0FE10] mb-2">24/7</div>
                            <div className="text-white/80 text-sm">Disponible</div>
                        </div>
                        <div
                            ref={(el) => { if (el) metricsRef.current[3] = el; }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <div className="text-4xl font-bold text-[#E0FE10] mb-2">10k+</div>
                            <div className="text-white/80 text-sm">Alimentos</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

Hero.displayName = 'Hero';