import { ImageWithFallback } from "./ImageWithFallback";
import { Smartphone, Monitor, Clock, Bell, BarChart3, Heart } from "lucide-react";

export function AppShowcase() {
  const appFeatures = [
    {
      icon: Clock,
      title: "Seguimiento en Tiempo Real",
      description: "Registra tu actividad al instante desde cualquier dispositivo"
    },
    {
      icon: Bell,
      title: "Recordatorios Inteligentes",
      description: "Notificaciones personalizadas para mantener tu rutina"
    },
    {
      icon: BarChart3,
      title: "Estadísticas Detalladas",
      description: "Visualiza tu progreso con gráficos y métricas avanzadas"
    },
    {
      icon: Heart,
      title: "Salud Integral",
      description: "Monitoreo completo de nutrición, ejercicio y bienestar"
    }
  ];

  return (
    <div id="apps" className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00331e] via-transparent to-[#00331e] opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-4">
            <span className="text-sm text-[#5ddc8a]">Disponible en todas las plataformas</span>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 text-white">
            Lleva tu salud en el <span className="text-[#5ddc8a]">bolsillo</span>
          </h2>
          <p className="text-lg text-gray-400">
            Accede desde tu smartphone, tablet o computadora. Tus datos siempre sincronizados.
          </p>
        </div>

        {/* Main Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Phone Mockups */}
          <div className="relative">
            {/* Central Phone */}
            <div className="relative z-20 mx-auto max-w-sm">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative bg-[#1f1f1f] rounded-[3rem] p-3 shadow-2xl border-4 border-[#2a2a2a]">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-30"></div>
                  
                  {/* Screen */}
                  <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1762768767074-e491f1eebdfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYXBwJTIwc2NyZWVufGVufDF8fHx8MTc2MzE1MjU4MHww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="NutriCoach App"
                      className="w-full h-auto"
                    />
                    
                    {/* App UI Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 px-6 pt-3 flex justify-between text-white text-xs z-20">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-3 border border-white rounded-sm relative">
                          <div className="absolute inset-0.5 bg-white rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#5ddc8a] opacity-20 blur-3xl -z-10"></div>
              </div>
            </div>

            {/* Left Phone - Smaller */}
            <div className="absolute left-0 top-1/4 z-10 hidden md:block transform -rotate-12 scale-75 opacity-60">
              <div className="bg-[#1f1f1f] rounded-[2.5rem] p-2 shadow-xl border-2 border-[#2a2a2a] w-48">
                <div className="rounded-[2rem] overflow-hidden bg-black h-96">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1670164747721-d3500ef757a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb24lMjBmb29kJTIwaGVhbHRoeXxlbnwxfHx8fDE3NjMxNTgwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Nutrition Tracking"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Phone - Smaller */}
            <div className="absolute right-0 top-1/3 z-10 hidden md:block transform rotate-12 scale-75 opacity-60">
              <div className="bg-[#1f1f1f] rounded-[2.5rem] p-2 shadow-xl border-2 border-[#2a2a2a] w-48">
                <div className="rounded-[2rem] overflow-hidden bg-black h-96">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1609405985534-c7455cde5d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBwaG9uZSUyMG1vY2t1cHxlbnwxfHx8fDE3NjMxNTgwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Mobile App"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-3xl text-white">
                <span className="text-[#5ddc8a]">Apps nativas</span> para iOS y Android
              </h3>
              <p className="text-lg text-gray-400">
                Experiencia optimizada en cada plataforma con diseño intuitivo y rendimiento superior.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {appFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-[#121212] p-6 rounded-xl border border-[#1f1f1f] hover:border-[#5ddc8a] transition-all duration-300 group"
                  >
                    <div className="bg-[#1f1f1f] w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#5ddc8a] transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#5ddc8a] group-hover:text-black transition-colors duration-300" />
                    </div>
                    <h4 className="mb-2 text-white font-semibold">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Platform Icons */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-3 bg-[#1f1f1f] px-6 py-3 rounded-xl border border-[#1f1f1f]">
                <Smartphone className="w-5 h-5 text-[#5ddc8a]" />
                <span className="text-white">iOS & Android</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1f1f1f] px-6 py-3 rounded-xl border border-[#1f1f1f]">
                <Monitor className="w-5 h-5 text-[#5ddc8a]" />
                <span className="text-white">Web App</span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="bg-[#5ddc8a] text-black px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-[#4bc977] font-medium">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-black/70">Descargar en</div>
                  <div className="text-sm">App Store</div>
                </div>
              </button>

              <button className="bg-transparent text-[#5ddc8a] border-2 border-[#5ddc8a] px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-[#5ddc8a]/10 font-medium">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-[#5ddc8a]/70">Descarga en</div>
                  <div className="text-sm">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="bg-[#1f1f1f] rounded-2xl border border-[#1f1f1f] p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl mb-4 text-white">
              Todas las plataformas, <span className="text-[#5ddc8a]">una experiencia</span>
            </h3>
            <p className="text-gray-400">
              Sin importar el dispositivo que uses, tendrás acceso a todas tus funciones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[#1f1f1f] flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-[#5ddc8a]" />
              </div>
              <h4 className="text-white font-semibold">Aplicación Móvil</h4>
              <p className="text-sm text-gray-400">
                Diseñada específicamente para iOS y Android con todas las funciones optimizadas
              </p>
              <div className="pt-2">
                <span className="inline-block bg-[#5ddc8a]/20 text-[#5ddc8a] px-3 py-1 rounded-full text-sm">
                  Nativa
                </span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[#1f1f1f] flex items-center justify-center mx-auto">
                <Monitor className="w-8 h-8 text-[#5ddc8a]" />
              </div>
              <h4 className="text-white font-semibold">Plataforma Web</h4>
              <p className="text-sm text-gray-400">
                Accede desde cualquier navegador sin necesidad de instalación
              </p>
              <div className="pt-2">
                <span className="inline-block bg-[#5ddc8a]/20 text-[#5ddc8a] px-3 py-1 rounded-full text-sm">
                  PWA
                </span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[#1f1f1f] flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#5ddc8a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <h4 className="text-white font-semibold">Sincronización</h4>
              <p className="text-sm text-gray-400">
                Tus datos se sincronizan automáticamente en todos tus dispositivos
              </p>
              <div className="pt-2">
                <span className="inline-block bg-[#5ddc8a]/20 text-[#5ddc8a] px-3 py-1 rounded-full text-sm">
                  Cloud
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

