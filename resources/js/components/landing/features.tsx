import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Features = forwardRef<HTMLDivElement>((props, ref) => {
    const featuresRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animación del título
            gsap.fromTo(featuresRef.current?.querySelector('h2'),
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

            // Animación de los elementos
            itemsRef.current.forEach((item, index) => {
                if (item) {
                    gsap.fromTo(item,
                        {
                            x: index % 2 === 0 ? -100 : 100,
                            opacity: 0
                        },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 1.2,
                            ease: 'power3.out',
                            delay: index * 0.3,
                            scrollTrigger: {
                                trigger: ref.current,
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
    }, [ref]);

    const features = [
        {
            title: "Seguimiento Diario Flexible",
            icon: "📅",
            description: "Mantiene registro completo de calorías consumidas, progreso en macronutrientes y estado emocional.",
            details: [
                "Calorías consumidas vs objetivo",
                "Progreso en macronutrientes", 
                "Comidas completadas del plan",
                "Hidratación diaria (meta: 4-5L)",
                "Estado emocional y energético"
            ]
        },
        {
            title: "Comandos Especiales",
            icon: "🎯",
            description: "Comandos inteligentes para situaciones específicas y análisis personalizados.",
            details: [
                "\"Resumen del día\": Análisis completo",
                "\"¿Cómo voy?\": Estado vs objetivos",
                "\"Día difícil\": Modo comprensivo",
                "\"SOS antojo\": Estrategias inmediatas",
                "\"Situación social\": Tips para eventos"
            ]
        },
        {
            title: "Protocolos de Seguridad",
            icon: "🛡️",
            description: "Múltiples capas de seguridad para garantizar un enfoque saludable y sostenible.",
            details: [
                "Disclaimer médico obligatorio",
                "Alertas por pérdida acelerada",
                "Recomendaciones médicas",
                "Enfoque en bienestar mental",
                "Prevención de obsesiones"
            ]
        }
    ];

    return (
        <section
            ref={ref}
            className="py-12 px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <div ref={featuresRef} className="text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                        Funcionalidades
                        <span className="block bg-gradient-to-r from-[#E0FE10] to-white bg-clip-text text-transparent">
                            Avanzadas
                        </span>
                    </h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        Herramientas inteligentes diseñadas para acompañarte en cada paso de tu transformación
                    </p>
                </div>

                <div className="space-y-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            ref={(el) => itemsRef.current[index] = el}
                            className={`flex flex-col lg:flex-row items-center gap-12 ${
                                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                            }`}
                        >
                            <div className="flex-1">
                                <div className="text-8xl mb-6 text-center lg:text-left">
                                    {feature.icon}
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-white/80 mb-6">
                                    {feature.description}
                                </p>
                                <ul className="space-y-3">
                                    {feature.details.map((detail, detailIndex) => (
                                        <li key={detailIndex} className="text-white/70 flex items-start">
                                            <span className="w-2 h-2 bg-[#E0FE10] rounded-full mr-4 mt-2 flex-shrink-0"></span>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">{feature.icon}</div>
                                        <div className="text-white/60 text-sm">
                                            Visualización interactiva
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

Features.displayName = 'Features';