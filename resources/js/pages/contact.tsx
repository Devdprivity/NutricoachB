import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { Mail, MapPin, Phone, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "info@gidia.app",
      link: "mailto:info@gidia.app"
    },
    {
      icon: MapPin,
      title: "Ubicación",
      content: "Santiago de Chile, Chile",
      link: null
    },
    {
      icon: MessageSquare,
      title: "Soporte",
      content: "support@gidia.app",
      link: "mailto:support@gidia.app"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del formulario
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Head title="Contacto - gidia.app">
        <meta name="description" content="Contáctanos en gidia.app. Estamos aquí para ayudarte con cualquier pregunta o sugerencia." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <MessageSquare className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Estamos aquí para ayudarte</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contáctanos
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Nos encantaría escucharte. 
              Nuestro equipo está listo para asistirte.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Contact Info Cards */}
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div 
                    key={index}
                    className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#5ddc8a]" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
                    {info.link ? (
                      <a 
                        href={info.link} 
                        className="text-gray-400 hover:text-[#5ddc8a] transition-colors"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-400">{info.content}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contact Form */}
            <div className="bg-[#1f1f1f] rounded-2xl p-8 lg:p-12 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-6">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5ddc8a] transition-colors placeholder-gray-500"
                      placeholder="Tu nombre"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5ddc8a] transition-colors placeholder-gray-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Asunto
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5ddc8a] transition-colors"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="support">Soporte Técnico</option>
                    <option value="billing">Facturación y Pagos</option>
                    <option value="feature">Sugerencia de Función</option>
                    <option value="partnership">Asociaciones</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5ddc8a] transition-colors placeholder-gray-500 resize-none"
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#5ddc8a] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#4bc977] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-12 bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 border border-[#5ddc8a]/20">
              <h3 className="text-xl font-bold text-white mb-4">Tiempo de Respuesta</h3>
              <p className="text-gray-400 mb-4">
                Nos esforzamos por responder a todos los mensajes dentro de 24-48 horas hábiles. 
                Para consultas urgentes, por favor contáctanos directamente a través de nuestro email de soporte.
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (GMT-3)
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center pt-12">
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

