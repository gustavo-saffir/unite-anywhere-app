import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 px-4 bg-gradient-celestial relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-primary-foreground font-semibold text-lg">Comece Sua Jornada de 30 Dias Grátis</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
            Experimente o Caminho Diário Sem Compromisso
          </h2>

          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            30 dias completos para transformar seu discipulado. Cancele quando quiser, sem perguntas.
          </p>

          <div className="flex justify-center pt-6">
            <Link to="/auth">
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-divine hover:shadow-glow transition-all duration-300 text-xl px-12 py-8 group"
              >
                Criar Conta Gratuita
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-primary-foreground/90">
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
              <span className="text-base font-medium">30 dias grátis</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
              <span className="text-base font-medium">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
              <span className="text-base font-medium">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
              <span className="text-base font-medium">Suporte incluído</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
