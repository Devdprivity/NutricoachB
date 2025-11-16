import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      title: "Información que Recopilamos",
      content: [
        {
          subtitle: "Información de Cuenta",
          text: "Cuando te registras en gidia.app, recopilamos tu nombre, dirección de correo electrónico y datos de perfil básicos proporcionados a través de Google OAuth."
        },
        {
          subtitle: "Datos de Salud y Nutrición",
          text: "Almacenamos la información que ingresas voluntariamente sobre tus comidas, ejercicios, objetivos de salud, mediciones corporales y progreso fotográfico."
        },
        {
          subtitle: "Datos de Uso",
          text: "Recopilamos información sobre cómo interactúas con nuestra aplicación, incluyendo páginas visitadas, funciones utilizadas y tiempo de actividad."
        }
      ]
    },
    {
      icon: Lock,
      title: "Cómo Usamos tu Información",
      content: [
        {
          subtitle: "Servicios Personalizados",
          text: "Utilizamos tus datos para proporcionar análisis nutricionales personalizados, recomendaciones de ejercicios y seguimiento de progreso adaptado a tus objetivos."
        },
        {
          subtitle: "Mejora del Servicio",
          text: "Analizamos datos agregados y anónimos para mejorar nuestros algoritmos de IA, desarrollar nuevas funciones y optimizar la experiencia del usuario."
        },
        {
          subtitle: "Comunicaciones",
          text: "Te enviamos notificaciones importantes sobre tu cuenta, actualizaciones del servicio y, si lo autorizas, consejos de salud y bienestar."
        }
      ]
    },
    {
      icon: Shield,
      title: "Protección de tus Datos",
      content: [
        {
          subtitle: "Encriptación",
          text: "Todos los datos se transmiten mediante encriptación SSL/TLS de 256 bits y se almacenan de forma segura en servidores protegidos."
        },
        {
          subtitle: "Acceso Restringido",
          text: "Solo el personal autorizado tiene acceso a tus datos personales, y únicamente cuando es necesario para proporcionar soporte o mantener el servicio."
        },
        {
          subtitle: "Cumplimiento Normativo",
          text: "Cumplimos con GDPR, CCPA y otras regulaciones de protección de datos aplicables en tu jurisdicción."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "Tus Derechos",
      content: [
        {
          subtitle: "Acceso y Portabilidad",
          text: "Puedes solicitar una copia de todos tus datos personales en formato estructurado y legible por máquina."
        },
        {
          subtitle: "Corrección y Actualización",
          text: "Tienes derecho a corregir cualquier información personal inexacta y actualizar tus datos en cualquier momento desde tu perfil."
        },
        {
          subtitle: "Eliminación",
          text: "Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados. Este proceso es irreversible."
        },
        {
          subtitle: "Oposición y Restricción",
          text: "Puedes oponerte al procesamiento de tus datos para ciertos fines o solicitar la restricción temporal del procesamiento."
        }
      ]
    },
    {
      icon: Eye,
      title: "Compartir Información",
      content: [
        {
          subtitle: "No Vendemos tus Datos",
          text: "Nunca vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing."
        },
        {
          subtitle: "Proveedores de Servicios",
          text: "Compartimos datos mínimos necesarios con proveedores de servicios de confianza (hosting, análisis, soporte) que están contractualmente obligados a proteger tu información."
        },
        {
          subtitle: "Requisitos Legales",
          text: "Podemos divulgar información si es requerido por ley, orden judicial o para proteger nuestros derechos legales."
        }
      ]
    },
    {
      icon: FileText,
      title: "Cookies y Tecnologías Similares",
      content: [
        {
          subtitle: "Cookies Esenciales",
          text: "Utilizamos cookies necesarias para el funcionamiento básico del sitio, como mantener tu sesión activa y recordar tus preferencias."
        },
        {
          subtitle: "Cookies Analíticas",
          text: "Con tu consentimiento, usamos cookies para analizar el uso del sitio y mejorar nuestros servicios."
        },
        {
          subtitle: "Control de Cookies",
          text: "Puedes gestionar tus preferencias de cookies desde la configuración de tu navegador o nuestra herramienta de gestión de cookies."
        }
      ]
    }
  ];

  return (
    <>
      <Head title="Política de Privacidad - gidia.app">
        <meta name="description" content="Política de privacidad de gidia.app. Conoce cómo protegemos y utilizamos tu información personal." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <Shield className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Última actualización: 16 de noviembre de 2025</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Política de <span className="text-[#5ddc8a]">Privacidad</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              En gidia.app, tu privacidad es nuestra prioridad. Esta política explica cómo recopilamos, 
              usamos y protegemos tu información personal.
            </p>
          </div>

          {/* Content Sections */}
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div 
                  key={index}
                  className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#5ddc8a]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{section.title}</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-6 ml-16">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.subtitle}</h3>
                        <p className="text-gray-400 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 border border-[#5ddc8a]/20">
              <h2 className="text-2xl font-bold text-white mb-4">Contacto sobre Privacidad</h2>
              <p className="text-gray-400 mb-6">
                Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, 
                contáctanos en:
              </p>
              <div className="space-y-2 text-[#5ddc8a]">
                <p>Email: <a href="mailto:privacy@gidia.app" className="hover:underline">privacy@gidia.app</a></p>
                <p>Responsable de Protección de Datos: DPO Team</p>
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
        </div>

        <Footer />
      </div>
    </>
  );
}

