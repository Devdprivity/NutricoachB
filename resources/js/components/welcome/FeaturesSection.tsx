import { Activity, Apple, Target, TrendingUp, Calendar, MessageCircle } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Activity,
      title: "Registro de Ejercicio",
      description: "Registra tus entrenamientos y actividad física diaria de forma sencilla y rápida.",
      color: "#5ddc8a"
    },
    {
      icon: Apple,
      title: "Plan Nutricional",
      description: "Recibe recomendaciones personalizadas según tus objetivos y preferencias alimenticias.",
      color: "#5ddc8a"
    },
    {
      icon: Target,
      title: "Metas Personalizadas",
      description: "Define y alcanza tus objetivos con planes adaptados a tu estilo de vida.",
      color: "#5ddc8a"
    },
    {
      icon: TrendingUp,
      title: "Seguimiento de Progreso",
      description: "Visualiza tu evolución con gráficos detallados y estadísticas en tiempo real.",
      color: "#5ddc8a"
    },
    {
      icon: Calendar,
      title: "Planificación Semanal",
      description: "Organiza tus comidas y entrenamientos con nuestro calendario inteligente.",
      color: "#5ddc8a"
    },
    {
      icon: MessageCircle,
      title: "Consejos Personalizados",
      description: "Recibe tips y motivación diaria como si tuvieras un coach personal.",
      color: "#5ddc8a"
    }
  ];

  return (
    <div id="features" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-4">
            <span className="text-sm text-[#5ddc8a]">Características</span>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 text-white">
            Todo lo que necesitas para alcanzar tus <span className="text-[#5ddc8a]">objetivos</span>
          </h2>
          <p className="text-lg text-gray-400">
            Una plataforma completa diseñada para ayudarte a mejorar tu salud y bienestar
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-[#1f1f1f] p-8 rounded-2xl border border-[#1f1f1f] hover:border-[#5ddc8a] transition-all duration-300 group"
              >
                <div className="bg-[#121212] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5ddc8a] transition-colors duration-300">
                  <Icon className="w-7 h-7 text-[#5ddc8a] group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="mb-3 text-white font-semibold">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

