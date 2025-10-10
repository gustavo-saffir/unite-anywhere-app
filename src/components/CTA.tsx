import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-4 bg-gradient-celestial relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-primary-foreground font-medium">Comece Hoje Sua Transformação</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
            Pronto para um Discipulado que Realmente Funciona?
          </h2>

          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Junte-se a milhares de discípulos que estão transformando sua fé através do Caminho Diário. Crescimento espiritual real, um dia por vez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-divine hover:shadow-glow transition-all duration-300 text-lg px-10 py-7 group"
            >
              Iniciar Gratuitamente
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm text-lg px-10 py-7"
            >
              Falar com um Especialista
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">50+</div>
              <div className="text-sm">Discípulos Grátis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">24/7</div>
              <div className="text-sm">Mentor Virtual</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">100%</div>
              <div className="text-sm">Gratuito para Começar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
