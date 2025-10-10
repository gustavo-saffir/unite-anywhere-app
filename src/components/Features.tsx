import { BookOpen, Brain, Trophy, Users, BarChart3, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Devocionais Diários Estruturados",
    description: "Conteúdo pronto todos os dias com versículo, reflexão profunda e aplicação prática. Transformação real em apenas 5-10 minutos.",
  },
  {
    icon: Brain,
    title: "Mentor Virtual IA 24/7",
    description: "Tire suas dúvidas espirituais a qualquer hora. Respostas personalizadas e orientação constante para sua jornada.",
  },
  {
    icon: Users,
    title: "Acompanhamento Pastoral",
    description: "Seu líder espiritual vê seu progresso em tempo real e pode te apoiar melhor. Conexão verdadeira entre pastor e discípulo.",
  },
  {
    icon: Trophy,
    title: "Gamificação Motivadora",
    description: "Sistema de níveis, XP e conquistas que mantém você engajado. Crescimento espiritual divertido e mensurável.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 bg-gradient-peaceful">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Por que Escolher o Caminho Diário?
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo que você precisa para um discipulado consistente e transformador
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-celestial transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-celestial flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
