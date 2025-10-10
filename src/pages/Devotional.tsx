import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Bot,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDevotional } from "@/hooks/useDevotional";
import { useUserStats } from "@/hooks/useUserStats";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import AIMentorChat from "@/components/AIMentorChat";
import PastorMessageDialog from "@/components/PastorMessageDialog";
import bibleIcon from "@/assets/bible-icon.jpg";

const Devotional = () => {
  const { toast } = useToast();
  const { devotional, loading, error, saveProgress } = useDevotional();
  const { stats, updateStatsAfterDevotional } = useUserStats();
  const [step, setStep] = useState(1);
  const [reflection, setReflection] = useState("");
  const [application, setApplication] = useState("");
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPastorDialog, setShowPastorDialog] = useState(false);
  const [pastorPosition, setPastorPosition] = useState<string>('Pastor');
  const [memorization, setMemorization] = useState("");
  const [memorizationValidated, setMemorizationValidated] = useState(false);
  const [memorizationScore, setMemorizationScore] = useState(0);
  const [validatingMemorization, setValidatingMemorization] = useState(false);

  // Buscar informações do pastor/líder
  useEffect(() => {
    const loadPastorPosition = async () => {
      try {
        const { data, error } = await supabase.rpc('get_my_pastor_info');
        
        if (error) {
          console.error('Error loading pastor position:', error);
          return;
        }

        if (data && data.length > 0) {
          setPastorPosition(data[0].pastor_position === 'pastor' ? 'Pastor' : 'Líder');
        }
      } catch (error) {
        console.error('Error loading pastor position:', error);
      }
    };

    loadPastorPosition();
  }, []);

  const handleValidateMemorization = async () => {
    if (!devotional || !memorization.trim()) return;
    
    setValidatingMemorization(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-memorization', {
        body: {
          originalVerse: devotional.verse_text,
          userVerse: memorization,
          verseReference: devotional.verse_reference
        }
      });

      if (error) throw error;

      setMemorizationValidated(true);
      setMemorizationScore(data.score);
      
      if (data.isValid) {
        toast({
          title: "🎉 Memorização validada!",
          description: `Pontuação: ${data.score}%. ${data.feedback}`,
        });
      } else {
        toast({
          title: "Continue praticando!",
          description: `Pontuação: ${data.score}%. ${data.feedback}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error validating memorization:', error);
      toast({
        title: "Erro ao validar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setValidatingMemorization(false);
    }
  };

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
    const progressResult = await saveProgress(
      devotional.id, 
      reflection, 
      application,
      memorization,
      memorizationValidated
    );
    
    if (progressResult.success && progressResult.isFirstCompletion) {
      // Calculate XP: 50 base + 25 bonus for validated memorization
      const xpGained = memorizationValidated ? 75 : 50;
      const statsResult = await updateStatsAfterDevotional(xpGained);
      
      if (statsResult.success) {
        setCompleted(true);
        const bonusText = memorizationValidated ? " (+25 XP bônus de memorização!)" : "";
        toast({
          title: "🎉 Devocional Completado!",
          description: `+${xpGained} XP ganhos! Você está no nível ${statsResult.newLevel}${bonusText}`,
        });
      } else {
        toast({
          title: "Devocional salvo",
          description: statsResult.message || "Seu progresso foi salvo!",
        });
      }
    } else if (progressResult.success) {
      setCompleted(true);
      toast({
        title: "Devocional atualizado",
        description: "Suas reflexões foram atualizadas.",
      });
    } else {
      toast({
        title: "Erro ao salvar",
        description: progressResult.error || "Tente novamente.",
        variant: "destructive",
      });
    }
    
    setSaving(false);
  };

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const handleShare = async () => {
    const shareText = `🙏 Completei meu devocional diário!\n\n📖 ${devotional?.verse_reference}\n"${devotional?.verse_text}"\n\n✨ Continue sua jornada espiritual conosco!`;
    const shareUrl = window.location.origin;

    // Tentar usar a Web Share API (funciona em mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Devocional Completado',
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Compartilhado!",
          description: "Obrigado por compartilhar sua jornada.",
        });
        return;
      } catch (error) {
        // Se o usuário cancelar, não fazer nada
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    // Fallback: mostrar opções de compartilhamento
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    // WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    
    // Facebook
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    
    // Twitter/X
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    
    // Para Instagram, copiar para clipboard (Instagram não tem API web)
    const options = [
      { name: 'WhatsApp', url: whatsappUrl, icon: '💬' },
      { name: 'Facebook', url: facebookUrl, icon: '📘' },
      { name: 'Twitter/X', url: twitterUrl, icon: '🐦' },
      { name: 'Copiar para Instagram', action: 'copy', icon: '📋' },
    ];

    // Criar um menu simples
    const choice = window.confirm(
      `Escolha onde compartilhar:\n\n` +
      `1️⃣ WhatsApp\n` +
      `2️⃣ Facebook\n` +
      `3️⃣ Twitter/X\n` +
      `4️⃣ Copiar texto (para Instagram)\n\n` +
      `Pressione OK para WhatsApp ou Cancelar para mais opções`
    );

    if (choice) {
      window.open(whatsappUrl, '_blank');
    } else {
      // Copiar para clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Texto copiado!",
          description: "Cole no Instagram ou em qualquer rede social.",
        });
      } catch (error) {
        // Fallback para copiar
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast({
          title: "Texto copiado!",
          description: "Cole no Instagram ou em qualquer rede social.",
        });
      }
    }
  };

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
              Fechar Devocional
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
              <div className="text-2xl font-bold text-primary">+{memorizationValidated ? 75 : 50}</div>
              <div className="text-sm text-muted-foreground">XP Ganho</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/10">
              <div className="text-2xl font-bold text-secondary">{stats?.current_streak || 1}</div>
              <div className="text-sm text-muted-foreground">Dias Seguidos</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <div className="text-2xl font-bold text-accent">Nível {stats?.current_level || 1}</div>
              <div className="text-sm text-muted-foreground">Seu Nível</div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full bg-gradient-celestial hover:opacity-90">
                Fechar Devocional
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="flex-1 border-primary/30"
              onClick={handleShare}
            >
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

        {/* Step 7: Memorização */}
        {step === 7 && (
          <Card className="p-8 shadow-celestial space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                🧠 Desafio de Memorização
              </h2>
              <p className="text-muted-foreground mb-4">
                Escreva o versículo de hoje de memória. Não precisa ser palavra por palavra, 
                mas tente capturar a essência e o sentido do versículo.
              </p>
              <div className="bg-primary/5 rounded-lg p-4 mb-4 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">
                  Versículo de hoje:
                </p>
                <p className="font-semibold text-foreground">
                  {devotional.verse_reference}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Escreva o versículo de memória:
              </label>
              <Textarea 
                placeholder="Escreva o versículo aqui..."
                value={memorization}
                onChange={(e) => setMemorization(e.target.value)}
                className="min-h-[120px]"
                disabled={memorizationValidated}
              />
            </div>

            {memorizationValidated && (
              <div className={`p-4 rounded-lg border ${
                memorizationScore >= 70 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {memorizationScore >= 70 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        Parabéns! Memorização validada! 🎉
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Quase lá! Continue praticando 💪
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground">
                  Pontuação: {memorizationScore}%
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(6)} 
                variant="outline"
                className="flex-1"
                disabled={validatingMemorization}
              >
                Voltar
              </Button>
              
              {!memorizationValidated ? (
                <Button 
                  onClick={handleValidateMemorization}
                  className="flex-1 bg-gradient-celestial hover:opacity-90"
                  disabled={!memorization.trim() || validatingMemorization}
                >
                  {validatingMemorization ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    'Validar Memorização'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => setStep(8)}
                  className="flex-1 bg-gradient-celestial hover:opacity-90"
                >
                  Continuar
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Step 8: Fechamento e Revisão */}
        {step === 8 && (
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
                onClick={() => setStep(7)} 
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
            Perguntar ao {pastorPosition}
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
