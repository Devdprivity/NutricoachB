import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { type SharedData } from "@/types";
import { dashboard } from "@/routes";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth } = usePage<SharedData>().props;
  const isAuthenticated = !!auth?.user;

  const menuItems = [
    { name: "Características", href: "#features" },
    { name: "Cómo Funciona", href: "#how-it-works" },
    { name: "Testimonios", href: "#testimonials" },
    { name: "Apps", href: "#apps" },
    { name: "Precios", href: "#pricing" }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-[#1f1f1f]">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#5ddc8a] flex items-center justify-center">
              <span className="text-black text-xl font-bold">N</span>
            </div>
            <span className="text-xl">
              Nutri<span className="text-[#5ddc8a]">Coach</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-gray-300 hover:text-[#5ddc8a] transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <Link href={dashboard()} className="bg-[#5ddc8a] text-black px-6 py-2 rounded-lg transition-colors hover:bg-[#4bc977] font-medium">
                Ir al Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-[#1f1f1f] rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-[#1f1f1f] space-y-4">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block text-gray-300 hover:text-[#5ddc8a] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#1f1f1f]">
              {isAuthenticated ? (
                <Link href={dashboard()} className="bg-[#5ddc8a] text-black px-6 py-3 rounded-lg transition-colors w-full text-center hover:bg-[#4bc977] font-medium">
                  Ir al Dashboard
                </Link>
              ) : (
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors px-4 py-2 text-left">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

