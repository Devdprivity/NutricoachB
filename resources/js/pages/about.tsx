import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { Heart, Target, Users, Zap, Award, Globe } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Salud Primero",
      description: "Tu bienestar es nuestra máxima prioridad. Diseñamos cada función pensando en tu salud integral."
    },
    {
      icon: Target,
      title: "Resultados Reales",
      description: "Nos enfocamos en transformaciones sostenibles basadas en ciencia y datos, no en promesas vacías."
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Creemos en el poder del apoyo mutuo. Juntos somos más fuertes en el camino hacia nuestras metas."
    },
    {
      icon: Zap,
      title: "Innovación",
      description: "Utilizamos tecnología de IA de vanguardia para personalizar tu experiencia y maximizar resultados."
    }
  ];

  const team = [
    {
      name: "Equipo de Desarrollo",
      role: "Tecnología & IA",
      description: "Expertos en inteligencia artificial y desarrollo de software dedicados a crear la mejor experiencia."
    },
    {
      name: "Equipo de Nutrición",
      role: "Salud & Bienestar",
      description: "Nutricionistas y profesionales de la salud que supervisan nuestros algoritmos y recomendaciones."
    },
    {
      name: "Equipo de Diseño",
      role: "Experiencia de Usuario",
      description: "Diseñadores UX/UI enfocados en hacer que tu viaje de salud sea intuitivo y motivador."
    }
  ];

  return (
    <>
      <Head title="Sobre Nosotros - gidia.app">
        <meta name="description" content="Conoce la historia, misión y equipo detrás de gidia.app. Tu aliado en el camino hacia una vida más saludable." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <Heart className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Nuestra Historia</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sobre <span className="text-[#5ddc8a]">gidia.app</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Nacimos con una misión clara: hacer que el seguimiento nutricional y el fitness 
              sean accesibles, personalizados y efectivos para todos.
            </p>
          </div>

          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 lg:p-12 border border-[#5ddc8a]/20">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Nuestra Misión</h2>
              <p className="text-lg text-gray-300 leading-relaxed text-center max-w-3xl mx-auto">
                Empoderar a las personas para que tomen control de su salud mediante tecnología inteligente, 
                información precisa y apoyo continuo. Creemos que cada persona merece acceso a herramientas 
                que faciliten un estilo de vida saludable sin complicaciones ni restricciones extremas.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Nuestros <span className="text-[#5ddc8a]">Valores</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300 text-center"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-[#5ddc8a]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Nuestro <span className="text-[#5ddc8a]">Equipo</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5ddc8a] to-[#4bc977] flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 text-center">{member.name}</h3>
                  <p className="text-[#5ddc8a] text-sm mb-3 text-center">{member.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed text-center">{member.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">En Números</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#5ddc8a] mb-2">1000+</div>
                  <div className="text-gray-400 text-sm">Usuarios Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#5ddc8a] mb-2">50K+</div>
                  <div className="text-gray-400 text-sm">Entrenamientos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#5ddc8a] mb-2">100K+</div>
                  <div className="text-gray-400 text-sm">Comidas Registradas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#5ddc8a] mb-2">4.9★</div>
                  <div className="text-gray-400 text-sm">Valoración</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-[#5ddc8a]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Nuestra Ubicación</h2>
                  <p className="text-gray-400 mb-2">
                    <strong className="text-white">Oficinas:</strong> Santiago de Chile, Chile
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-white">Contacto:</strong>{' '}
                    <a href="mailto:info@gidia.app" className="text-[#5ddc8a] hover:underline">
                      info@gidia.app
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center pt-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#5ddc8a] hover:text-[#4bc977] transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

