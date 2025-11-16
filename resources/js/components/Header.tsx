import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { forwardRef, useEffect, useState } from 'react';

export const Header = forwardRef<HTMLElement>((props, ref) => {
    const { auth } = usePage<SharedData>().props;
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            
            // Ocultar header cuando se haga scroll hacia abajo (más de 200px)
            if (scrollY > 200) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
        };

        // Ejecutar una vez al cargar
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            ref={ref}
            className="fixed top-0 z-50 w-full border-b border-transparent bg-transparent backdrop-blur-none"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                {/* Logo - Se oculta hacia la izquierda */}
                <div
                    className={`flex items-center gap-3 transition-all duration-700 ease-in-out ${
                        isHidden ? '-translate-x-[200%] opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                        <span className="text-xl font-bold text-white">
                            G
                        </span>
                    </div>
                    <span className="text-xl font-bold text-white">
                        gidia.app
                    </span>
                </div>

                {/* Actions - Se ocultan hacia la derecha */}
                <div
                    className={`flex items-center gap-4 transition-all duration-700 ease-in-out ${
                        isHidden ? 'translate-x-[200%] opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                >
                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-white/30"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            {/* <Link
                                href={login()}
                                className="hidden text-sm font-medium text-white transition-colors hover:text-white/80 sm:block"
                            >
                                Iniciar Sesión
                            </Link> */}
                            <a
                                href="#"
                                className="rounded-full bg-[#E0FE10] px-6 py-2.5 text-sm font-semibold text-[#1C2227] transition-all hover:scale-105 hover:shadow-lg"
                            >
                                Descargar APK
                            </a>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';
