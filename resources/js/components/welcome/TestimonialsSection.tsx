import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "María González",
      role: "Perdió 15kg en 6 meses",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      rating: 5,
      text: "NutriCoach cambió completamente mi vida. Los consejos personalizados y el seguimiento diario me mantuvieron motivada. ¡Ahora me siento mejor que nunca!"
    },
    {
      name: "Carlos Ramírez",
      role: "Ganó masa muscular",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5,
      text: "La mejor app para hacer seguimiento de mis entrenamientos. El sistema de metas me ayudó a mantenerme enfocado y los resultados hablan por sí solos."
    },
    {
      name: "Ana Martínez",
      role: "Mejoró hábitos alimenticios",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      rating: 5,
      text: "Como madre ocupada, necesitaba algo simple pero efectivo. NutriCoach me dio el balance perfecto entre nutrición y ejercicio."
    }
  ];

  return (
    <div id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-4">
            <span className="text-sm text-[#5ddc8a]">Testimonios</span>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 text-white">
            Lo que dicen nuestros <span className="text-[#5ddc8a]">usuarios</span>
          </h2>
          <p className="text-lg text-gray-400">
            Miles de personas ya están transformando sus vidas con gidia.app
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#1f1f1f] p-8 rounded-2xl border border-[#1f1f1f] hover:border-[#5ddc8a] transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20">
                <Quote className="w-12 h-12 text-[#5ddc8a]" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#5ddc8a] text-[#5ddc8a]" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-300 mb-6 relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#121212] border-2 border-[#5ddc8a] overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 bg-[#121212] p-8 rounded-2xl border border-[#1f1f1f]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-[#5ddc8a] text-3xl mb-2 font-bold">98%</div>
              <div className="text-gray-400">Satisfacción</div>
            </div>
            <div>
              <div className="text-[#5ddc8a] text-3xl mb-2 font-bold">50K+</div>
              <div className="text-gray-400">Usuarios</div>
            </div>
            <div>
              <div className="text-[#5ddc8a] text-3xl mb-2 font-bold">1M+</div>
              <div className="text-gray-400">Entrenamientos</div>
            </div>
            <div>
              <div className="text-[#5ddc8a] text-3xl mb-2 font-bold">4.9★</div>
              <div className="text-gray-400">Rating Promedio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

