import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Benefits = forwardRef<HTMLDivElement>((props, ref) => {
    const benefitsRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animación del título
            gsap.fromTo(benefitsRef.current?.querySelector('h2'),
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

            // Animación de las tarjetas escalonada
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    gsap.fromTo(card,
                        {
                            y: 100,
                            opacity: 0,
                            scale: 0.8
                        },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1.2,
                            ease: 'power3.out',
                            delay: index * 0.2,
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

    const benefits = [
        {
            title: "Análisis Calórico Inteligente",
            description: "Desglosa cada comida en componentes nutricionales, calculando calorías totales y macronutrientes con precisión.",
            image: "🥗",
            features: ["Calorías por plato", "Macronutrientes", "Comparación con objetivos", "Evaluación de adherencia"]
        },
        {
            title: "Base de Datos Nutricional Completa",
            description: "Información detallada de proteínas, carbohidratos, grasas saludables y suplementos deportivos.",
            image: "🍗",
            features: ["Proteínas (pollo, huevos)", "Carbohidratos (papa, batata)", "Grasas saludables", "Suplementos deportivos"]
        },
        {
            title: "Sistema de Evaluación Adaptativo",
            description: "Código de colores inteligente que evalúa cumplimiento considerando factores contextuales.",
            image: "📊",
            features: ["Verde: Dentro del rango", "Amarillo: Ligeramente fuera", "Rojo: Significativamente fuera", "Tolerancia contextual"]
        },
        {
            title: "Inteligencia Emocional Integrada",
            description: "Reconoce patrones emocionales y ofrece estrategias para manejar antojos y días difíciles.",
            image: "🧠",
            features: ["Estrategias para antojos", "Apoyo en días difíciles", "Motivación personalizada", "Feedback constructivo"]
        }
    ];

    return (
        <section
            ref={ref}
            className="py-12 px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <div ref={benefitsRef} className="text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                        Beneficios de
                        <span className="block bg-gradient-to-r from-[#E0FE10] to-white bg-clip-text text-transparent">
                            gidia.app
                        </span>
                    </h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        Un sistema integral que combina precisión nutricional con inteligencia emocional para tu transformación corporal
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            ref={(el) => cardsRef.current[index] = el}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                        >
                            <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                                {benefit.image}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 text-center">
                                {benefit.title}
                            </h3>
                            <p className="text-white/80 text-sm mb-4 text-center">
                                {benefit.description}
                            </p>
                            <ul className="space-y-2">
                                {benefit.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="text-white/70 text-sm flex items-center">
                                        <span className="w-2 h-2 bg-[#E0FE10] rounded-full mr-3 flex-shrink-0"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

Benefits.displayName = 'Benefits';
