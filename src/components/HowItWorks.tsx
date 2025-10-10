import { CheckCircle2 } from "lucide-react";
import growthImage from "@/assets/growth-journey.jpg";

const steps = [
  {
    number: "01",
    title: "Cadastre-se",
    description: "Crie sua conta em menos de 1 minuto e comece sua jornada de crescimento espiritual hoje mesmo.",
  },
  {
    number: "02",
    title: "Complete Devocionais Diários",
    description: "Reserve 5-10 minutos por dia para crescer espiritualmente. Conteúdo estruturado, reflexões profundas e aplicação prática.",
  },
  {
    number: "03",
    title: "Acompanhe Seu Crescimento",
    description: "Veja sua evolução com níveis, XP e sequência de dias. Seu pastor também acompanha seu progresso para te apoiar melhor.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              Três passos simples para transformar seu discipulado
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex gap-6 group p-6 rounded-2xl bg-card/50 border border-border/50 hover:shadow-celestial transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-celestial flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    {step.title}
                    <CheckCircle2 className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-6 rounded-2xl bg-gradient-peaceful border border-border/50">
            <p className="text-lg text-muted-foreground">
              <strong className="text-primary">95% dos usuários</strong> relatam crescimento espiritual consistente com a prática diária
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
