import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { Cookie, Settings, Shield, BarChart3 } from 'lucide-react';

export default function Cookies() {
  const cookieTypes = [
    {
      icon: Shield,
      title: "Cookies Esenciales",
      description: "Necesarias para el funcionamiento básico del sitio",
      examples: [
        "Mantener tu sesión activa",
        "Recordar tus preferencias de idioma",
        "Seguridad y autenticación",
        "Funcionalidad del carrito de compras"
      ],
      required: true
    },
    {
      icon: BarChart3,
      title: "Cookies Analíticas",
      description: "Nos ayudan a entender cómo usas el sitio",
      examples: [
        "Páginas más visitadas",
        "Tiempo de permanencia",
        "Rutas de navegación",
        "Dispositivos utilizados"
      ],
      required: false
    },
    {
      icon: Settings,
      title: "Cookies de Funcionalidad",
      description: "Mejoran tu experiencia personalizada",
      examples: [
        "Recordar configuraciones de cuenta",
        "Preferencias de visualización",
        "Contenido personalizado",
        "Funciones de redes sociales"
      ],
      required: false
    }
  ];

  return (
    <>
      <Head title="Política de Cookies - gidia.app">
        <meta name="description" content="Conoce cómo gidia.app utiliza cookies y tecnologías similares para mejorar tu experiencia." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <Cookie className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Última actualización: 16 de noviembre de 2025</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Política de <span className="text-[#5ddc8a]">Cookies</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Esta política explica qué son las cookies, cómo las usamos y cómo puedes controlarlas 
              en gidia.app.
            </p>
          </div>

          {/* What are Cookies */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-4">¿Qué son las Cookies?</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas 
                un sitio web. Nos ayudan a recordar tus preferencias, mejorar tu experiencia y analizar cómo 
                se utiliza nuestro servicio.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Las cookies pueden ser "de sesión" (se eliminan cuando cierras el navegador) o "persistentes" 
                (permanecen hasta que caducan o las eliminas manualmente).
              </p>
            </div>
          </div>

          {/* Cookie Types */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Tipos de <span className="text-[#5ddc8a]">Cookies</span> que Usamos
            </h2>
            
            <div className="space-y-6">
              {cookieTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div 
                    key={index}
                    className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#5ddc8a]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{type.title}</h3>
                          {type.required && (
                            <span className="bg-[#5ddc8a]/20 text-[#5ddc8a] text-xs px-2 py-1 rounded-full">
                              Requeridas
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 mb-4">{type.description}</p>
                      </div>
                    </div>
                    
                    <div className="ml-16">
                      <h4 className="text-sm font-semibold text-white mb-2">Ejemplos de uso:</h4>
                      <ul className="space-y-2">
                        {type.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-gray-400 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0"></span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Third Party Cookies */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-4">Cookies de Terceros</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Algunos de nuestros socios de confianza también pueden establecer cookies cuando usas gidia.app:
              </p>
              <ul className="space-y-3">
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  <span><strong className="text-white">Google Analytics:</strong> Para analizar el tráfico y uso del sitio</span>
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  <span><strong className="text-white">Stripe:</strong> Para procesar pagos de forma segura</span>
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  <span><strong className="text-white">Google OAuth:</strong> Para autenticación con tu cuenta de Google</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Cookie Control */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 border border-[#5ddc8a]/20">
              <h2 className="text-2xl font-bold text-white mb-4">Cómo Controlar las Cookies</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Tienes control total sobre las cookies. Puedes:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  <span>Aceptar o rechazar cookies no esenciales desde nuestro banner de cookies</span>
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  <span>Configurar tu navegador para bloquear o eliminar cookies</span>
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  <span>Cambiar tus preferencias en cualquier momento desde la configuración de tu cuenta</span>
                </li>
              </ul>
              
              <div className="bg-[#1f1f1f] rounded-xl p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Nota:</strong> Bloquear cookies esenciales puede afectar 
                  la funcionalidad del sitio y algunas características pueden no estar disponibles.
                </p>
              </div>
            </div>
          </div>

          {/* Browser Settings */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-4">Configuración del Navegador</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                La mayoría de los navegadores te permiten controlar las cookies a través de su configuración:
              </p>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">
                  • <strong className="text-white">Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
                </li>
                <li className="text-gray-400 text-sm">
                  • <strong className="text-white">Firefox:</strong> Opciones → Privacidad y seguridad
                </li>
                <li className="text-gray-400 text-sm">
                  • <strong className="text-white">Safari:</strong> Preferencias → Privacidad
                </li>
                <li className="text-gray-400 text-sm">
                  • <strong className="text-white">Edge:</strong> Configuración → Privacidad, búsqueda y servicios
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-4">¿Preguntas sobre Cookies?</h2>
              <p className="text-gray-400 mb-4">
                Si tienes preguntas sobre nuestra política de cookies, contáctanos en:
              </p>
              <p className="text-[#5ddc8a]">
                Email: <a href="mailto:info@gidia.app" className="hover:underline">info@gidia.app</a>
              </p>
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

