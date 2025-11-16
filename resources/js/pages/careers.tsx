import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { Briefcase, Users, Heart, Zap, Globe, TrendingUp } from 'lucide-react';

export default function Careers() {
  const benefits = [
    {
      icon: Globe,
      title: "Trabajo Remoto",
      description: "Trabaja desde cualquier lugar del mundo"
    },
    {
      icon: TrendingUp,
      title: "Crecimiento",
      description: "Oportunidades de desarrollo profesional"
    },
    {
      icon: Heart,
      title: "Salud",
      description: "Seguro médico y beneficios de bienestar"
    },
    {
      icon: Zap,
      title: "Innovación",
      description: "Trabaja con tecnología de vanguardia"
    }
  ];

  return (
    <>
      <Head title="Carreras - gidia.app">
        <meta name="description" content="Únete al equipo de gidia.app. Estamos buscando talento apasionado por la tecnología y la salud." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <Users className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Únete al Equipo</span>
            </div>
            
            <div className="mb-12">
              <div className="w-24 h-24 rounded-2xl bg-[#5ddc8a]/20 flex items-center justify-center mx-auto mb-8">
                <Briefcase className="w-12 h-12 text-[#5ddc8a]" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Trabaja en <span className="text-[#5ddc8a]">gidia.app</span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                Estamos construyendo el futuro del fitness y la nutrición personalizada. 
                Si te apasiona la tecnología y quieres hacer un impacto real en la vida de las personas, 
                queremos conocerte.
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-8">
                ¿Por qué <span className="text-[#5ddc8a]">gidia.app</span>?
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-[#5ddc8a]" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Openings */}
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 lg:p-12 border border-[#5ddc8a]/20 mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Posiciones Abiertas</h2>
              <p className="text-gray-300 mb-6">
                Actualmente estamos en proceso de expansión. Próximamente publicaremos nuevas oportunidades.
              </p>
              
              <div className="bg-[#1f1f1f] rounded-xl p-6 mb-6">
                <p className="text-gray-400 text-sm mb-4">
                  Mientras tanto, si crees que puedes aportar valor a gidia.app, envíanos tu CV y portafolio a:
                </p>
                <a 
                  href="mailto:careers@gidia.app" 
                  className="text-[#5ddc8a] hover:underline font-semibold text-lg"
                >
                  careers@gidia.app
                </a>
              </div>

              <p className="text-gray-400 text-sm">
                Incluye en tu email: posición de interés, experiencia relevante y por qué quieres 
                unirte a gidia.app.
              </p>
            </div>

            {/* Culture */}
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f] mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Nuestra Cultura</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">🚀</span> Innovación
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Fomentamos la creatividad y experimentación con nuevas tecnologías
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">🤝</span> Colaboración
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Trabajamos en equipo, compartiendo conocimientos y apoyándonos mutuamente
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">⚖️</span> Balance
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Valoramos el equilibrio entre vida personal y profesional
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">💪</span> Impacto
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Tu trabajo ayudará a miles de personas a mejorar su salud
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f] mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">¿Preguntas?</h2>
              <p className="text-gray-400 mb-4">
                Si tienes preguntas sobre trabajar en gidia.app, contáctanos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-400">
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:careers@gidia.app" className="text-[#5ddc8a] hover:underline">
                    careers@gidia.app
                  </a>
                </p>
                <p className="text-gray-400">
                  <strong className="text-white">Ubicación:</strong> Santiago de Chile, Chile (Remoto disponible)
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="pt-8">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-[#5ddc8a] hover:text-[#4bc977] transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

