import { Head, Link } from '@inertiajs/react';
import { Header } from '../components/welcome/Header';
import { Footer } from '../components/welcome/Footer';
import { FileText, Code, Package } from 'lucide-react';

export default function Licenses() {
  const licenses = [
    {
      name: "Laravel",
      version: "12.x",
      license: "MIT License",
      url: "https://laravel.com",
      description: "Framework PHP para desarrollo web"
    },
    {
      name: "React",
      version: "18.x",
      license: "MIT License",
      url: "https://reactjs.org",
      description: "Biblioteca JavaScript para interfaces de usuario"
    },
    {
      name: "Inertia.js",
      version: "1.x",
      license: "MIT License",
      url: "https://inertiajs.com",
      description: "Framework para crear SPAs monolíticas"
    },
    {
      name: "Tailwind CSS",
      version: "3.x",
      license: "MIT License",
      url: "https://tailwindcss.com",
      description: "Framework CSS utility-first"
    },
    {
      name: "Lucide React",
      version: "Latest",
      license: "ISC License",
      url: "https://lucide.dev",
      description: "Biblioteca de iconos para React"
    },
    {
      name: "TypeScript",
      version: "5.x",
      license: "Apache License 2.0",
      url: "https://www.typescriptlang.org",
      description: "Superset tipado de JavaScript"
    }
  ];

  return (
    <>
      <Head title="Licencias - gidia.app">
        <meta name="description" content="Licencias de software y tecnologías de código abierto utilizadas en gidia.app." />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f] mb-6">
              <FileText className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Código Abierto</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Licencias de <span className="text-[#5ddc8a]">Software</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              gidia.app está construido sobre tecnologías de código abierto. Agradecemos a la comunidad 
              de desarrolladores que hacen posible estas herramientas.
            </p>
          </div>

          {/* Open Source Statement */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 border border-[#5ddc8a]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-[#5ddc8a]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Compromiso con el Código Abierto</h2>
                  <p className="text-gray-300 leading-relaxed">
                    En gidia.app, creemos en el poder del software de código abierto. Utilizamos y contribuimos 
                    a proyectos open source, respetando siempre las licencias y términos de cada biblioteca y 
                    framework que implementamos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Licenses List */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Tecnologías <span className="text-[#5ddc8a]">Utilizadas</span>
            </h2>
            
            <div className="space-y-4">
              {licenses.map((lib, index) => (
                <div 
                  key={index}
                  className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#1f1f1f] hover:border-[#5ddc8a]/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#5ddc8a]/20 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-[#5ddc8a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{lib.name}</h3>
                        <span className="text-sm text-gray-500">{lib.version}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{lib.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#5ddc8a]">{lib.license}</span>
                        <a 
                          href={lib.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#5ddc8a] transition-colors"
                        >
                          Sitio web →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIT License Text */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-4">Licencia MIT</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                La mayoría de las bibliotecas que utilizamos están bajo la Licencia MIT, que permite:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="text-gray-400 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  Uso comercial y privado
                </li>
                <li className="text-gray-400 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  Modificación del código
                </li>
                <li className="text-gray-400 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  Distribución
                </li>
                <li className="text-gray-400 text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#5ddc8a] rounded-full flex-shrink-0 mt-2"></span>
                  Sublicenciamiento
                </li>
              </ul>
              
              <div className="bg-[#121212] rounded-xl p-4 font-mono text-xs text-gray-400 overflow-x-auto">
                <pre className="whitespace-pre-wrap">
{`MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`}
                </pre>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-[#1f1f1f]">
              <h2 className="text-2xl font-bold text-white mb-4">Atribuciones</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Agradecemos especialmente a:
              </p>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">
                  • Los mantenedores y contribuidores de todos los proyectos de código abierto que utilizamos
                </li>
                <li className="text-gray-400 text-sm">
                  • La comunidad de desarrolladores que comparte conocimiento y mejores prácticas
                </li>
                <li className="text-gray-400 text-sm">
                  • Unsplash por las imágenes de alta calidad utilizadas en nuestro sitio
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-[#5ddc8a]/10 to-[#5ddc8a]/5 rounded-2xl p-8 border border-[#5ddc8a]/20">
              <h2 className="text-2xl font-bold text-white mb-4">¿Preguntas sobre Licencias?</h2>
              <p className="text-gray-400 mb-4">
                Si tienes preguntas sobre las licencias de software que utilizamos o necesitas información 
                adicional, contáctanos en:
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

