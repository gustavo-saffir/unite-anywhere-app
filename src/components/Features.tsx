import { BookOpen, Brain, Trophy, Users, BarChart3, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Devocionais Estruturados",
    description: "Conteúdo diário com versículo, reflexão e aplicação prática para transformação real.",
  },
  {
    icon: Brain,
    title: "Mentor Virtual IA",
    description: "Acompanhamento inteligente com respostas personalizadas às suas dúvidas espirituais.",
  },
  {
    icon: Trophy,
    title: "Gamificação Espiritual",
    description: "Sistema de níveis, badges e conquistas que mantém você motivado na jornada.",
  },
  {
    icon: Users,
    title: "Acompanhamento Pastoral",
    description: "Conecte-se com seu líder espiritual que acompanha seu progresso em tempo real.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de Crescimento",
    description: "Visualize seu progresso espiritual com dados e insights sobre sua jornada.",
  },
  {
    icon: Calendar,
    title: "Histórico Completo",
    description: "Calendário visual do seu caminho, celebrando cada dia de compromisso e crescimento.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 bg-gradient-peaceful">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Discipulado que Transforma
          </h2>
          <p className="text-lg text-muted-foreground">
            Combine tecnologia e espiritualidade para um crescimento sistemático e mensurável
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
