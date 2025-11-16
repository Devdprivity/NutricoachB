import { ImageWithFallback } from "./ImageWithFallback";
import { Zap, Shield, Users, TrendingUp } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: Zap,
      title: "Resultados Rápidos",
      description: "Ve cambios positivos en las primeras semanas con nuestro sistema de seguimiento inteligente",
      stat: "2-3 semanas",
      statLabel: "Primeros resultados"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Tus datos de salud están protegidos con encriptación de nivel bancario",
      stat: "SSL 256-bit",
      statLabel: "Encriptación"
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Únete a miles de usuarios que se motivan mutuamente cada día",
      stat: "50K+",
      statLabel: "Usuarios activos"
    },
    {
      icon: TrendingUp,
      title: "Progreso Medible",
      description: "Métricas detalladas para ver tu evolución y mantenerte motivado",
      stat: "15+",
      statLabel: "Indicadores"
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-2xl overflow-hidden border-4 border-[#1f1f1f]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1635545999375-057ee4013deb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMHdlbGxuZXNzfGVufDF8fHx8MTc2MzExMzkyNnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Wellness and Meditation"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a] to-[#00331e] opacity-20 blur-3xl -z-10"></div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-block bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f]">
              <span className="text-sm text-[#5ddc8a]">Por Qué Elegirnos</span>
            </div>
            <h2 className="text-4xl sm:text-5xl text-white">
              Más que una app, tu <span className="text-[#5ddc8a]">aliado de salud</span>
            </h2>
            <p className="text-lg text-gray-400">
              gidia.app combina tecnología avanzada con conocimiento nutricional para ofrecerte 
              una experiencia personalizada que se adapta a tu estilo de vida.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4 bg-[#121212] p-4 rounded-xl border border-[#1f1f1f]">
                <div className="w-12 h-12 rounded-lg bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Planes Personalizados</h4>
                  <p className="text-sm text-gray-400">
                    Algoritmos de IA analizan tu perfil para crear un plan único adaptado a tus necesidades
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-[#121212] p-4 rounded-xl border border-[#1f1f1f]">
                <div className="w-12 h-12 rounded-lg bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Análisis Avanzado</h4>
                  <p className="text-sm text-gray-400">
                    Visualiza patrones en tu comportamiento y recibe insights para mejorar constantemente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-[#121212] p-4 rounded-xl border border-[#1f1f1f]">
                <div className="w-12 h-12 rounded-lg bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💪</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Motivación Continua</h4>
                  <p className="text-sm text-gray-400">
                    Sistema de logros, retos y recordatorios que te mantienen enfocado en tus objetivos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-[#1f1f1f] p-6 rounded-2xl border border-[#1f1f1f] hover:border-[#5ddc8a] transition-all duration-300 group text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#121212] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#5ddc8a] transition-colors duration-300">
                  <Icon className="w-8 h-8 text-[#5ddc8a] group-hover:text-black transition-colors duration-300" />
                </div>
                <div className="text-[#5ddc8a] text-3xl mb-1 font-bold">{benefit.stat}</div>
                <div className="text-sm text-gray-500 mb-4">{benefit.statLabel}</div>
                <h4 className="mb-2 text-white font-semibold">{benefit.title}</h4>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

