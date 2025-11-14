import { ImageWithFallback } from "./ImageWithFallback";
import { ArrowRight, Smartphone, Globe } from "lucide-react";
import { Link } from "@inertiajs/react";

export function CTASection() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Main CTA Card */}
        <div className="bg-[#1f1f1f] rounded-3xl border border-[#1f1f1f] overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #5ddc8a 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center p-8 md:p-16 relative z-10">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl text-white">
                  Comienza tu transformación <span className="text-[#5ddc8a]">hoy mismo</span>
                </h2>
                <p className="text-lg text-gray-400">
                  Únete a miles de usuarios que ya están alcanzando sus metas de salud y bienestar. 
                  Descarga la app o accede desde tu navegador.
                </p>
              </div>

              {/* Platforms */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#121212] p-4 rounded-xl border border-[#1f1f1f]">
                  <div className="bg-[#5ddc8a] p-3 rounded-lg">
                    <Smartphone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">App Móvil</h4>
                    <p className="text-sm text-gray-400">Disponible en iOS y Android</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#121212] p-4 rounded-xl border border-[#1f1f1f]">
                  <div className="bg-[#5ddc8a] p-3 rounded-lg">
                    <Globe className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Plataforma Web</h4>
                    <p className="text-sm text-gray-400">Accede desde cualquier navegador</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="bg-[#5ddc8a] text-black px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group hover:bg-[#4bc977] font-medium">
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="bg-transparent text-[#5ddc8a] border-2 border-[#5ddc8a] px-8 py-4 rounded-lg transition-colors hover:bg-[#5ddc8a]/10 font-medium">
                  Ver Demo
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Sin tarjeta de crédito requerida • Cancela en cualquier momento
              </p>
            </div>

            {/* Right Content - Image */}
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden border-4 border-[#1f1f1f]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGZvb2QlMjBwaG9uZXxlbnwxfHx8fDE3NjMxNTgwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Person taking photo of food"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tl from-[#5ddc8a] to-[#00331e] opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-[#121212] p-6 rounded-xl border border-[#1f1f1f] text-center">
            <div className="text-[#5ddc8a] text-2xl mb-2 font-bold">✓</div>
            <h4 className="text-white font-semibold mb-1">Prueba Gratuita</h4>
            <p className="text-sm text-gray-400">14 días sin compromiso</p>
          </div>
          <div className="bg-[#121212] p-6 rounded-xl border border-[#1f1f1f] text-center">
            <div className="text-[#5ddc8a] text-2xl mb-2 font-bold">✓</div>
            <h4 className="text-white font-semibold mb-1">Soporte 24/7</h4>
            <p className="text-sm text-gray-400">Estamos aquí para ayudarte</p>
          </div>
          <div className="bg-[#121212] p-6 rounded-xl border border-[#1f1f1f] text-center">
            <div className="text-[#5ddc8a] text-2xl mb-2 font-bold">✓</div>
            <h4 className="text-white font-semibold mb-1">Actualizaciones Gratis</h4>
            <p className="text-sm text-gray-400">Nuevas funciones cada mes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

