import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const UserProfile = forwardRef<HTMLDivElement>((props, ref) => {
    const profileRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animación del título
            gsap.fromTo(profileRef.current?.querySelector('h2'),
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

            // Animación de las estadísticas
            statsRef.current.forEach((stat, index) => {
                if (stat) {
                    gsap.fromTo(stat,
                        {
                            scale: 0.8,
                            opacity: 0
                        },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 1,
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

    const userStats = [
        {
            title: "Perfil de Usuario",
            description: "Adultos con sobrepeso u obesidad",
            value: "IMC >30",
            icon: "👤",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Objetivo de Pérdida",
            description: "Meta de transformación corporal",
            value: "20-30 kg",
            icon: "🎯",
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Compromiso Temporal",
            description: "Cambio de hábitos a largo plazo",
            value: "8-12 meses",
            icon: "⏰",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Supervisión Médica",
            description: "Acompañamiento profesional",
            value: "Recomendado",
            icon: "👨‍⚕️",
            color: "from-orange-500 to-red-500"
        }
    ];

    return (
        <section
            ref={ref}
            className="py-12 px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <div ref={profileRef} className="text-center mb-16">
                    <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                        Perfil de Usuario
                        <span className="block bg-gradient-to-r from-[#E0FE10] to-white bg-clip-text text-transparent">
                            Tipo
                        </span>
                    </h2>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        El sistema está calibrado para usuarios comprometidos con su transformación corporal sostenible
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {userStats.map((stat, index) => (
                        <div
                            key={index}
                            ref={(el) => statsRef.current[index] = el}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                        >
                            <div className="text-center">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {stat.icon}
                                </div>
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-2xl font-bold`}>
                                    {stat.value}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {stat.title}
                                </h3>
                                <p className="text-white/80 text-sm">
                                    {stat.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Información adicional */}
                <div className="mt-16 text-center">
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Consideración Importante
                        </h3>
                        <p className="text-lg text-white/80 leading-relaxed">
                            Este es un sistema de apoyo educativo que <strong className="text-[#E0FE10]">NO reemplaza</strong> la supervisión médica profesional. 
                            Siempre se recomienda consultar con nutricionistas, médicos y entrenadores certificados antes de seguir cualquier plan nutricional o de suplementación.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
});

UserProfile.displayName = 'UserProfile';
