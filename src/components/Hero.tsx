import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-path.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-6 py-3 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 mb-4">
            <span className="text-accent font-semibold text-base">✨ Seu companheiro de crescimento espiritual</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            Transforme Seu Discipulado Diário
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto font-light">
            Devocionais estruturados, mentor IA disponível 24/7 e acompanhamento pastoral. Tudo em um só lugar para seu crescimento espiritual real.
          </p>

          <div className="flex justify-center pt-6">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-divine hover:shadow-glow transition-all duration-300 text-xl px-12 py-8 group"
              >
                Começar Agora
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <BookOpen className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground font-medium">Devocionais Diários</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Target className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground font-medium">Objetivos Espirituais</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground font-medium">Progresso Mensurável</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
