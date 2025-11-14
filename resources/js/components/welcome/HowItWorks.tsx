import { ImageWithFallback } from "./ImageWithFallback";
import { UserPlus, Target, Activity, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Crea tu Perfil",
      description: "Completa tu información y preferencias para personalizar tu experiencia"
    },
    {
      icon: Target,
      title: "Define tus Metas",
      description: "Establece objetivos realistas y alcanzables según tu estilo de vida"
    },
    {
      icon: Activity,
      title: "Registra tu Actividad",
      description: "Lleva el control de tus ejercicios, comidas y progreso diario"
    },
    {
      icon: Trophy,
      title: "Alcanza tus Objetivos",
      description: "Recibe motivación y consejos para mantener tu rutina y lograr tus metas"
    }
  ];

  return (
    <div id="how-it-works" className="py-20 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00331e] to-transparent opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-4">
            <span className="text-sm text-[#5ddc8a]">Cómo Funciona</span>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 text-white">
            Comienza tu viaje en <span className="text-[#5ddc8a]">4 simples pasos</span>
          </h2>
          <p className="text-lg text-gray-400">
            Es fácil comenzar y aún más fácil mantener el ritmo
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#5ddc8a] to-transparent"></div>
                )}
                
                <div className="relative z-10">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#121212] border-4 border-[#1f1f1f] mb-6 relative">
                    <Icon className="w-10 h-10 text-[#5ddc8a]" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#5ddc8a] flex items-center justify-center">
                      <span className="text-black font-bold">{index + 1}</span>
                    </div>
                  </div>
                  
                  <h3 className="mb-3 text-white font-semibold">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Image Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl text-white">
              Seguimiento completo de tu <span className="text-[#5ddc8a]">progreso</span>
            </h3>
            <p className="text-lg text-gray-400">
              Visualiza tus avances con gráficos detallados, recibe recomendaciones personalizadas 
              y mantente motivado con nuestro sistema de logros y recordatorios inteligentes.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#5ddc8a] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Análisis Inteligente</h4>
                  <p className="text-gray-400">
                    Algoritmos avanzados analizan tu progreso y te dan consejos personalizados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#5ddc8a] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Sincronización Multi-Dispositivo</h4>
                  <p className="text-gray-400">
                    Accede desde web o app móvil, tus datos siempre sincronizados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#5ddc8a] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Recordatorios Personalizados</h4>
                  <p className="text-gray-400">
                    Mantente en el camino con notificaciones inteligentes adaptadas a tu rutina
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden border-4 border-[#1f1f1f]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1544021601-3e5723f9d333?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrb3V0JTIwZXhlcmNpc2UlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NjMxNTc4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Workout and Exercise"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#5ddc8a] to-[#00331e] opacity-20 blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

