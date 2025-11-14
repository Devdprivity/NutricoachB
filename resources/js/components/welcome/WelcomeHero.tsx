import { Activity, Target, Sparkles, Camera, Scan } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState } from "react";

export function WelcomeHero() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#1f1f1f] px-4 py-2 rounded-full border border-[#1f1f1f]">
              <Sparkles className="w-4 h-4 text-[#5ddc8a]" />
              <span className="text-sm text-white">Tu coach nutricional personal</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl tracking-tight text-white">
                Nutri<span className="text-[#5ddc8a]">Coach</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                Tu compañero inteligente para alcanzar tus metas de salud y bienestar
              </p>
            </div>

            <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
              Registra tu ejercicio, monitorea tu nutrición y recibe consejos personalizados. 
              Todo en un solo lugar, como si tuvieras un coach personal 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/register" className="bg-[#5ddc8a] text-black px-8 py-4 rounded-lg transition-colors hover:bg-[#4bc977] text-center font-medium">
                Comenzar Ahora
              </a>
              <a href="#features" className="bg-transparent text-[#5ddc8a] border-2 border-[#5ddc8a] px-8 py-4 rounded-lg transition-colors hover:bg-[#5ddc8a]/10 text-center font-medium">
                Ver Más
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-[#5ddc8a] text-2xl font-bold">1000+</div>
                <div className="text-sm text-gray-400">Usuarios Activos</div>
              </div>
              <div>
                <div className="text-[#5ddc8a] text-2xl font-bold">50K+</div>
                <div className="text-sm text-gray-400">Entrenamientos</div>
              </div>
              <div>
                <div className="text-[#5ddc8a] text-2xl font-bold">4.9★</div>
                <div className="text-sm text-gray-400">Valoración</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden border-4 border-[#1f1f1f] shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1654084982335-d404ccf9c6f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbnV0cml0aW9uJTIwZml0bmVzc3xlbnwxfHx8fDE3NjMxNTc4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Healthy Nutrition and Fitness"
                className="w-full h-auto"
              />
            </div>
            
            {/* AI Analysis Card - Bottom Left */}
            <div className="absolute -bottom-6 -left-6 z-20 hidden lg:block">
              <div className="bg-[#1f1f1f] p-6 rounded-2xl border border-[#1f1f1f] shadow-2xl max-w-xs">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="bg-[#5ddc8a] p-2 rounded-lg">
                      <Camera className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Análisis IA</div>
                      <div className="text-[#5ddc8a] font-medium">Imagen de Comida</div>
                    </div>
                  </div>

                  {/* Food Image */}
                  <div className="relative rounded-xl overflow-hidden border border-[#1f1f1f]">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1722169474498-eb7fe1f59694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHBsYXRlJTIwZm9vZHxlbnwxfHx8fDE3NjMxNTgzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Food Analysis"
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Scan Animation Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Scan className="w-8 h-8 text-[#5ddc8a] animate-pulse" />
                          <span className="text-xs text-white">Analizando...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  {showResults ? (
                    <div className="space-y-2 animate-in fade-in duration-500">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Proteínas</span>
                        <span className="text-[#5ddc8a] font-medium">28g</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Carbohidratos</span>
                        <span className="text-[#5ddc8a] font-medium">45g</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Grasas</span>
                        <span className="text-[#5ddc8a] font-medium">12g</span>
                      </div>
                      <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between">
                        <span className="text-sm text-white">Total</span>
                        <span className="text-[#5ddc8a] font-medium">~420 kcal</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full bg-[#5ddc8a] text-black py-2 rounded-lg text-sm transition-colors disabled:opacity-50 hover:bg-[#4bc977] font-medium"
                    >
                      {isAnalyzing ? "Analizando..." : "Analizar Comida"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Card 2 - Top Right */}
            <div className="absolute -top-6 -right-6 bg-[#1f1f1f] p-4 rounded-xl border border-[#1f1f1f] shadow-xl hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="bg-[#5ddc8a] p-3 rounded-lg">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Meta Semanal</div>
                  <div className="text-[#5ddc8a] font-bold">85%</div>
                </div>
              </div>
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#5ddc8a] to-[#00331e] opacity-20 blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

