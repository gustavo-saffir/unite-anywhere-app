import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyReading } from '@/hooks/useDailyReading';
import { toast } from 'sonner';
import DailyReadingAIMentor from '@/components/DailyReadingAIMentor';
import DailyReadingPastorMessage from '@/components/DailyReadingPastorMessage';

export default function DailyReading() {
  const { dailyReading, loading, error, hasCompleted, markAsCompleted } = useDailyReading();
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isMarking, setIsMarking] = useState(false);
  const [showAIMentor, setShowAIMentor] = useState(false);
  const [showPastorMessage, setShowPastorMessage] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleMarkAsCompleted = async () => {
    if (!dailyReading) return;
    
    setIsMarking(true);
    const readingTime = Math.floor((Date.now() - startTime) / 1000);
    
    const result = await markAsCompleted(dailyReading.id, readingTime);
    
    if (result.success) {
      toast.success('Leitura concluída!');
    } else {
      toast.error('Erro ao marcar leitura como concluída');
    }
    
    setIsMarking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dailyReading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Leitura não encontrada</CardTitle>
              <CardDescription>
                Não há leitura bíblica disponível para hoje. Entre em contato com seu líder.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium">Leitura Diária - A Bíblia em 1 Ano</span>
                </div>
                <CardTitle className="text-3xl">
                  {dailyReading.book} - Capítulo {dailyReading.chapter}
                </CardTitle>
                <CardDescription>
                  {new Date(dailyReading.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </div>
              
              {hasCompleted && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Concluída</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                {dailyReading.chapter_text}
              </div>
            </div>

            {!hasCompleted && (
              <div className="pt-6 border-t">
                <Button 
                  onClick={handleMarkAsCompleted}
                  disabled={isMarking}
                  className="w-full"
                  size="lg"
                >
                  {isMarking ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Marcando como concluída...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Marcar como concluída
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Precisa de ajuda para entender melhor esta leitura?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAIMentor(true)}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Mentor IA
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowPastorMessage(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Falar com Pastor
                </Button>
              </div>
            </div>

            {dailyReading.devotional_id && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Esta leitura está conectada ao devocional de hoje:
                </p>
                <Link to="/devotional">
                  <Button variant="outline" className="w-full">
                    Ver Devocional do Dia
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {showAIMentor && dailyReading && (
          <DailyReadingAIMentor
            readingId={dailyReading.id}
            readingContext={`Leitura bíblica de hoje: ${dailyReading.book} - Capítulo ${dailyReading.chapter}\n\n${dailyReading.chapter_text}`}
            onClose={() => setShowAIMentor(false)}
          />
        )}

        {showPastorMessage && dailyReading && (
          <DailyReadingPastorMessage
            readingId={dailyReading.id}
            readingReference={`${dailyReading.book} - Capítulo ${dailyReading.chapter}`}
            onClose={() => setShowPastorMessage(false)}
          />
        )}
      </div>
    </div>
  );
}