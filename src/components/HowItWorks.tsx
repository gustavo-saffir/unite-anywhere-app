import { CheckCircle2 } from "lucide-react";
import growthImage from "@/assets/growth-journey.jpg";

const steps = [
  {
    number: "01",
    title: "Crie seu Perfil",
    description: "Defina seus objetivos espirituais e conecte-se com seu mentor ou líder.",
  },
  {
    number: "02",
    title: "Devocional Diário",
    description: "Receba notificações e complete seu devocional estruturado todos os dias.",
  },
  {
    number: "03",
    title: "Interaja com IA",
    description: "Tire dúvidas, reflita mais profundamente e receba orientação personalizada.",
  },
  {
    number: "04",
    title: "Acompanhe Progresso",
    description: "Veja seu crescimento através de métricas, calendário e relatórios detalhados.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Steps */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Como Funciona
              </h2>
              <p className="text-lg text-muted-foreground">
                Um caminho simples e poderoso para transformação espiritual
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-celestial flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                      {step.title}
                      <CheckCircle2 className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-celestial">
              <img 
                src={growthImage} 
                alt="Jornada de Crescimento Espiritual"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-divine border border-border">
              <div className="text-3xl font-bold text-primary">365</div>
              <div className="text-sm text-muted-foreground">Dias de Jornada</div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-divine border border-border">
              <div className="text-3xl font-bold text-secondary">12</div>
              <div className="text-sm text-muted-foreground">Níveis Espirituais</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
