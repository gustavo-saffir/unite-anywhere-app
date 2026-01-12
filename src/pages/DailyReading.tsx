import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Bot, MessageSquare, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyReading } from '@/hooks/useDailyReading';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DailyReadingAIMentor from '@/components/DailyReadingAIMentor';
import DailyReadingPastorMessage from '@/components/DailyReadingPastorMessage';
import AudioPlayer from '@/components/AudioPlayer';

export default function DailyReading() {
  const { dailyReadings, loading, error, hasCompleted, markAsCompleted } = useDailyReading();
  const { trackActivity } = useActivityTracking();
  const { isAdmin } = useAuth();
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isMarking, setIsMarking] = useState(false);
  const [showAIMentor, setShowAIMentor] = useState(false);
  const [showPastorMessage, setShowPastorMessage] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleMarkAsCompleted = async (readingId: string) => {
    setIsMarking(true);
    const readingTime = Math.floor((Date.now() - startTime) / 1000);
    
    const result = await markAsCompleted(readingId, readingTime);
    
    if (result.success) {
      setCompletedChapters(prev => new Set(prev).add(readingId));
      
      // Encontrar a leitura para obter detalhes
      const reading = dailyReadings?.find(r => r.id === readingId);
      
      // Rastrear atividade de conclusão da leitura diária
      await trackActivity('daily_reading_completed', {
        reading_id: readingId,
        book: reading?.book,
        chapter: reading?.chapter,
        reading_time_seconds: readingTime
      });
      
      toast.success('Capítulo marcado como concluído!');
    } else {
      toast.error('Erro ao marcar capítulo como concluído');
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

  if (error || !dailyReadings || dailyReadings.length === 0) {
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

  const firstReading = dailyReadings[0];
  // Format date without timezone issues
  const [year, month, day] = firstReading.date.split('-');
  const dateFormatted = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Get unique books for display
  const uniqueBooks = [...new Set(dailyReadings.map(r => r.book))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-medium">Leitura Diária - A Bíblia em 1 Ano</span>
                  </div>
                  <CardTitle className="text-3xl">
                    {uniqueBooks.join(' e ')} - {dailyReadings.length} {dailyReadings.length === 1 ? 'Capítulo' : 'Capítulos'}
                  </CardTitle>
                  <CardDescription>
                    {dateFormatted.toLocaleDateString('pt-BR', {
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
                    <span className="text-sm font-medium">Todos Concluídos</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Chapter Cards */}
          {dailyReadings.map((reading, index) => (
            <Card key={reading.id} className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{reading.book} - Capítulo {reading.chapter}</CardTitle>
                  <AudioPlayer 
                    text={reading.chapter_text} 
                    className="flex-shrink-0"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {reading.chapter_text}
                  </div>
                </div>

                {!completedChapters.has(reading.id) && (
                  <div className="pt-6 border-t">
                    <Button 
                      onClick={() => handleMarkAsCompleted(reading.id)}
                      disabled={isMarking}
                      className="w-full"
                      size="lg"
                    >
                      {isMarking ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Marcando como concluído...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar Capítulo {reading.chapter} como concluído
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Help Card */}
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="pt-6">
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

              {/* Quiz Button */}
              <div className="pt-4 mt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Teste seus conhecimentos sobre a leitura:
                </p>
                <Link to="/daily-reading-quiz">
                  <Button variant="default" className="w-full">
                    <Brain className="mr-2 h-4 w-4" />
                    Fazer Quiz da Leitura
                  </Button>
                </Link>
              </div>

              {firstReading.devotional_id && (
                <div className="pt-4 mt-4 border-t">
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
        </div>

        {showAIMentor && firstReading && (
          <DailyReadingAIMentor
            readingId={firstReading.id}
            readingContext={`Leitura bíblica de hoje: ${firstReading.book}\n\n${dailyReadings.map(r => `Capítulo ${r.chapter}:\n${r.chapter_text}`).join('\n\n')}`}
            onClose={() => setShowAIMentor(false)}
          />
        )}

        {showPastorMessage && firstReading && (
          <DailyReadingPastorMessage
            readingId={firstReading.id}
            readingReference={`${firstReading.book} - Capítulos ${dailyReadings.map(r => r.chapter).join(', ')}`}
            onClose={() => setShowPastorMessage(false)}
          />
        )}
      </div>
    </div>
  );
}