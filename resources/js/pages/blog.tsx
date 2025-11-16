import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { BookOpen, Rocket, Bell } from 'lucide-react';

export default function Blog() {
  return (
    <>
      <Head title="Blog - gidia.app">
        <meta name="description" content="Blog de gidia.app. Próximamente artículos sobre nutrición, fitness y bienestar." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <Rocket className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Próximamente</span>
            </div>
            
            <div className="mb-12">
              <div className="w-24 h-24 rounded-2xl bg-[#5ddc8a]/20 flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-12 h-12 text-[#5ddc8a]" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Blog de <span className="text-[#5ddc8a]">gidia.app</span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                Estamos preparando contenido increíble sobre nutrición, fitness, bienestar y tecnología. 
                Pronto compartiremos artículos, guías y consejos para ayudarte en tu viaje de transformación.
              </p>
            </div>

            {/* Coming Soon Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f]">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-white mb-2">Artículos</h3>
                <p className="text-gray-400 text-sm">
                  Guías detalladas sobre nutrición, ejercicio y hábitos saludables
                </p>
              </div>
              
              <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f]">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-white mb-2">Consejos</h3>
                <p className="text-gray-400 text-sm">
                  Tips prácticos y estrategias para alcanzar tus objetivos
                </p>
              </div>
              
              <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f]">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-bold text-white mb-2">Estudios</h3>
                <p className="text-gray-400 text-sm">
                  Análisis de investigaciones científicas sobre salud y fitness
                </p>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 lg:p-12 border border-[#5ddc8a]/20 mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bell className="w-6 h-6 text-[#5ddc8a]" />
                <h2 className="text-2xl font-bold text-white">Mantente Informado</h2>
              </div>
              
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Suscríbete a nuestro newsletter para ser el primero en recibir nuevos artículos, 
                consejos exclusivos y actualizaciones.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 bg-[#121212] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5ddc8a] transition-colors placeholder-gray-500"
                />
                <button className="bg-[#5ddc8a] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#4bc977] transition-colors whitespace-nowrap">
                  Suscribirse
                </button>
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

