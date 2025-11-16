import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { FileText, AlertCircle, Scale, Ban, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      icon: FileText,
      title: "Aceptación de los Términos",
      content: [
        {
          subtitle: "Acuerdo Vinculante",
          text: "Al acceder y utilizar gidia.app, aceptas estar legalmente vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios."
        },
        {
          subtitle: "Capacidad Legal",
          text: "Debes tener al menos 18 años de edad o la mayoría de edad en tu jurisdicción para usar gidia.app. Si eres menor de edad, necesitas el consentimiento de tus padres o tutores legales."
        },
        {
          subtitle: "Modificaciones",
          text: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos y tu uso continuado del servicio constituye aceptación de los términos modificados."
        }
      ]
    },
    {
      icon: AlertCircle,
      title: "Naturaleza del Servicio",
      content: [
        {
          subtitle: "Herramienta Educativa",
          text: "gidia.app es una herramienta de apoyo educativo para el seguimiento nutricional y de ejercicio. NO es un sustituto de asesoramiento médico, diagnóstico o tratamiento profesional."
        },
        {
          subtitle: "No es Consejo Médico",
          text: "La información y recomendaciones proporcionadas por nuestra IA son de naturaleza general y educativa. Siempre consulta con un profesional de la salud calificado antes de realizar cambios significativos en tu dieta o rutina de ejercicios."
        },
        {
          subtitle: "Responsabilidad Personal",
          text: "Eres responsable de evaluar la precisión, integridad y utilidad de toda la información proporcionada. El uso de gidia.app es bajo tu propio riesgo."
        }
      ]
    },
    {
      icon: Scale,
      title: "Uso Aceptable",
      content: [
        {
          subtitle: "Cuenta Personal",
          text: "Tu cuenta es personal e intransferible. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran bajo tu cuenta."
        },
        {
          subtitle: "Uso Legítimo",
          text: "Debes usar gidia.app solo para fines legales y de acuerdo con estos términos. No puedes usar el servicio para actividades fraudulentas, ilegales o no autorizadas."
        },
        {
          subtitle: "Prohibiciones",
          text: "Está prohibido: intentar acceder a sistemas no autorizados, interferir con el servicio, usar bots o scripts automatizados, revender o redistribuir el servicio, o realizar ingeniería inversa de nuestro software."
        }
      ]
    },
    {
      icon: RefreshCw,
      title: "Suscripciones y Pagos",
      content: [
        {
          subtitle: "Planes de Suscripción",
          text: "Ofrecemos planes gratuitos y de pago. Los planes premium se facturan de forma recurrente (mensual o anual) hasta que canceles tu suscripción."
        },
        {
          subtitle: "Facturación Automática",
          text: "Al suscribirte a un plan de pago, autorizas cargos recurrentes automáticos a tu método de pago. Los precios pueden cambiar con previo aviso de 30 días."
        },
        {
          subtitle: "Cancelación",
          text: "Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración. La cancelación será efectiva al final del período de facturación actual sin reembolso prorrateado."
        },
        {
          subtitle: "Garantía de Reembolso",
          text: "Ofrecemos una garantía de reembolso de 30 días para nuevas suscripciones premium. Después de este período, no se realizan reembolsos por períodos parciales."
        }
      ]
    },
    {
      icon: Ban,
      title: "Propiedad Intelectual",
      content: [
        {
          subtitle: "Derechos de gidia.app",
          text: "Todo el contenido, características y funcionalidad de gidia.app (incluyendo texto, gráficos, logos, software) son propiedad exclusiva de gidia.app y están protegidos por leyes de derechos de autor y propiedad intelectual."
        },
        {
          subtitle: "Licencia Limitada",
          text: "Te otorgamos una licencia limitada, no exclusiva, no transferible y revocable para usar gidia.app para tu uso personal y no comercial."
        },
        {
          subtitle: "Tus Datos",
          text: "Mantienes todos los derechos sobre los datos que ingresas en gidia.app. Nos otorgas una licencia para usar estos datos únicamente para proporcionar y mejorar nuestros servicios."
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitación de Responsabilidad",
      content: [
        {
          subtitle: "Sin Garantías",
          text: "gidia.app se proporciona 'tal cual' y 'según disponibilidad' sin garantías de ningún tipo, expresas o implícitas. No garantizamos que el servicio sea ininterrumpido, seguro o libre de errores."
        },
        {
          subtitle: "Exclusión de Daños",
          text: "En la máxima medida permitida por la ley, gidia.app no será responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos o uso."
        },
        {
          subtitle: "Límite de Responsabilidad",
          text: "Nuestra responsabilidad total hacia ti por cualquier reclamo relacionado con gidia.app está limitada a la cantidad que pagaste por el servicio en los últimos 12 meses."
        },
        {
          subtitle: "Indemnización",
          text: "Aceptas indemnizar y eximir de responsabilidad a gidia.app de cualquier reclamo que surja de tu uso del servicio o violación de estos términos."
        }
      ]
    }
  ];

  return (
    <>
      <Head title="Términos de Servicio - gidia.app">
        <meta name="description" content="Términos y condiciones de uso de gidia.app. Lee nuestras políticas y acuerdos legales." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <FileText className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Última actualización: 16 de noviembre de 2025</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Términos de <span className="text-[#5ddc8a]">Servicio</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Por favor, lee estos términos cuidadosamente antes de usar gidia.app. 
              Estos términos establecen los derechos y obligaciones legales entre tú y nosotros.
            </p>
          </div>

          {/* Important Notice */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#5ddc8a]/10 border border-[#5ddc8a]/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-[#5ddc8a] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Aviso Importante de Salud</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    gidia.app es una herramienta educativa y NO reemplaza el asesoramiento médico profesional. 
                    Siempre consulta con un médico, nutricionista o profesional de la salud calificado antes de 
                    realizar cambios significativos en tu dieta, ejercicio o estilo de vida. Si tienes condiciones 
                    médicas preexistentes, estás embarazada o tomando medicamentos, la supervisión médica es esencial.
                  </p>
                </div>
              </div>
            </div>
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

            {/* Additional Terms */}
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-6">Disposiciones Adicionales</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  <strong className="text-white">Ley Aplicable:</strong> Estos términos se rigen por las leyes de España, 
                  sin considerar conflictos de disposiciones legales.
                </p>
                <p>
                  <strong className="text-white">Resolución de Disputas:</strong> Cualquier disputa se resolverá mediante 
                  arbitraje vinculante de acuerdo con las reglas de arbitraje aplicables.
                </p>
                <p>
                  <strong className="text-white">Divisibilidad:</strong> Si alguna disposición de estos términos se considera 
                  inválida o inaplicable, las disposiciones restantes continuarán en pleno vigor y efecto.
                </p>
                <p>
                  <strong className="text-white">Acuerdo Completo:</strong> Estos términos constituyen el acuerdo completo 
                  entre tú y gidia.app respecto al uso del servicio.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 border border-[#5ddc8a]/20">
              <h2 className="text-2xl font-bold text-white mb-4">Contacto Legal</h2>
              <p className="text-gray-400 mb-6">
                Si tienes preguntas sobre estos términos de servicio, contáctanos en:
              </p>
              <div className="space-y-2 text-[#5ddc8a]">
                <p>Email: <a href="mailto:legal@gidia.app" className="hover:underline">legal@gidia.app</a></p>
                <p>Departamento Legal: Legal Team</p>
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

