import { Head } from '@inertiajs/react';

export default function Login() {

    return (
        <>
            <Head title="Iniciar Sesión - NutriCoach" />
            
            <div 
                className="min-h-screen flex items-center justify-center px-6 lg:px-8 relative overflow-hidden"
                style={{
                    backgroundImage: 'url(/img/modellogin.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Overlay con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1C2227]/80 via-[#1C2227]/60 to-[#E0FE10]/20"></div>
                
                {/* Contenido del login */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-16 h-16 bg-[#E0FE10] rounded-2xl flex items-center justify-center shadow-2xl">
                                <span className="text-3xl font-bold text-[#1C2227]">N</span>
                            </div>
                            <span className="text-3xl font-bold text-white">NutriCoach</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
                        <p className="text-white/80">Inicia sesión en tu cuenta</p>
                    </div>

                    {/* Formulario con efecto líquido - Solo Google */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                        {/* Google login */}
                        <div className="mb-6">
                            <a
                                href="/auth/google"
                                className="w-full flex justify-center items-center px-6 py-4 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                            >
                                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continuar con Google
                            </a>
                        </div>

                        {/* Información adicional */}
                        <div className="text-center">
                            <p className="text-white/70 text-sm mb-4">
                                Inicia sesión de forma rápida y segura con tu cuenta de Google
                            </p>
                            <div className="flex items-center justify-center text-white/50 text-xs">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Tus datos están protegidos
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}