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
  MessageCircle,
  AlertCircle,
  Bot
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDevotional } from "@/hooks/useDevotional";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import AIMentorChat from "@/components/AIMentorChat";
import PastorMessageDialog from "@/components/PastorMessageDialog";
import bibleIcon from "@/assets/bible-icon.jpg";

const Devotional = () => {
  const { toast } = useToast();
  const { devotional, loading, error, saveProgress } = useDevotional();
  const [step, setStep] = useState(1);
  const [reflection, setReflection] = useState("");
  const [application, setApplication] = useState("");
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPastorDialog, setShowPastorDialog] = useState(false);

  const handleComplete = async () => {
    if (!reflection || !application) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha sua reflexão e aplicação prática.",
        variant: "destructive",
      });
      return;
    }

    if (!devotional) {
      toast({
        title: "Erro",
        description: "Devocional não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const result = await saveProgress(devotional.id, reflection, application);
    setSaving(false);

    if (result.success) {
      setCompleted(true);
      toast({
        title: "🎉 Devocional Completado!",
        description: "+50 pontos de experiência. Continue sua jornada!",
      });
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.error || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando devocional do dia...</p>
        </div>
      </div>
    );
  }

  if (error || !devotional) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Devocional Não Disponível</h2>
          <p className="text-muted-foreground">
            {error || "Ainda não há um devocional cadastrado para hoje. Entre em contato com o administrador."}
          </p>
          <Link to="/dashboard">
            <Button className="w-full bg-gradient-celestial hover:opacity-90">
              Voltar ao Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

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
              <div className="text-2xl font-bold text-secondary">1</div>
              <div className="text-sm text-muted-foreground">Dias Seguidos</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <div className="text-2xl font-bold text-accent">Nível 1</div>
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
        {/* Step 1: Abertura */}
        {step === 1 && (
          <Card className="p-8 shadow-celestial border-primary/20 space-y-6">
            <div className="flex items-center gap-3">
              <img src={bibleIcon} alt="Bíblia" className="w-16 h-16 rounded-xl shadow-glow" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-accent">Devocional do Dia</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Bem-vindo</h1>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">📖 Abertura</h2>
              {devotional.opening_text ? (
                <MarkdownRenderer 
                  content={devotional.opening_text} 
                  className="text-foreground leading-relaxed"
                />
              ) : (
                <p className="text-muted-foreground">Preparando seu coração para o estudo de hoje...</p>
              )}
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full bg-gradient-celestial hover:opacity-90 shadow-celestial"
              size="lg"
            >
              Continuar para o Versículo
            </Button>
          </Card>
        )}

        {/* Step 2: Versículo */}
        {step === 2 && (
          <Card className="p-8 shadow-celestial border-primary/20 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Versículo do Dia</h2>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
              <h3 className="text-lg font-semibold text-primary mb-4">{devotional.verse_reference}</h3>
              <p className="text-lg text-foreground leading-relaxed italic">
                "{devotional.verse_text}"
              </p>
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
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Contexto */}
        {step === 3 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">📜 Contexto Rápido</h2>
              {devotional.context ? (
                <MarkdownRenderer 
                  content={devotional.context} 
                  className="text-foreground leading-relaxed"
                />
              ) : (
                <p className="text-muted-foreground">Entendendo o contexto do versículo...</p>
              )}
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
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Insight Central */}
        {step === 4 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">💡 Reflexão Central</h2>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                {devotional.central_insight ? (
                  <MarkdownRenderer 
                    content={devotional.central_insight} 
                    className="text-foreground leading-relaxed"
                  />
                ) : (
                  <p className="text-muted-foreground">O ensinamento principal de hoje...</p>
                )}
              </div>
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
                onClick={() => setStep(5)} 
                className="flex-1 bg-gradient-celestial hover:opacity-90"
              >
                Continuar para Reflexão
              </Button>
            </div>
          </Card>
        )}

        {/* Step 5: Reflexão */}
        {step === 5 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">💭 Reflexão Guiada</h2>
              {devotional.reflection_question && (
                <MarkdownRenderer 
                  content={devotional.reflection_question} 
                  className="text-muted-foreground mb-4"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Escreva sua reflexão pessoal:
              </label>
              <Textarea 
                placeholder="De que forma este versículo se aplica à sua vida neste momento? Quais verdades ou ensinamentos Deus está revelando a você por meio dele?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(4)} 
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(6)} 
                className="flex-1 bg-gradient-celestial hover:opacity-90"
                disabled={!reflection.trim()}
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 6: Aplicação */}
        {step === 6 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">✨ Aplicação Prática</h2>
              {devotional.application_question && (
                <MarkdownRenderer 
                  content={devotional.application_question} 
                  className="text-muted-foreground mb-4"
                />
              )}
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
                onClick={() => setStep(5)} 
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(7)} 
                className="flex-1 bg-gradient-celestial hover:opacity-90"
                disabled={!application.trim()}
              >
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 7: Fechamento e Revisão */}
        {step === 7 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">🙏 Fechamento</h2>
              {devotional.closing_text && (
                <div className="mb-6">
                  <MarkdownRenderer 
                    content={devotional.closing_text} 
                    className="text-foreground leading-relaxed"
                  />
                </div>
              )}
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
                onClick={() => setStep(6)} 
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleComplete} 
                className="flex-1 bg-gradient-divine hover:opacity-90 shadow-divine"
                size="lg"
                disabled={saving}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {saving ? 'Salvando...' : 'Completar Devocional'}
              </Button>
            </div>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-6 text-center space-y-3">
          <Button 
            variant="outline" 
            className="border-primary/30 mr-3"
            onClick={() => setShowAIChat(true)}
          >
            <Bot className="w-4 h-4 mr-2" />
            Perguntar ao Mentor IA
          </Button>
          <Button 
            variant="outline" 
            className="border-primary/30"
            onClick={() => setShowPastorDialog(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Perguntar ao Pastor Gustavo
          </Button>
        </div>

        {/* AI Mentor Chat */}
        {showAIChat && devotional && (
          <AIMentorChat
            devotionalId={devotional.id}
            devotionalContext={`
**Devocional de Hoje (${new Date(devotional.date).toLocaleDateString('pt-BR')})**

${devotional.opening_text || ''}

**Versículo: ${devotional.verse_reference}**
"${devotional.verse_text}"

**Contexto:**
${devotional.context || ''}

**Reflexão Central:**
${devotional.central_insight || ''}

**Reflexão:**
${devotional.reflection_question || ''}

**Aplicação Prática:**
${devotional.application_question || ''}

${devotional.closing_text || ''}
            `.trim()}
            onClose={() => setShowAIChat(false)}
          />
        )}

        {/* Pastor Message Dialog */}
        {showPastorDialog && devotional && (
          <PastorMessageDialog
            devotionalId={devotional.id}
            onClose={() => setShowPastorDialog(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Devotional;
