import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Benefits } from '@/components/landing/Benefits';
import { Features } from '@/components/landing/Features';
import { Philosophy } from '@/components/landing/Philosophy';
import { UserProfile } from '@/components/landing/UserProfile';
import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

declare global {
    interface Window {
        ScrollyVideo: new (config: { scrollyVideoContainer: string; src: string }) => unknown;
    }
}

export default function Welcome() {
    const headerRef = useRef<HTMLElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const philosophyRef = useRef<HTMLDivElement>(null);
    const userProfileRef = useRef<HTMLDivElement>(null);
    const downloadButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Cargar ScrollyVideo desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/scrolly-video@latest/dist/scrolly-video.js';
        script.onload = () => {
            // Inicializar ScrollyVideo después de cargar el script
            if (window.ScrollyVideo) {
                new window.ScrollyVideo({
                    scrollyVideoContainer: "scrolly-video",
                    src: "/video/videotemplated.mp4"
                });
            }
        };
        document.head.appendChild(script);

        // Animaciones de componentes
        const ctx = gsap.context(() => {
            // Header animation
            gsap.from(headerRef.current, {
                y: -100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });

            // Botón de descarga animation
            gsap.fromTo(downloadButtonRef.current,
                {
                    scale: 0,
                    opacity: 0,
                    rotation: 180
                },
                {
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 1.5,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: downloadButtonRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        return () => {
            ctx.revert();
        };
    }, []);

    return (
        <>
            <Head title="NutriCoach - Tu Coach de Transformación Corporal">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="font-['Inter',sans-serif] relative">
                {/* ScrollyVideo como fondo fijo */}
                <div
                    id="scrolly-video"
                    className="fixed inset-0 w-full h-screen z-0"
                />

                {/* Contenido superpuesto */}
                <div className="relative z-10">
                    <Header ref={headerRef} />
                    <Hero ref={heroRef} />
                    <Benefits ref={benefitsRef} />
                    <Features ref={featuresRef} />
                    <Philosophy ref={philosophyRef} />
                    <UserProfile ref={userProfileRef} />
                    
                    {/* Botón final centrado */}
                    <section className="py-16 px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto text-center">
                            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 inline-block">
                                <button 
                                    ref={downloadButtonRef}
                                    className="px-16 py-8 bg-[#E0FE10] text-[#1C2227] font-bold text-3xl rounded-2xl hover:bg-[#E0FE10]/90 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
                                >
                                    📱 Descargar APK
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Espacio para permitir scroll del video - fuera del contenedor de contenido */}
                <div className="h-[20vh]"></div>
            </div>
        </>
    );
}
