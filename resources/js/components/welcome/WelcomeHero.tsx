import { useEffect, useRef, useState } from "react";
import { Activity, Target, Sparkles, Camera, Scan, Zap, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function WelcomeHero() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  // Particle system for background
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.offsetWidth;
        this.y = Math.random() * canvas.offsetHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.offsetWidth) this.x = 0;
        if (this.x < 0) this.x = canvas.offsetWidth;
        if (this.y > canvas.offsetHeight) this.y = 0;
        if (this.y < 0) this.y = canvas.offsetHeight;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(93, 220, 138, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(93, 220, 138, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Title animation - reveal from bottom
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2
      });

      // Animate text lines
      gsap.from(".hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.4
      });

      // Animate buttons
      gsap.from(".hero-button", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 0.8
      });

      // Stats cards animation
      gsap.from(".stat-card", {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 1.2
      });

      // Floating animation for cards
      gsap.to(".float-card", {
        y: -20,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3
      });

      // Glow pulse animation
      gsap.to(".glow-pulse", {
        opacity: 0.3,
        scale: 1.1,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true
      });

      // Image reveal
      gsap.from(".hero-image", {
        scale: 0.8,
        opacity: 0,
        rotation: -5,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.6
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated particle canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #5ddc8a 1px, transparent 1px),
            linear-gradient(to bottom, #5ddc8a 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Radial glow effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5ddc8a] rounded-full blur-[120px] opacity-20 glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5ddc8a] rounded-full blur-[120px] opacity-20 glow-pulse" style={{ animationDelay: '1s' }} />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge with animation */}
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f]/80 backdrop-blur-xl px-4 py-2 rounded-full border border-[#5ddc8a]/30 hero-text">
              <Sparkles className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white font-medium">Powered by AI</span>
              <Zap className="w-3 h-3 text-[#5ddc8a] animate-pulse" />
            </div>

            <div className="space-y-4">
              <h1
                ref={titleRef}
                className="text-6xl sm:text-7xl lg:text-8xl tracking-tight text-white font-bold leading-tight"
              >
                Gidia<span className="text-[#5ddc8a] inline-block" style={{
                  textShadow: '0 0 30px rgba(93, 220, 138, 0.5)'
                }}>.app</span>
              </h1>
              <p className="hero-text text-xl sm:text-2xl text-gray-300 max-w-xl mx-auto lg:mx-0 font-light">
                Tu <span className="text-[#5ddc8a] font-semibold">compañero inteligente</span> para alcanzar tus metas de salud
              </p>
            </div>

            <p className="hero-text text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
              Transforma tu vida con tecnología de vanguardia. Monitoreo en tiempo real,
              IA personalizada y resultados medibles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/register"
                className="hero-button group relative bg-gradient-to-r from-[#5ddc8a] to-[#4bc977] text-black px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(93,220,138,0.5)] text-center font-semibold overflow-hidden"
              >
                <span className="relative z-10">Comenzar Gratis</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </a>
              <a
                href="#features"
                className="hero-button bg-transparent text-[#5ddc8a] border-2 border-[#5ddc8a] px-8 py-4 rounded-xl transition-all duration-300 hover:bg-[#5ddc8a]/10 hover:scale-105 hover:shadow-[0_0_30px_rgba(93,220,138,0.3)] text-center font-semibold backdrop-blur-sm"
              >
                Explorar Demo
              </a>
            </div>

            {/* Stats with glassmorphism */}
            <div ref={statsRef} className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto lg:mx-0">
              <div className="stat-card group relative bg-[#1f1f1f]/40 backdrop-blur-xl p-4 rounded-2xl border border-[#5ddc8a]/20 hover:border-[#5ddc8a]/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative">
                  <div className="text-[#5ddc8a] text-3xl font-bold">1K+</div>
                  <div className="text-xs text-gray-400 mt-1">Usuarios</div>
                </div>
              </div>
              <div className="stat-card group relative bg-[#1f1f1f]/40 backdrop-blur-xl p-4 rounded-2xl border border-[#5ddc8a]/20 hover:border-[#5ddc8a]/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative">
                  <div className="text-[#5ddc8a] text-3xl font-bold">50K+</div>
                  <div className="text-xs text-gray-400 mt-1">Entrenamientos</div>
                </div>
              </div>
              <div className="stat-card group relative bg-[#1f1f1f]/40 backdrop-blur-xl p-4 rounded-2xl border border-[#5ddc8a]/20 hover:border-[#5ddc8a]/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative">
                  <div className="text-[#5ddc8a] text-3xl font-bold">4.9★</div>
                  <div className="text-xs text-gray-400 mt-1">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Cards */}
          <div className="relative hero-image">
            {/* Main image with 3D effect */}
            <div className="relative z-10 rounded-3xl overflow-hidden border-2 border-[#5ddc8a]/30 shadow-[0_0_60px_rgba(93,220,138,0.3)] transform perspective-1000 rotate-y-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/20 to-transparent" />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1654084982335-d404ccf9c6f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbnV0cml0aW9uJTIwZml0bmVzc3xlbnwxfHx8fDE3NjMxNTc4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Healthy Nutrition and Fitness"
                className="w-full h-auto"
              />
            </div>

            {/* AI Analysis Card - Floating with glassmorphism */}
            <div className="float-card absolute -bottom-8 -left-8 z-20 hidden lg:block">
              <div className="relative bg-black/40 backdrop-blur-2xl p-6 rounded-3xl border border-[#5ddc8a]/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-xs">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/10 via-transparent to-transparent rounded-3xl" />

                <div className="relative space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#5ddc8a] to-[#4bc977] p-3 rounded-2xl shadow-lg">
                      <Camera className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Análisis IA</div>
                      <div className="text-[#5ddc8a] font-semibold text-sm">Comida Detectada</div>
                    </div>
                  </div>

                  {/* Food Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-[#5ddc8a]/20">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1722169474498-eb7fe1f59694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHBsYXRlJTIwZm9vZHxlbnwxfHx8fDE3NjMxNTgzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Food Analysis"
                      className="w-full h-32 object-cover"
                    />

                    {/* Scan Animation Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Scan className="w-8 h-8 text-[#5ddc8a] animate-pulse" />
                          <span className="text-xs text-white font-medium">Analizando...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  {showResults ? (
                    <div className="space-y-2 animate-in fade-in duration-500">
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-[#5ddc8a]/5">
                        <span className="text-gray-300">Proteínas</span>
                        <span className="text-[#5ddc8a] font-bold">28g</span>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-[#5ddc8a]/5">
                        <span className="text-gray-300">Carbohidratos</span>
                        <span className="text-[#5ddc8a] font-bold">45g</span>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-[#5ddc8a]/5">
                        <span className="text-gray-300">Grasas</span>
                        <span className="text-[#5ddc8a] font-bold">12g</span>
                      </div>
                      <div className="pt-2 border-t border-[#5ddc8a]/20 flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[#5ddc8a]/10 to-transparent">
                        <span className="text-sm text-white font-semibold">Total</span>
                        <span className="text-[#5ddc8a] font-bold text-lg">420 kcal</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-[#5ddc8a] to-[#4bc977] text-black py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-[0_0_20px_rgba(93,220,138,0.5)] font-semibold"
                    >
                      {isAnalyzing ? "Analizando..." : "Analizar Comida"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Card - Top Right */}
            <div className="float-card absolute -top-8 -right-8 z-30 hidden sm:block" style={{ animationDelay: '0.5s' }}>
              <div className="relative bg-black/40 backdrop-blur-2xl p-5 rounded-3xl border border-[#5ddc8a]/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/10 to-transparent rounded-3xl" />
                <div className="relative flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#5ddc8a] to-[#4bc977] p-3 rounded-2xl shadow-lg">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Meta Semanal</div>
                    <div className="text-[#5ddc8a] font-bold text-2xl">85%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress indicator card */}
            <div className="float-card absolute bottom-1/3 -right-12 z-20 hidden xl:block" style={{ animationDelay: '1s' }}>
              <div className="relative bg-black/40 backdrop-blur-2xl p-4 rounded-2xl border border-[#5ddc8a]/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ddc8a]/10 to-transparent rounded-2xl" />
                <div className="relative flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#5ddc8a]" />
                  <div className="text-white text-sm font-semibold">+12% este mes</div>
                </div>
              </div>
            </div>

            {/* Geometric decoration */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#5ddc8a]/5 to-transparent blur-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .rotate-y-5 {
          transform: rotateY(-2deg);
        }
      `}</style>
    </div>
  );
}
