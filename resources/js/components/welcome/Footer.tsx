import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {
  const footerLinks = {
    product: [
      { name: "Características", href: "#features" },
      { name: "Precios", href: "#pricing" },
      { name: "Testimonios", href: "#testimonials" },
      { name: "FAQ", href: "#" }
    ],
    company: [
      { name: "Sobre Nosotros", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carreras", href: "#" },
      { name: "Contacto", href: "#" }
    ],
    legal: [
      { name: "Privacidad", href: "#" },
      { name: "Términos", href: "#" },
      { name: "Cookies", href: "#" },
      { name: "Licencias", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "Youtube" }
  ];

  return (
    <footer className="border-t border-[#1f1f1f] mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl text-white">
                gidia<span className="text-[#5ddc8a]">.app</span>
              </h3>
              <p className="text-gray-400 mt-2">
                Tu coach nutricional personal para alcanzar tus metas de salud y bienestar.
              </p>
            </div>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm text-white">Suscríbete a nuestro newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 bg-[#121212] border border-[#1f1f1f] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#5ddc8a] transition-colors text-white placeholder-gray-500"
                />
                <button className="bg-[#5ddc8a] text-black px-4 py-2 rounded-lg transition-colors hover:bg-[#4bc977]">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-[#121212] border border-[#1f1f1f] flex items-center justify-center hover:border-[#5ddc8a] transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-400 hover:text-[#5ddc8a] transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-4 text-white font-semibold">Producto</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-[#5ddc8a] transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-white font-semibold">Compañía</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-[#5ddc8a] transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-white font-semibold">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-[#5ddc8a] transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1f1f1f] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 gidia.app. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-[#5ddc8a] transition-colors">
              Español
            </a>
            <a href="#" className="text-gray-400 hover:text-[#5ddc8a] transition-colors">
              English
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

