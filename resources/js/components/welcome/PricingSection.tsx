import { Check, Star } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      name: "Gratis",
      price: "$0",
      period: "para siempre",
      description: "Perfecto para comenzar tu viaje de salud",
      features: [
        "Registro básico de ejercicios",
        "Seguimiento de calorías",
        "3 metas personalizadas",
        "Estadísticas semanales",
        "Acceso a la comunidad"
      ],
      cta: "Comenzar Gratis",
      popular: false,
      outline: true
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "por mes",
      description: "Maximiza tus resultados con todas las funciones",
      features: [
        "Todo lo del plan Gratis",
        "Metas ilimitadas",
        "Planes nutricionales personalizados",
        "Estadísticas y análisis avanzados",
        "Consejos diarios personalizados",
        "Sincronización con smartwatch",
        "Sin anuncios",
        "Soporte prioritario"
      ],
      cta: "Comenzar Prueba Gratis",
      popular: true,
      outline: false
    },
    {
      name: "Familiar",
      price: "$19.99",
      period: "por mes",
      description: "Comparte los beneficios con tu familia",
      features: [
        "Todo lo del plan Premium",
        "Hasta 5 perfiles familiares",
        "Panel de control familiar",
        "Retos y metas grupales",
        "Descuento en renovación",
        "Acceso exclusivo a contenido"
      ],
      cta: "Comenzar Ahora",
      popular: false,
      outline: true
    }
  ];

  return (
    <div id="pricing" className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00331e] to-transparent opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-4">
            <span className="text-sm text-[#5ddc8a]">Precios Simples</span>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 text-white">
            Elige el plan perfecto para <span className="text-[#5ddc8a]">ti</span>
          </h2>
          <p className="text-lg text-gray-400">
            Comienza gratis y actualiza cuando estés listo. Sin contratos, cancela cuando quieras.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#1f1f1f] rounded-2xl border p-8 transition-all duration-300 relative ${
                plan.popular
                  ? "border-[#5ddc8a] shadow-2xl shadow-[#5ddc8a]/20 scale-105"
                  : "border-[#1f1f1f] hover:border-[#5ddc8a]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#5ddc8a] text-black px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-black" />
                    <span className="text-sm font-medium">Más Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl mb-2 text-white font-semibold">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl text-[#5ddc8a] font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#5ddc8a] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg transition-colors font-medium ${
                  plan.outline
                    ? "bg-transparent text-[#5ddc8a] border-2 border-[#5ddc8a] hover:bg-[#5ddc8a]/10"
                    : "bg-[#5ddc8a] text-black hover:bg-[#4bc977]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl text-center mb-8 text-white">
            Preguntas <span className="text-[#5ddc8a]">Frecuentes</span>
          </h3>
          
          <div className="space-y-4">
            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-[#1f1f1f]">
              <h4 className="mb-2 text-white font-semibold">¿Puedo cambiar de plan en cualquier momento?</h4>
              <p className="text-sm text-gray-400">
                Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplican inmediatamente.
              </p>
            </div>

            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-[#1f1f1f]">
              <h4 className="mb-2 text-white font-semibold">¿Qué incluye la prueba gratuita?</h4>
              <p className="text-sm text-gray-400">
                La prueba gratuita de 14 días te da acceso completo al plan Premium sin necesidad de tarjeta de crédito.
              </p>
            </div>

            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-[#1f1f1f]">
              <h4 className="mb-2 text-white font-semibold">¿Ofrecen descuentos para estudiantes?</h4>
              <p className="text-sm text-gray-400">
                Sí, ofrecemos 50% de descuento para estudiantes verificados. Contáctanos para más detalles.
              </p>
            </div>

            <div className="bg-[#1f1f1f] p-6 rounded-xl border border-[#1f1f1f]">
              <h4 className="mb-2 text-white font-semibold">¿Qué métodos de pago aceptan?</h4>
              <p className="text-sm text-gray-400">
                Aceptamos tarjetas de crédito/débito, PayPal, y transferencias bancarias. Todos los pagos son seguros.
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f] max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#5ddc8a] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-black font-bold">✓</span>
          </div>
          <h4 className="text-xl mb-2 text-white font-semibold">Garantía de 30 días</h4>
          <p className="text-gray-400">
            Si no estás satisfecho con NutriCoach, te devolvemos tu dinero sin preguntas. 
            Tu satisfacción es nuestra prioridad.
          </p>
        </div>
      </div>
    </div>
  );
}

