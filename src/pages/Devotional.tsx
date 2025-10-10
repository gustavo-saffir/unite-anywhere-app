import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CheckCircle2, 
  Heart, 
  Share2,
  ArrowLeft,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import bibleIcon from "@/assets/bible-icon.jpg";

const Devotional = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [reflection, setReflection] = useState("");
  const [application, setApplication] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (!reflection || !application) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha sua reflexão e aplicação prática.",
        variant: "destructive",
      });
      return;
    }

    setCompleted(true);
    toast({
      title: "🎉 Devocional Completado!",
      description: "+50 pontos de experiência. Continue sua jornada!",
    });
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center space-y-6 shadow-celestial">
          <div className="w-20 h-20 rounded-full bg-gradient-celestial mx-auto flex items-center justify-center shadow-glow">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">
            Devocional Completado! 🎉
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Parabéns por dedicar tempo ao seu crescimento espiritual hoje. Continue firme em sua jornada!
          </p>

          <div className="grid md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">+50</div>
              <div className="text-sm text-muted-foreground">XP Ganho</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/10">
              <div className="text-2xl font-bold text-secondary">46</div>
              <div className="text-sm text-muted-foreground">Dias Seguidos</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <div className="text-2xl font-bold text-accent">Nível 5</div>
              <div className="text-sm text-muted-foreground">Seu Nível</div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full bg-gradient-celestial hover:opacity-90">
                Voltar ao Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="flex-1 border-primary/30">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Progresso</div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
              <div className="text-sm font-semibold text-foreground">{step}/{totalSteps}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 1: Versículo */}
        {step === 1 && (
          <Card className="p-8 shadow-celestial border-primary/20 space-y-6">
            <div className="flex items-center gap-3">
              <img src={bibleIcon} alt="Bíblia" className="w-16 h-16 rounded-xl shadow-glow" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-accent">Versículo do Dia</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">A Fé que Move Montanhas</h1>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
              <p className="text-lg text-foreground leading-relaxed italic mb-2">
                "Se vocês tiverem fé do tamanho de um grão de mostarda, poderão dizer a este monte: 'Vá daqui para lá', e ele irá. Nada lhes será impossível."
              </p>
              <p className="text-sm text-muted-foreground font-medium">— Mateus 17:20</p>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full bg-gradient-celestial hover:opacity-90 shadow-celestial"
              size="lg"
            >
              Continuar para Reflexão
            </Button>
          </Card>
        )}

        {/* Step 2: Reflexão */}
        {step === 2 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Reflexão Guiada</h2>
              <p className="text-muted-foreground">
                A fé não é sobre a quantidade, mas sobre em quem depositamos nossa confiança. Jesus usa a imagem do grão de mostarda - minúsculo, mas com potencial imenso - para ensinar que até a menor fé genuína em Deus pode realizar o impossível.
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-6 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Pontos para Reflexão:
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Quais "montes" (desafios) você está enfrentando hoje?</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Como sua fé tem sido testada recentemente?</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>O que impede você de confiar plenamente em Deus?</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Escreva sua reflexão pessoal:
              </label>
              <Textarea 
                placeholder="Como este versículo fala com sua vida hoje? Que insights Deus está revelando?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(1)} 
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 bg-gradient-celestial hover:opacity-90"
                disabled={!reflection.trim()}
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Aplicação */}
        {step === 3 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Aplicação Prática</h2>
              <p className="text-muted-foreground">
                A fé sem ação é morta. Vamos transformar o que aprendemos em passos práticos para hoje.
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-6 border border-accent/20">
              <h3 className="font-semibold text-foreground mb-3">Desafio do Dia:</h3>
              <p className="text-muted-foreground">
                Identifique UM desafio específico que você está enfrentando e faça uma oração de entrega, confiando que Deus tem o controle. Depois, dê um passo de fé em direção à solução.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Como você vai aplicar isso hoje?
              </label>
              <Textarea 
                placeholder="Seja específico: Que ação concreta você vai tomar hoje para exercitar sua fé?"
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(2)} 
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="flex-1 bg-gradient-celestial hover:opacity-90"
                disabled={!application.trim()}
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Revisão */}
        {step === 4 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Revisão Final</h2>
              <p className="text-muted-foreground">
                Revise suas anotações antes de finalizar o devocional de hoje.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-secondary" />
                  Sua Reflexão:
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{reflection}</p>
              </div>

              <div className="bg-accent/10 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Sua Aplicação Prática:
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{application}</p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="text-sm text-muted-foreground text-center">
                💡 Lembre-se: O crescimento espiritual acontece quando transformamos conhecimento em ação
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(3)} 
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleComplete} 
                className="flex-1 bg-gradient-divine hover:opacity-90 shadow-divine"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Completar Devocional
              </Button>
            </div>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="border-primary/30">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversar com Mentor IA
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Devotional;
